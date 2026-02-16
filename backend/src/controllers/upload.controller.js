import {
  processZipBuffer,
  processGitHubUrl,
} from "../services/upload.service.js";
import { UPLOAD_TIMEOUT, ERROR_MESSAGES } from "../utils/constants.util.js";

export const uploadFile = async (req, res) => {
  req.setTimeout(UPLOAD_TIMEOUT);
  res.setTimeout(UPLOAD_TIMEOUT);

  try {
    const { githubUrl, projectName } = req.body || {};

    if (githubUrl && typeof githubUrl === "string" && githubUrl.trim()) {
      return await handleGitHubUpload(githubUrl, projectName, res);
    }

    if (!req.file || !req.file.buffer) {
      return res
        .status(400)
        .json({ error: "Provide a .zip file or a githubUrl in body" });
    }

    return await handleZipUpload(req.file, projectName, res);
  } catch (err) {
    console.error("Upload error:", err);
    const message = err?.message || ERROR_MESSAGES.UPLOAD_FAILED;
    return res.status(500).json({ error: message });
  }
};

async function handleGitHubUpload(githubUrl, projectName, res) {
  try {
    const result = await processGitHubUrl(
      githubUrl.trim(),
      projectName?.trim() || undefined,
    );
    return res.json({
      projectId: result.projectId,
      name: result.name,
      fileCount: result.fileCount,
    });
  } catch (err) {
    console.error("GitHub import error:", err);
    return res.status(400).json({ error: ERROR_MESSAGES.GITHUB_IMPORT_FAILED });
  }
}

async function handleZipUpload(file, projectName, res) {
  try {
    const result = await processZipBuffer(
      file.buffer,
      projectName?.trim() ||
        file.originalname.replace(".zip", "") ||
        "Uploaded project",
    );
    return res.json({
      projectId: result.projectId,
      name: result.name,
      fileCount: result.fileCount,
    });
  } catch (err) {
    console.error("ZIP processing error:", err);
    return res.status(400).json({ error: ERROR_MESSAGES.INVALID_ZIP });
  }
}
