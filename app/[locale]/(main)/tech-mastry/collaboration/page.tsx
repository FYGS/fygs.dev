import { Metadata } from "next";
import { CollaborativeCoding } from "../playground/_components/collaborative-coding";

export const metadata: Metadata = {
  title: "Collaborative Coding | TechMastery",
  description:
    "Code together in real-time with your peers, practice pair programming, and prepare for technical interviews collaboratively",
};

export default function CollaborationPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <CollaborativeCoding />
    </main>
  );
}
