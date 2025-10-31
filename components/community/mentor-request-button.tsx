"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { createMentorRequest } from "@/app/actions/community-actions";

interface MentorRequestButtonProps {
  mentorId: string;
  mentorName: string;
  disabled?: boolean;
}

export function MentorRequestButton({ mentorId, mentorName, disabled }: MentorRequestButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleRequest = async () => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("mentorId", mentorId);
      formData.append("message", `I would like to request mentorship from ${mentorName}. I'm looking forward to learning from your experience.`);

      const result = await createMentorRequest(formData);

      if (result.success) {
        toast.success("Mentorship request sent successfully!");
      } else {
        toast.error(result.error || "Failed to send mentorship request");
      }
    } catch {
      toast.error("An error occurred while sending the request");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      size="sm" 
      onClick={handleRequest}
      disabled={disabled || isLoading}
    >
      <MessageCircle className="h-4 w-4 mr-2" />
      {isLoading ? "Requesting..." : "Request Mentorship"}
    </Button>
  );
}