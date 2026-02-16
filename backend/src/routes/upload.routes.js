import express from "express";
import { uploadFile } from "../controllers/upload.controller.js";
import { uploadMiddleware } from "../middleware/upload.middleware.js";

const router = express.Router();

router.post("/", uploadMiddleware, uploadFile);

export default router;
