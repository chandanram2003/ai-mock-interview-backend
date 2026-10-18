import mongoose from "mongoose";

const qaSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String }],
  correctOption: { type: String, default: "" },
  explanation: { type: String, default: "" },
  userSelectedOption: { type: String, default: "" },
  answer: { type: String, default: "" },
  feedback: { type: String, default: "" },
  score: { type: Number, default: 0 },
});

const interviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, required: true },
    difficulty: { type: String, default: "Medium" },
    mode: {
      type: String,
      enum: ["hybrid", "open-ended", "mcq"],
      default: "hybrid",
    },
    isResumeBased: { type: Boolean, default: false },
    resumeFileName: { type: String, default: "" },
    extractedSkills: [{ type: String }],
    identifiedProjects: [{ type: String }],
    questions: [qaSchema],
    totalScore: { type: Number, default: 0 },
    finalFeedback: { type: String, default: "" },
    status: {
      type: String,
      enum: ["in-progress", "completed"],
      default: "in-progress",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Interview", interviewSchema);

