import {
  CODE_EXTENSIONS,
  BINARY_OR_SKIP_PATTERNS,
} from "../utils/constants.util.js";

export function isCodeFile(path) {
  const normalized = path.replace(/\\/g, "/").toLowerCase();
  if (BINARY_OR_SKIP_PATTERNS.some((re) => re.test(normalized))) return false;
  const ext = normalized.includes(".") ? "." + normalized.split(".").pop() : "";
  return CODE_EXTENSIONS.has(ext);
}

export function parseContentToLines(content) {
  if (typeof content !== "string") return [];
  return content.split(/\r?\n/);
}

export function extractSnippet(lines, startLineOneBased, endLineOneBased) {
  const start = Math.max(0, startLineOneBased - 1);
  const end = Math.min(lines.length, endLineOneBased);
  return lines.slice(start, end).join("\n");
}
