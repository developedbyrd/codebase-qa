import mongoose from "mongoose";

const referenceSchema = new mongoose.Schema(
  {
    filePath: String,
    startLine: Number,
    endLine: Number,
    snippet: String,
  },
  { _id: false },
);

const qaSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  references: [referenceSchema],
  createdAt: { type: Date, default: Date.now },
});

qaSchema.index({ projectId: 1, createdAt: -1 });

export const QA = mongoose.model("QA", qaSchema);
