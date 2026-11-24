"use client";

import { motion } from "framer-motion";
import type { InterviewTemplate } from "./data";
import { InterviewResults } from "./interview-results";
import { InterviewTemplates } from "./interview-templates";
import type { InterviewFeedback } from "./types";

interface ReviewScreenProps {
  feedback: InterviewFeedback | null;
  selectedTemplate: string | null;
  setSelectedTemplate: (id: string) => void;
  resetInterview: () => void;
  startInterview: (template: InterviewTemplate) => void;
}

export function ReviewScreen({
  feedback,
  selectedTemplate,
  setSelectedTemplate,
  resetInterview,
  startInterview,
}: ReviewScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <InterviewResults feedback={feedback} resetInterview={resetInterview} />

      <InterviewTemplates
        selectedTemplate={selectedTemplate}
        setSelectedTemplate={setSelectedTemplate}
        startInterview={startInterview}
      />
    </motion.div>
  );
}
