import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import StreamZip from "node-stream-zip";
import axios from "axios"; // Changed from node-fetch to axios
import { Project } from "../models/project.model.js";
import { File } from "../models/file.model.js";
import { isCodeFile, parseContentToLines } from "./fileParser.service.js";
import {
  MAX_FILE_SIZE_FOR_PARSING,
  GITHUB_TIMEOUT,
  BATCH_SIZE,
  GITHUB_BRANCHES,
} from "../utils/constants.util.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, "../../uploads");
const TEMP_DIR = path.join(__dirname, "../../temp");

function ensureDirs() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
  }
}

function githubArchiveUrl(repoUrl) {
  const trimmed = repoUrl.trim().replace(/\/$/, "");
  const match = trimmed.match(/github\.com\/([^/]+)\/([^/]+)/i);
  if (!match) return null;
  const [, owner, repo] = match;

  return GITHUB_BRANCHES.map(
    (branch) =>
      `https://github.com/${owner}/${repo}/archive/refs/heads/${branch}.zip`,
  );
}

async function downloadGitHubZip(repoUrl) {
  const urls = githubArchiveUrl(repoUrl);

  if (!urls) {
    throw new Error("Invalid GitHub URL");
  }

  let lastError = null;

  for (const url of urls) {
    try {
      const response = await axios({
        method: "get",
        url: url,
        responseType: "arraybuffer", // This replaces arrayBuffer() from fetch
        timeout: GITHUB_TIMEOUT,
        maxRedirects: 5, // Handles redirects automatically
      });

      if (response.status === 200) {
        return Buffer.from(response.data); // response.data is already an ArrayBuffer with responseType: 'arraybuffer'
      }
      lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (err) {
      console.log("Failed:", url, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error("Failed to download repository");
}

async function extractZipBuffer(buffer, extractTo) {
  ensureDirs();

  const zipPath = path.join(TEMP_DIR, `upload-${Date.now()}.zip`);
  fs.writeFileSync(zipPath, buffer);

  const zip = new StreamZip.async({ file: zipPath });

  try {
    await zip.extract(null, extractTo);
    await zip.close();
  } catch (err) {
    console.error("ZIP extraction failed:", err);
    throw err;
  } finally {
    try {
      fs.unlinkSync(zipPath);
    } catch (_) {}
  }

  const entries = fs.readdirSync(extractTo);
  if (entries.length === 1) {
    const potentialRoot = path.join(extractTo, entries[0]);
    if (fs.statSync(potentialRoot).isDirectory()) {
      return potentialRoot;
    }
  }

  return extractTo;
}

function walkDir(dir, baseDir = dir, acc = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const e of entries) {
    const full = path.join(dir, e.name);
    const rel = path.relative(baseDir, full).replace(/\\/g, "/");

    if (e.isDirectory()) {
      if (
        !rel.includes("node_modules") &&
        !rel.includes(".git") &&
        !rel.includes("__pycache__") &&
        !rel.includes("dist") &&
        !rel.includes("build")
      ) {
        walkDir(full, baseDir, acc);
      }
    } else if (e.isFile()) {
      acc.push({ fullPath: full, relativePath: rel });
    }
  }

  return acc;
}

function readFileSafe(fullPath, encoding = "utf-8") {
  try {
    const stats = fs.statSync(fullPath);
    if (stats.size > MAX_FILE_SIZE_FOR_PARSING) {
      return null;
    }
    return fs.readFileSync(fullPath, encoding);
  } catch (err) {
    console.log(`Could not read file: ${fullPath}`, err.message);
    return null;
  }
}

export async function processZipBuffer(
  buffer,
  projectName = "Uploaded project",
) {
  ensureDirs();

  const extractTo = path.join(TEMP_DIR, `extract-${Date.now()}`);
  fs.mkdirSync(extractTo, { recursive: true });

  let rootPath;
  try {
    rootPath = await extractZipBuffer(buffer, extractTo);
  } catch (err) {
    console.error("Extraction failed:", err);
    try {
      fs.rmSync(extractTo, { recursive: true, force: true });
    } catch (_) {}
    throw new Error("Invalid or corrupted zip file: " + err.message);
  }

  const project = await Project.create({ name: projectName });

  const allFiles = walkDir(rootPath);

  const codeFiles = allFiles.filter(({ relativePath }) => {
    const isCode = isCodeFile(relativePath);
    return isCode;
  });

  const fileDocs = [];
  let processed = 0;

  for (const { fullPath, relativePath } of codeFiles) {
    const content = readFileSafe(fullPath);
    if (content == null) continue;

    const lines = parseContentToLines(content);
    fileDocs.push({
      projectId: project._id,
      path: relativePath,
      content,
      lines,
    });

    processed++;
  }

  for (let i = 0; i < fileDocs.length; i += BATCH_SIZE) {
    await File.insertMany(fileDocs.slice(i, i + BATCH_SIZE));
  }

  try {
    fs.rmSync(extractTo, { recursive: true, force: true });
  } catch (err) {
    console.log("Cleanup warning:", err.message);
  }

  const result = {
    projectId: project._id.toString(),
    name: project.name,
    fileCount: fileDocs.length,
  };

  return result;
}

export async function processGitHubUrl(repoUrl, projectName) {
  try {
    const buffer = await downloadGitHubZip(repoUrl);
    const name =
      projectName ||
      repoUrl.replace(/\/$/, "").split("/").pop() ||
      "GitHub repo";
    return processZipBuffer(buffer, name);
  } catch (err) {
    console.error("GitHub import failed:", err);
    throw new Error(`Failed to import GitHub repository: ${err.message}`);
  }
}
