import { topicMetadata } from "@/app/[locale]/(main)/tech-mastry/_catalog/metadata";
import PageContent from "./page-content";

export const metadata = topicMetadata("/tech-mastry/data-structures/hash-maps");

export default function Page() {
  return <PageContent />;
}
