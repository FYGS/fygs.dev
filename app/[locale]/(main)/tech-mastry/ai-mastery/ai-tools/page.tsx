import { topicMetadata } from "@/app/[locale]/(main)/tech-mastry/_catalog/metadata";
import PageContent from "./page-content";

export const metadata = topicMetadata("/tech-mastry/ai-mastery/ai-tools");

export default function Page() {
  return <PageContent />;
}
