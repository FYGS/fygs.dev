import { PgLayout } from "./_components/pg-layout";
import { topicMetadata } from "@/app/[locale]/(main)/tech-mastry/_catalog/metadata";

export const metadata = topicMetadata("/tech-mastry/playground");

export default function PlaygroundPage() {
  return <PgLayout />;
}
