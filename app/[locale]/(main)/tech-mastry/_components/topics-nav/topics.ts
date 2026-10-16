import { coreTopics } from "./sections/core";
import { engineeringTopics } from "./sections/engineering";
import { practiceTopics } from "./sections/practice";
import { webTopics } from "./sections/web";
import type { TopicSection } from "./types";

export const topics: TopicSection[] = [
  ...coreTopics,
  ...webTopics,
  ...engineeringTopics,
  ...practiceTopics,
];
