import { Suspense } from "react";
import { CommunicationGuide } from "./_components/communication-guide";
import { topicMetadata } from "@/app/[locale]/(main)/tech-mastry/_catalog/metadata";

export const metadata = topicMetadata("/tech-mastry/best-practices/communication");

export default function CommunicationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CommunicationGuide />
    </Suspense>
  );
}
