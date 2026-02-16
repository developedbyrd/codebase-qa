import mongoose from "mongoose";
import { File } from "../models/file.model.js";
import { QA } from "../models/qa.model.js";
import { searchRelevantFiles } from "../services/search.service.js";
import { askLlm } from "../services/llm.service.js";
import {
  MAX_HISTORY,
  ERROR_MESSAGES,
  HTTP_STATUS,
  REGEX,
} from "../utils/constants.util.js";

export const askQuestion = async (req, res) => {
  try {
    const { projectId, question } = req.body;

    if (!projectId || !question || typeof question !== "string") {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ error: ERROR_MESSAGES.QUESTION_REQUIRED });
    }

    const q = question.trim();
    if (!q) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ error: ERROR_MESSAGES.QUESTION_EMPTY });
    }

    if (!REGEX.OBJECT_ID.test(projectId)) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ error: ERROR_MESSAGES.INVALID_PROJECT_ID });
    }

    const fileCount = await File.countDocuments({ projectId });
    if (fileCount === 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: ERROR_MESSAGES.NO_FILES_UPLOADED,
      });
    }

    const { snippets, contextForLlm } = await searchRelevantFiles(projectId, q);

    const answer = await askLlm(q, contextForLlm);

    await QA.create({
      projectId,
      question: q,
      answer,
      references: snippets.map((s) => ({
        filePath: s.filePath,
        startLine: s.startLine,
        endLine: s.endLine,
        snippet: s.snippet,
      })),
    });

    await cleanupOldHistory(projectId);

    res.status(HTTP_STATUS.OK).json({
      answer,
      references: snippets.map((s) => ({
        filePath: s.filePath,
        startLine: s.startLine,
        endLine: s.endLine,
        snippet: s.snippet,
      })),
    });
  } catch (err) {
    console.error("Ask route error:", err);
    if (err.message?.includes("OPENROUTER")) {
      return res
        .status(HTTP_STATUS.SERVICE_UNAVAILABLE)
        .json({ error: ERROR_MESSAGES.LLM_UNAVAILABLE });
    }
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: err.message || "Ask failed",
    });
  }
};

async function cleanupOldHistory(projectId) {
  const total = await QA.countDocuments({ projectId });
  if (total > MAX_HISTORY) {
    const oldest = await QA.find({ projectId })
      .sort({ createdAt: 1 })
      .limit(total - MAX_HISTORY)
      .select("_id");
    await QA.deleteMany({ _id: { $in: oldest.map((d) => d._id) } });
  }
}
