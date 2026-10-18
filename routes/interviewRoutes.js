import express from "express";
import {
  startInterview,
  startResumeInterview,
  submitAnswer,
  finishInterview,
  getAllInterviews,
  getInterview,
  deleteInterview,
  askClarification,
} from "../controllers/interviewController.js";
import { protect } from "../middleware/authMiddleware.js";
import { handleResumeUpload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/start", protect, startInterview);
router.post("/start-resume", protect, handleResumeUpload, startResumeInterview);
router.post("/:id/answer", protect, submitAnswer);
router.post("/:id/ask-ai", protect, askClarification);
router.post("/:id/finish", protect, finishInterview);
router.get("/all", protect, getAllInterviews);
router.get("/:id", protect, getInterview);
router.delete("/:id", protect, deleteInterview);

export default router;

