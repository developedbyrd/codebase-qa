import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import uploadRoutes from "./routes/upload.routes.js";
import askRoutes from "./routes/ask.routes.js";
import historyRoutes from "./routes/history.routes.js";
import statusRoutes from "./routes/status.routes.js";
import { config } from "./configs/config.js";
import { connectDB } from "./configs/db.config.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000", "https://codebase-qa-beige.vercel.app/"],
    credentials: true,
  }),
);
app.use(helmet());
app.use(express.json());

app.use("/api/upload", uploadRoutes);
app.use("/api/ask", askRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/status", statusRoutes);

app.get("/health", (_, res) => res.json({ ok: true }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

connectDB();

app.listen(config.port, () => {
  console.log(`Backend running on port ${config.port}`);
});
