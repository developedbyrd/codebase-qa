import { QA } from "../models/qa.model.js";
import { HISTORY_LIMIT } from "../utils/constants.util.js";

export const getHistory = async (req, res) => {
  try {
    const { projectId } = req.params;

    const list = await QA.find({ projectId })
      .sort({ createdAt: -1 })
      .limit(HISTORY_LIMIT)
      .lean();

    res.json({ history: list });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to load history" });
  }
};
