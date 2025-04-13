"use client";

import { CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface FormatAnimationProps {
  show: boolean;
  onAnimationComplete: () => void;
}

export function FormatAnimation({
  show,
  onAnimationComplete,
}: FormatAnimationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        onAnimationComplete();
      }, 1500); // Match animation duration
      return () => clearTimeout(timer);
    }
  }, [show, onAnimationComplete]);

  if (!isVisible) return null;

  return (
    <>
      <div className="format-checkmark">
        <CheckCircle size={64} strokeWidth={2.5} />
      </div>
      <div className="format-success-text">
        Code formatted successfully
      </div>
    </>
  );
}
