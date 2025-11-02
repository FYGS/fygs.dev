"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface UseQuizCompletionResult {
  checkCertificate: (courseId: string) => Promise<void>;
  isChecking: boolean;
}

/**
 * Hook for checking certificate eligibility after quiz completion
 * Fetches course completion status and shows toast if certificate earned
 */
export function useQuizCompletion(): UseQuizCompletionResult {
  const [isChecking, setIsChecking] = useState(false);
  const router = useRouter();

  const checkCertificate = async (courseId: string) => {
    try {
      setIsChecking(true);

      // Fetch updated progress summary
      const response = await fetch(
        `/api/progress/summary?courseId=${courseId}`
      );

      if (!response.ok) {
        throw new Error("Failed to check progress");
      }

      const data = await response.json();

      // Check if certificate was just earned
      if (data.justEarnedCertificate) {
        toast.success("Congratulations! You've earned a certificate!", {
          description: "Check your certificates page to download it.",
          duration: 5000,
        });

        // Optionally refresh the current page to show updated status
        router.refresh();
      }
    } catch (error) {
      console.error("Error checking certificate eligibility:", error);
      // Don't show error toast to user - this is a background check
    } finally {
      setIsChecking(false);
    }
  };

  return {
    checkCertificate,
    isChecking,
  };
}
