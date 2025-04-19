import { Metadata } from "next";
import { AccessibilityHero } from "./_components/hero";
import { AccessibilityContent } from "./_components/content";

export const metadata: Metadata = {
  title: "Accessibility & UX | Interview Prep",
  description:
    "Best practices for creating accessible and user-friendly interfaces in React applications",
};

export default function AccessibilityPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <AccessibilityHero />
      <AccessibilityContent />
    </main>
  );
}
