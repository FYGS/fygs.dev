"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { respondToMentorRequest } from "@/app/actions/community-actions";

interface MentorResponseButtonsProps {
  requestId: string;
  onResponse?: () => void;
}

export function MentorResponseButtons({ requestId, onResponse }: MentorResponseButtonsProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleResponse = async (action: "accept" | "decline") => {
    setIsLoading(true);
    try {
      const result = await respondToMentorRequest(requestId, action);

      if (result.success) {
        toast.success(`Mentorship request ${action}ed successfully!`);
        onResponse?.();
      } else {
        toast.error(result.error || `Failed to ${action} mentorship request`);
      }
    } catch {
      toast.error("An error occurred while processing the request");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button 
        size="sm" 
        onClick={() => handleResponse("accept")}
        disabled={isLoading}
      >
        <Check className="h-4 w-4 mr-1" />
        Accept
      </Button>
      <Button 
        size="sm" 
        variant="outline" 
        onClick={() => handleResponse("decline")}
        disabled={isLoading}
      >
        <X className="h-4 w-4 mr-1" />
        Decline
      </Button>
    </>
  );
}