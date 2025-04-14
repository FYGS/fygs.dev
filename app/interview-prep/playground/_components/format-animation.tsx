"use client";

import { useEffect } from "react";
import { triggerSuccessConfetti } from "../_utils/confetti";

// This component listens for format-success events and triggers confetti
export function FormatAnimation() {
  useEffect(() => {
    // Function to handle the format success event
    const handleFormatSuccess = () => {
      // Trigger confetti animation
      triggerSuccessConfetti();
    };

    // Add event listener for format-success
    window.addEventListener("format-success", handleFormatSuccess);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener("format-success", handleFormatSuccess);
    };
  }, []);

  // No visible UI elements - just confetti
  return null;
}
