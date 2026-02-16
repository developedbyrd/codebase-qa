import { File } from "../models/file.model.js";
import {
  SEARCH_TOP_K,
  MIN_RELEVANCE_SCORE,
  CONTEXT_LINES,
  KEYWORD_MIN_LENGTH,
  TECH_KEYWORDS,
  STOP_WORDS,
  ERROR_MESSAGES,
} from "../utils/constants.util.js";

export async function searchRelevantFiles(
  projectId,
  question,
  topK = SEARCH_TOP_K,
) {
  const keywords = extractKeywords(question);

  if (keywords.length === 0) {
    return {
      snippets: [],
      contextForLlm: ERROR_MESSAGES.NO_KEYWORDS,
    };
  }

  const allFiles = await File.find({ projectId }).lean();

  if (allFiles.length === 0) {
    return {
      snippets: [],
      contextForLlm: ERROR_MESSAGES.NO_FILES,
    };
  }

  const scoredFiles = [];

  for (const file of allFiles) {
    const score = calculateExactMatchScore(file, keywords, question);
    if (score >= MIN_RELEVANCE_SCORE) {
      scoredFiles.push({ ...file, score });
    }
  }

  scoredFiles.sort((a, b) => b.score - a.score);

  scoredFiles.slice(0, 5).forEach((f, i) => {
    console.log(`   ${i + 1}. ${f.path} (score: ${f.score})`);
  });

  if (scoredFiles.length === 0) {
    return {
      snippets: [],
      contextForLlm: `No files found containing: ${keywords.join(", ")}`,
    };
  }

  const topFiles = scoredFiles.slice(0, topK);

  const references = [];
  let contextForLlm = "";

  for (const file of topFiles) {
    const snippets = extractExactSnippets(file, keywords);

    for (const snippet of snippets) {
      references.push({
        filePath: file.path,
        startLine: snippet.startLine,
        endLine: snippet.endLine,
        snippet: snippet.content,
      });

      contextForLlm += `\n[FILE: ${file.path} (lines ${snippet.startLine}-${snippet.endLine})]\n${snippet.content}\n`;
    }
  }

  return {
    snippets: references,
    contextForLlm: contextForLlm.trim(),
  };
}

function calculateExactMatchScore(file, keywords, question) {
  let score = 0;
  const path = file.path.toLowerCase();
  const content = file.content || "";
  const contentLower = content.toLowerCase();
  const questionLower = question.toLowerCase();

  if (
    !questionLower.includes("readme") &&
    !questionLower.includes("documentation")
  ) {
    if (path.includes("readme")) {
      return 0;
    }
  }

  if (path.includes("package-lock.json")) {
    return 0;
  }

  if (path.includes(".env")) {
    return 0;
  }

  if (
    !questionLower.includes("config") &&
    !questionLower.includes("setting") &&
    !questionLower.includes("configuration")
  ) {
    if (
      path.includes(".config.") ||
      path.includes("/config/") ||
      path.includes("tsconfig") ||
      path.includes("eslint") ||
      path.includes("prettier") ||
      path.includes("vite.config") ||
      path.includes("webpack.config") ||
      path.includes("babel.config")
    ) {
      return 0;
    }
  }

  if (!questionLower.includes("test") && !questionLower.includes("spec")) {
    if (
      path.includes(".test.") ||
      path.includes(".spec.") ||
      path.includes("__tests__") ||
      path.includes("/test/") ||
      path.includes("/tests/")
    ) {
      return 0;
    }
  }

  if (
    path.includes("/dist/") ||
    path.includes("/build/") ||
    path.includes("/.next/") ||
    path.includes("/.nuxt/")
  ) {
    return 0;
  }

  for (const kw of keywords) {
    const kwLower = kw.toLowerCase();

    const regex = new RegExp(`\\b${escapeRegex(kwLower)}\\b`, "gi");
    const matches = content.match(regex);

    if (matches) {
      score += matches.length * 20;

      const lines = content.split("\n");
      for (let i = 0; i < Math.min(lines.length, 30); i++) {
        if (lines[i].toLowerCase().includes(kwLower)) {
          if (
            lines[i].includes("function") ||
            lines[i].includes("class") ||
            lines[i].includes("const") ||
            lines[i].includes("let") ||
            lines[i].includes("export") ||
            lines[i].includes("import")
          ) {
            score += 30;
          }
          break;
        }
      }
    }

    const filename = path.split("/").pop() || "";
    if (filename.includes(kwLower)) {
      score += 50;
    }

    if (kwLower === "controller" && path.includes("/controllers/")) score += 40;
    if (kwLower === "service" && path.includes("/services/")) score += 40;
    if (kwLower === "model" && path.includes("/models/")) score += 40;
    if (kwLower === "route" && path.includes("/routes/")) score += 40;
    if (kwLower === "middleware" && path.includes("/middleware/")) score += 40;
    if (
      kwLower === "util" &&
      (path.includes("/utils/") || path.includes("/helpers/"))
    )
      score += 30;
  }

  if (
    questionLower.includes("tech") ||
    questionLower.includes("technology") ||
    questionLower.includes("stack") ||
    questionLower.includes("dependencies") ||
    questionLower.includes("package")
  ) {
    if (path.endsWith("package.json")) {
      try {
        const pkg = JSON.parse(content);
        if (pkg.dependencies || pkg.devDependencies) {
          score += 200;
        }
      } catch (e) {}
    }

    for (const tech of TECH_KEYWORDS) {
      if (contentLower.includes(tech)) {
        score += 30;
      }
    }
  }

  return score;
}

function extractExactSnippets(file, keywords, contextLines = CONTEXT_LINES) {
  const lines = file.content?.split("\n") || [];
  const snippets = [];
  const keywordSet = new Set(keywords.map((k) => k.toLowerCase()));

  if (lines.length === 0) {
    return [];
  }

  const matchingLines = [];

  for (let i = 0; i < lines.length; i++) {
    const lineLower = lines[i].toLowerCase();
    for (const kw of keywordSet) {
      if (lineLower.includes(kw)) {
        matchingLines.push({
          index: i,
          line: lines[i],
          keyword: kw,
        });
        break;
      }
    }
  }

  if (matchingLines.length === 0) {
    return [];
  }

  let currentGroup = [matchingLines[0]];

  for (let i = 1; i < matchingLines.length; i++) {
    const prevLine = matchingLines[i - 1].index;
    const currLine = matchingLines[i].index;

    if (currLine - prevLine <= contextLines * 2) {
      currentGroup.push(matchingLines[i]);
    } else {
      if (currentGroup.length > 0) {
        const start = Math.max(0, currentGroup[0].index - contextLines);
        const end = Math.min(
          lines.length - 1,
          currentGroup[currentGroup.length - 1].index + contextLines,
        );

        snippets.push({
          startLine: start + 1,
          endLine: end + 1,
          content: lines.slice(start, end + 1).join("\n"),
        });
      }
      currentGroup = [matchingLines[i]];
    }
  }

  if (currentGroup.length > 0) {
    const start = Math.max(0, currentGroup[0].index - contextLines);
    const end = Math.min(
      lines.length - 1,
      currentGroup[currentGroup.length - 1].index + contextLines,
    );

    snippets.push({
      startLine: start + 1,
      endLine: end + 1,
      content: lines.slice(start, end + 1).join("\n"),
    });
  }

  return snippets;
}

function extractKeywords(question) {
  const questionLower = question.toLowerCase();

  const cleaned = questionLower
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const words = cleaned.split(" ");

  const keywords = [];

  for (const word of words) {
    if (word.length < KEYWORD_MIN_LENGTH) continue;

    if (TECH_KEYWORDS.includes(word)) {
      keywords.push(word);
      continue;
    }

    if (STOP_WORDS.has(word)) continue;

    if (/[a-z][A-Z]/.test(word) || word.includes("_")) {
      keywords.push(word);
      continue;
    }

    if (word.length > 3) {
      keywords.push(word);
    }
  }

  if (
    questionLower.includes("tech stack") ||
    questionLower.includes("technology used")
  ) {
    keywords.push("package.json");
  }

  if (questionLower.includes("openrouter")) {
    keywords.push("openrouter");
  }

  return [...new Set(keywords)];
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
