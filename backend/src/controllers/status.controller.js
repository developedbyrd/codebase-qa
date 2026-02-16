import mongoose from "mongoose";
import { checkLlmConnection } from "../services/llm.service.js";
import { HTTP_STATUS } from "../utils/constants.util.js";

export const getStatus = async (req, res) => {
  const database = mongoose.connection.readyState === 1 ? "connected" : "error";
  const llm = await checkLlmConnection();

  res.status(HTTP_STATUS.OK).json({
    backend: "ok",
    database,
    llm,
  });
};
