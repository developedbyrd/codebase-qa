import express from "express";
import { getHistory } from "../controllers/history.controller.js";

const router = express.Router();

router.get("/:projectId", getHistory);

export default router;
