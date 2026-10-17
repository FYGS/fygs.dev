import { Metadata } from "next";
import { AccessibilityContent } from "./_components/content";
import { AccessibilityHero } from "./_components/hero";

export const metadata: Metadata = {
  title: "Accessibility & UX | TechMastry",
  description:
    "Best practices for creating accessible and user-friendly interfaces in React applications",
};

export default function AccessibilityPage() {
  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      <AccessibilityHero />
      <AccessibilityContent />
    </div>
  );
}
