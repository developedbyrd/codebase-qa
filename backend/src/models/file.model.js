import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  path: { type: String, required: true },
  content: { type: String, required: true },
  lines: [{ type: String }],
});

fileSchema.index({ projectId: 1 });
fileSchema.index({ projectId: 1, path: 1 }, { unique: true });

export const File = mongoose.model("File", fileSchema);
