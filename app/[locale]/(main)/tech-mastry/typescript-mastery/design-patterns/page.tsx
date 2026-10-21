import { topicMetadata } from "@/app/[locale]/(main)/tech-mastry/_catalog/metadata";
import PageContent from "./page-content";

export const metadata = topicMetadata("/tech-mastry/typescript-mastery/design-patterns");

export default function Page() {
  return <PageContent />;
}
