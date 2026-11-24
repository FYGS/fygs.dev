import type { Scenario } from "./types";

// Helper function to get request interval based on scenario
export const getRequestInterval = (scenario: Scenario): number => {
  switch (scenario) {
    case "normal":
      return 1000; // 1 request per second
    case "high-load":
      return 300; // ~3 requests per second
    case "failure":
      return 800; // ~1.25 requests per second
    default:
      return 1000;
  }
};
