import { Metadata } from "next";
import { Suspense } from "react";
import { CommunicationGuide } from "./_components/communication-guide";

export const metadata: Metadata = {
  title: "Communication Skills | Interview Best Practices",
  description:
    "Learn effective communication techniques for technical interviews.",
};

export default function CommunicationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CommunicationGuide />
    </Suspense>
  );
}
