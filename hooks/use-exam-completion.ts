"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface UseExamCompletionResult {
  checkCertificate: (courseId: string, autoRedirect?: boolean) => Promise<void>;
  isChecking: boolean;
}

/**
 * Hook for checking certificate eligibility after final exam completion
 * Fetches course completion status, shows toast, and optionally redirects to certificates
 */
export function useExamCompletion(): UseExamCompletionResult {
  const [isChecking, setIsChecking] = useState(false);
  const router = useRouter();

  const checkCertificate = async (courseId: string, autoRedirect = true) => {
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
        toast.success("Congratulations! You've completed the course!", {
          description: "Your certificate is ready to download.",
          duration: 5000,
        });

        // Auto-redirect to certificates page to view/download certificate
        if (autoRedirect) {
          setTimeout(() => {
            router.push(`/dashboard/certificates?courseId=${courseId}`);
          }, 1500); // Small delay to let user see the toast
        } else {
          // Just refresh to show updated status
          router.refresh();
        }
      } else if (data.completion >= 90) {
        // User is close but hasn't met all requirements
        toast.info("Almost there!", {
          description:
            "You're close to earning your certificate. Complete all requirements to unlock it.",
          duration: 4000,
        });
      }
    } catch (error) {
      console.error("Error checking certificate eligibility:", error);
      toast.error("Failed to check certificate status", {
        description: "Please try again later.",
      });
    } finally {
      setIsChecking(false);
    }
  };

  return {
    checkCertificate,
    isChecking,
  };
}
