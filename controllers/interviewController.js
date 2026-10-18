import mongoose from "mongoose";
import Interview from "../models/Interview.js";
import {
  generateQuestions,
  generateResumeInterviewQuestions,
  evaluateAnswer,
  generateFinalReport,
  askAIClarification,
} from "../services/aiService.js";
import { extractTextFromResume } from "../services/resumeParser.js";

export const startResumeInterview = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Please upload your resume in PDF (.pdf) or Word (.docx) format.",
      });
    }

    const { questionCount } = req.body;
    const interviewMode = "open-ended"; // Resume interview is always a realistic conversational mock interview
    const count = Math.min(Math.max(Number(questionCount) || 5, 3), 20);

    // Extract raw text from uploaded resume buffer
    const resumeText = await extractTextFromResume(
      req.file.buffer,
      req.file.mimetype,
      req.file.originalname
    );

    if (!resumeText || resumeText.length < 50) {
      return res.status(400).json({
        message:
          "Unable to extract readable text from the uploaded resume. Please verify the document contains selectable text and try again.",
      });
    }

    // Automatically analyze skills, seniority & projects from the resume and generate questions
    const {
      detectedRole,
      detectedDifficulty,
      extractedSkills,
      identifiedProjects,
      questions,
    } = await generateResumeInterviewQuestions(
      resumeText,
      "Adaptive",
      count,
      interviewMode
    );

    if (!questions || questions.length === 0) {
      return res.status(500).json({
        message: "Failed to generate interview questions from resume. Please try again.",
      });
    }

    const interview = await Interview.create({
      user: req.user.id,
      role: detectedRole || "Resume Technical Profile",
      difficulty: detectedDifficulty || "Adaptive (Resume Analyzed)",
      mode: interviewMode,
      isResumeBased: true,
      resumeFileName: req.file.originalname,
      extractedSkills: extractedSkills || [],
      identifiedProjects: identifiedProjects || [],
      questions: questions.map((q) => ({
        question: q.question,
        options: q.options || [],
        correctOption: q.correctOption || "",
        explanation: q.explanation || "",
      })),
    });

    res.status(201).json(interview);
  } catch (err) {
    console.error("Start resume interview error:", err);
    res.status(500).json({
      message: err.message || "Failed to start resume-based interview",
    });
  }
};

export const startInterview = async (req, res) => {
  try {
    const { role, difficulty, questionCount, mode } = req.body;
    if (!role || typeof role !== "string" || !role.trim()) {
      return res.status(400).json({ message: "Role is required" });
    }

    const interviewMode = mode || "mcq";
    const count = Math.min(Math.max(Number(questionCount) || 10, 3), 20);
    const questions = await generateQuestions(
      role.trim(),
      difficulty || "Medium",
      count,
      interviewMode
    );

    if (!questions || questions.length === 0) {
      return res.status(500).json({ message: "Failed to generate interview questions. Please try again." });
    }

    const interview = await Interview.create({
      user: req.user.id,
      role: role.trim(),
      difficulty: difficulty || "Medium",
      mode: interviewMode,
      questions: questions.map((q) => ({
        question: q.question,
        options: q.options || [],
        correctOption: q.correctOption || "",
        explanation: q.explanation || "",
      })),
    });

    res.status(201).json(interview);
  } catch (err) {
    console.error("Start interview error:", err);
    res.status(500).json({ message: err.message || "Failed to start interview" });
  }
};

export const submitAnswer = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid interview ID" });
    }

    const { questionIndex, answer, selectedOption } = req.body;

    if (
      questionIndex === undefined ||
      questionIndex === null ||
      typeof questionIndex !== "number" ||
      questionIndex < 0
    ) {
      return res.status(400).json({ message: "Valid numeric questionIndex is required" });
    }

    const chosenText = (answer || selectedOption || "").trim();
    if (!chosenText) {
      return res.status(400).json({ message: "Please provide an answer or speak into microphone" });
    }

    const interview = await Interview.findOne({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    if (interview.status === "completed") {
      return res.status(400).json({ message: "Interview is already completed" });
    }

    if (!interview.questions || !interview.questions[questionIndex]) {
      return res.status(400).json({
        message: `questionIndex ${questionIndex} is out of bounds (total questions: ${interview.questions.length})`,
      });
    }

    const q = interview.questions[questionIndex];
    const { score, feedback, isCorrect } = await evaluateAnswer(
      q,
      chosenText,
      selectedOption || ""
    );

    interview.questions[questionIndex].userSelectedOption = selectedOption || "";
    interview.questions[questionIndex].answer = chosenText;
    interview.questions[questionIndex].score = score;
    interview.questions[questionIndex].feedback = feedback;
    await interview.save();

    res.json({
      questionIndex,
      score,
      feedback,
      isCorrect,
      correctOption: q.correctOption || "",
      explanation: q.explanation || "",
      userSelectedOption: interview.questions[questionIndex].userSelectedOption,
      answer: chosenText,
    });
  } catch (err) {
    console.error("Submit answer error:", err);
    res.status(500).json({ message: err.message || "Evaluation failed" });
  }
};

export const finishInterview = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid interview ID" });
    }

    const interview = await Interview.findOne({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    // If already completed, return existing result directly
    if (interview.status === "completed") {
      return res.json(interview);
    }

    const questionsList = interview.questions || [];
    const total = questionsList.reduce(
      (sum, q) => sum + (typeof q.score === "number" ? q.score : 0),
      0
    );
    const avg = questionsList.length > 0 ? total / questionsList.length : 0;

    const finalFeedback = await generateFinalReport(
      interview.role,
      questionsList
    );

    interview.totalScore = Math.round(avg * 10) / 10;
    interview.finalFeedback = finalFeedback;
    interview.status = "completed";
    await interview.save();

    res.json(interview);
  } catch (err) {
    console.error("Finish interview error:", err);
    res.status(500).json({ message: err.message || "Failed to finish interview" });
  }
};

export const getAllInterviews = async (req, res) => {
  try {
    const list = await Interview.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .select("role difficulty totalScore status mode createdAt questions isResumeBased resumeFileName extractedSkills");
    
    // Add summary count of questions and answered questions
    const formatted = list.map((doc) => {
      const qCount = doc.questions ? doc.questions.length : 0;
      const answeredCount = doc.questions ? doc.questions.filter((q) => q.answer).length : 0;
      return {
        _id: doc._id,
        role: doc.role,
        difficulty: doc.difficulty,
        mode: doc.mode || "open-ended",
        totalScore: doc.totalScore,
        status: doc.status,
        createdAt: doc.createdAt,
        totalQuestions: qCount,
        answeredQuestions: answeredCount,
        isResumeBased: !!doc.isResumeBased,
        resumeFileName: doc.resumeFileName || "",
        extractedSkills: doc.extractedSkills || [],
      };
    });

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getInterview = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid interview ID" });
    }

    const interview = await Interview.findOne({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    // Clone interview to format question visibility
    const interviewObj = interview.toObject();

    // If interview is in-progress, preserve options but don't leak correctOption on unanswered questions
    if (interviewObj.status === "in-progress" && Array.isArray(interviewObj.questions)) {
      interviewObj.questions = interviewObj.questions.map((q) => {
        const isAnswered = !!(q.answer || q.userSelectedOption);
        return {
          _id: q._id,
          question: q.question,
          options: q.options || [],
          userSelectedOption: q.userSelectedOption,
          answer: q.answer,
          score: q.score,
          feedback: q.feedback,
          // Only show correctOption and explanation if already answered
          correctOption: isAnswered ? q.correctOption : undefined,
          explanation: isAnswered ? q.explanation : undefined,
        };
      });
    }

    res.json(interviewObj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteInterview = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid interview ID" });
    }
    const interview = await Interview.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }
    res.json({ message: "Interview deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const askClarification = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid interview ID" });
    }
    const { questionIndex, userQuery } = req.body;
    const interview = await Interview.findOne({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }
    const q = interview.questions[questionIndex];
    if (!q) {
      return res.status(400).json({ message: "Question index out of bounds" });
    }
    const hint = await askAIClarification(q.question, userQuery || "");
    res.json({ hint });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to get AI clarification" });
  }
};


