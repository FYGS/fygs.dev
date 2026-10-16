import { createLogger } from "@/lib/structured-logger";

// Create logger for webhook processing
export const logger = createLogger({ operation: "stripe-webhook" });
