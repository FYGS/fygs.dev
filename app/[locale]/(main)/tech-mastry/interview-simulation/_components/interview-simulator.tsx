"use client";

import { useState, useEffect, useRef } from "react";
import { ActiveInterview } from "./interview-simulator/active-interview";
import {
  generateMockFeedback,
  type InterviewTemplate,
} from "./interview-simulator/data";
import { PracticeTabs } from "./interview-simulator/practice-tabs";
import { ReviewScreen } from "./interview-simulator/review-screen";
import type {
  InterviewFeedback,
  InterviewSession,
  Question,
} from "./interview-simulator/types";

export function InterviewSimulator() {
  const [activeTab, setActiveTab] = useState("technical");
  const [interviewMode, setInterviewMode] = useState<
    "inactive" | "active" | "review"
  >("inactive");
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [interviewSession, setInterviewSession] =
    useState<InterviewSession | null>(null);
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  // Start an interview session
  const startInterview = (template: InterviewTemplate) => {
    const session: InterviewSession = {
      id: crypto.randomUUID(),
      title: template.title,
      description: template.description,
      questions: template.questions as Question[],
      currentQuestionIndex: 0,
      userAnswers: [],
      scores: [],
      completed: false,
    };

    setInterviewSession(session);
    setCurrentQuestion(template.questions[0] as Question);
    setUserAnswer("");
    setInterviewMode("active");
    setTimeRemaining(
      template.questions[0].timeLimit
        ? template.questions[0].timeLimit * 60
        : 300
    ); // default to 5 min if no time limit
  };

  // Move to next question
  const nextQuestion = () => {
    if (!interviewSession) return;

    const nextIndex = interviewSession.currentQuestionIndex + 1;
    if (nextIndex < interviewSession.questions.length) {
      const updatedSession = {
        ...interviewSession,
        currentQuestionIndex: nextIndex,
        userAnswers: [...interviewSession.userAnswers, userAnswer],
      };

      setInterviewSession(updatedSession);
      setCurrentQuestion(interviewSession.questions[nextIndex]);
      setUserAnswer("");
      setTimeRemaining(
        interviewSession.questions[nextIndex].timeLimit
          ? interviewSession.questions[nextIndex].timeLimit * 60
          : 300
      );
    } else {
      finishInterview();
    }
  };

  // Move to previous question
  const prevQuestion = () => {
    if (!interviewSession || interviewSession.currentQuestionIndex === 0)
      return;

    const prevIndex = interviewSession.currentQuestionIndex - 1;
    const updatedSession = {
      ...interviewSession,
      currentQuestionIndex: prevIndex,
    };

    setInterviewSession(updatedSession);
    setCurrentQuestion(interviewSession.questions[prevIndex]);
    setUserAnswer(interviewSession.userAnswers[prevIndex] || "");
    setTimeRemaining(
      interviewSession.questions[prevIndex].timeLimit
        ? interviewSession.questions[prevIndex].timeLimit * 60
        : 300
    );
  };

  // Finish interview and generate feedback
  const finishInterview = () => {
    if (!interviewSession) return;

    // Add the last answer
    const updatedSession = {
      ...interviewSession,
      userAnswers: [...interviewSession.userAnswers, userAnswer],
      completed: true,
      endTime: new Date(),
    };

    setInterviewSession(updatedSession);
    setInterviewMode("review");

    // Generate mock feedback
    const mockFeedback: InterviewFeedback = generateMockFeedback();

    setFeedback(mockFeedback);
  };

  // Reset interview
  const resetInterview = () => {
    setInterviewSession(null);
    setCurrentQuestion(null);
    setUserAnswer("");
    setInterviewMode("inactive");
    setFeedback(null);
  };

  // Toggle recording
  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  // Toggle video
  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
  };

  // Toggle audio
  const toggleAudio = () => {
    setIsAudioOn(!isAudioOn);
  };

  // Always call the nextQuestion of the latest render from the timer below
  const nextQuestionRef = useRef(nextQuestion);
  useEffect(() => {
    nextQuestionRef.current = nextQuestion;
  });

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (interviewMode === "active" && timeRemaining > 0) {
      timer = setTimeout(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    } else if (interviewMode === "active" && timeRemaining === 0) {
      // Time's up - automatically move to next question
      timer = setTimeout(() => nextQuestionRef.current(), 0);
    }

    return () => clearTimeout(timer);
  }, [interviewMode, timeRemaining]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Simulateur d&apos;entretien
        </h1>
        <p className="text-muted-foreground mt-2">
          Entraînez-vous aux entretiens techniques, comportementaux et de
          System Design grâce à des simulations réalistes et des retours
          personnalisés
        </p>
      </div>

      {interviewMode === "inactive" ? (
        <PracticeTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      ) : interviewMode === "active" ? (
        <ActiveInterview
          interviewSession={interviewSession}
          currentQuestion={currentQuestion}
          timeRemaining={timeRemaining}
          userAnswer={userAnswer}
          setUserAnswer={setUserAnswer}
          isAudioOn={isAudioOn}
          isVideoOn={isVideoOn}
          isRecording={isRecording}
          toggleAudio={toggleAudio}
          toggleVideo={toggleVideo}
          toggleRecording={toggleRecording}
          prevQuestion={prevQuestion}
          nextQuestion={nextQuestion}
        />
      ) : (
        <ReviewScreen
          feedback={feedback}
          selectedTemplate={selectedTemplate}
          setSelectedTemplate={setSelectedTemplate}
          resetInterview={resetInterview}
          startInterview={startInterview}
        />
      )}
    </div>
  );
}
