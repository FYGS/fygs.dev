/**
 * Structured logging wrapper for learning platform events
 *
 * Provides correlation ID tracking and structured event logging for
 * state transitions and critical business operations (FR-040).
 *
 * Features:
 * - Correlation ID generation and propagation
 * - Structured event data with proper context
 * - Different log levels for various event types
 * - Integration with analytics system for business events
 * - PII-safe logging practices
 */

type LogLevel = "debug" | "info" | "warn" | "error";

type LogContext = {
  userId?: string;
  sessionId?: string;
  correlationId?: string;
  operation?: string;
  resourceId?: string;
  resourceType?: string;
  timestamp?: string;
  eventType?: string;
  fromState?: string;
  toState?: string;
  duration?: number;
  metadata?: Record<string, any>;
};

type LogEvent = {
  level: LogLevel;
  message: string;
  context: LogContext;
  error?: Error;
};

class StructuredLogger {
  private static instance: StructuredLogger;
  private correlationIdPrefix = "log";

  static getInstance(): StructuredLogger {
    if (!StructuredLogger.instance) {
      StructuredLogger.instance = new StructuredLogger();
    }
    return StructuredLogger.instance;
  }

  /**
   * Generate a new correlation ID for tracking related operations
   */
  generateCorrelationId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${this.correlationIdPrefix}_${timestamp}_${random}`;
  }

  /**
   * Create a child logger with inherited correlation context
   */
  withContext(context: Partial<LogContext>): ContextLogger {
    return new ContextLogger(this, context);
  }

  /**
   * Log a debug message
   */
  debug(message: string, context: LogContext = {}) {
    this.log("debug", message, context);
  }

  /**
   * Log an info message
   */
  info(message: string, context: LogContext = {}) {
    this.log("info", message, context);
  }

  /**
   * Log a warning
   */
  warn(message: string, context: LogContext = {}) {
    this.log("warn", message, context);
  }

  /**
   * Log an error
   */
  error(message: string, context: LogContext = {}, error?: Error) {
    this.log("error", message, context, error);
  }

  /**
   * Log a business event (enrollment, purchase, etc.)
   */
  businessEvent(event: string, context: LogContext = {}) {
    this.log("info", `[BUSINESS_EVENT] ${event}`, {
      ...context,
      eventType: "business",
      operation: event,
    });
  }

  /**
   * Log a state transition event
   */
  stateTransition(
    resource: string,
    fromState: string,
    toState: string,
    context: LogContext = {},
  ) {
    this.log(
      "info",
      `[STATE_TRANSITION] ${resource}: ${fromState} → ${toState}`,
      {
        ...context,
        eventType: "state_transition",
        fromState,
        toState,
        resourceType: resource,
      },
    );
  }

  /**
   * Log a security event
   */
  securityEvent(event: string, context: LogContext = {}) {
    this.log("warn", `[SECURITY] ${event}`, {
      ...context,
      eventType: "security",
    });
  }

  /**
   * Log a performance event
   */
  performanceEvent(
    operation: string,
    duration: number,
    context: LogContext = {},
  ) {
    this.log("info", `[PERFORMANCE] ${operation} completed in ${duration}ms`, {
      ...context,
      eventType: "performance",
      operation,
      duration,
    });
  }

  /**
   * Core logging method
   */
  private log(
    level: LogLevel,
    message: string,
    context: LogContext = {},
    error?: Error,
  ) {
    const logEvent: LogEvent = {
      level,
      message,
      context: {
        ...context,
        timestamp: context.timestamp || new Date().toISOString(),
        correlationId: context.correlationId || this.generateCorrelationId(),
      },
      error,
    };

    // Sanitize PII from context
    const sanitizedEvent = this.sanitizeEvent(logEvent);

    // Output to console in development and test environments
    if (process.env.NODE_ENV !== "production") {
      this.consoleOutput(sanitizedEvent);
    }

    // In production, send to logging service (DataDog, CloudWatch, etc.)
    if (process.env.NODE_ENV === "production") {
      this.productionOutput(sanitizedEvent);
    }
  }

  /**
   * Remove PII from log events
   */
  private sanitizeEvent(event: LogEvent): LogEvent {
    const piiFields = [
      "email",
      "name",
      "firstName",
      "lastName",
      "address",
      "phone",
      "ip",
    ];

    const sanitizedContext = { ...event.context };
    const sanitizedMetadata = { ...sanitizedContext.metadata };

    // Remove PII from top-level context
    piiFields.forEach((field) => {
      if (sanitizedContext[field as keyof LogContext]) {
        delete sanitizedContext[field as keyof LogContext];
      }
    });

    // Remove PII from metadata
    if (sanitizedMetadata) {
      piiFields.forEach((field) => {
        if (sanitizedMetadata[field]) {
          delete sanitizedMetadata[field];
        }
      });
      sanitizedContext.metadata = sanitizedMetadata;
    }

    return {
      ...event,
      context: sanitizedContext,
    };
  }

  /**
   * Console output for development
   */
  private consoleOutput(event: LogEvent) {
    const { level, message, context, error } = event;

    const logData = {
      level,
      message,
      correlationId: context.correlationId,
      timestamp: context.timestamp,
      ...context,
    };

    switch (level) {
      case "debug":
        console.debug("[LOG]", logData);
        break;
      case "info":
        console.info("[LOG]", logData);
        break;
      case "warn":
        console.warn("[LOG]", logData);
        break;
      case "error":
        console.error("[LOG]", logData, error);
        break;
    }
  }

  /**
   * Production logging output (placeholder)
   */
  private productionOutput(event: LogEvent) {
    // In production, this would send to your logging service
    // For now, we'll just use console.log with JSON format
    console.log(
      JSON.stringify({
        ...event,
        timestamp: event.context.timestamp,
        correlationId: event.context.correlationId,
      }),
    );
  }
}

/**
 * Context logger that inherits correlation ID and other context
 */
class ContextLogger {
  constructor(
    private logger: StructuredLogger,
    private inheritedContext: Partial<LogContext>,
  ) {}

  debug(message: string, context: LogContext = {}) {
    this.logger.debug(message, { ...this.inheritedContext, ...context });
  }

  info(message: string, context: LogContext = {}) {
    this.logger.info(message, { ...this.inheritedContext, ...context });
  }

  warn(message: string, context: LogContext = {}) {
    this.logger.warn(message, { ...this.inheritedContext, ...context });
  }

  error(message: string, context: LogContext = {}, error?: Error) {
    this.logger.error(message, { ...this.inheritedContext, ...context }, error);
  }

  businessEvent(event: string, context: LogContext = {}) {
    this.logger.businessEvent(event, { ...this.inheritedContext, ...context });
  }

  stateTransition(
    resource: string,
    fromState: string,
    toState: string,
    context: LogContext = {},
  ) {
    this.logger.stateTransition(resource, fromState, toState, {
      ...this.inheritedContext,
      ...context,
    });
  }

  securityEvent(event: string, context: LogContext = {}) {
    this.logger.securityEvent(event, { ...this.inheritedContext, ...context });
  }

  performanceEvent(
    operation: string,
    duration: number,
    context: LogContext = {},
  ) {
    this.logger.performanceEvent(operation, duration, {
      ...this.inheritedContext,
      ...context,
    });
  }

  /**
   * Create a new child logger with additional context
   */
  withContext(additionalContext: Partial<LogContext>): ContextLogger {
    return new ContextLogger(this.logger, {
      ...this.inheritedContext,
      ...additionalContext,
    });
  }
}

// Export singleton instance
export const logger = StructuredLogger.getInstance();

// Export types for use in other modules
export type { LogLevel, LogContext, LogEvent };
export { ContextLogger };

// Convenience exports for common patterns
export const createLogger = (context: Partial<LogContext>) =>
  logger.withContext(context);
export const createCorrelationId = () => logger.generateCorrelationId();

/**
 * Performance timing decorator for server actions
 */
export function withPerformanceLogging<T extends any[], R>(
  operation: string,
  fn: (...args: T) => Promise<R>,
) {
  return async (...args: T): Promise<R> => {
    const start = Date.now();
    const correlationId = logger.generateCorrelationId();
    const contextLogger = logger.withContext({ operation, correlationId });

    try {
      contextLogger.info(`Starting ${operation}`);
      const result = await fn(...args);
      const duration = Date.now() - start;
      contextLogger.performanceEvent(operation, duration);
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      contextLogger.error(
        `${operation} failed after ${duration}ms`,
        {},
        error as Error,
      );
      throw error;
    }
  };
}

/**
 * State transition helper for business logic
 */
export const logStateTransition = (
  resourceType: string,
  resourceId: string,
  fromState: string,
  toState: string,
  userId?: string,
  correlationId?: string,
) => {
  logger.stateTransition(resourceType, fromState, toState, {
    resourceId,
    resourceType,
    userId,
    correlationId,
  });
};

/**
 * Business event helper
 */
export const logBusinessEvent = (
  event: string,
  userId?: string,
  resourceId?: string,
  resourceType?: string,
  correlationId?: string,
  metadata?: Record<string, any>,
) => {
  logger.businessEvent(event, {
    userId,
    resourceId,
    resourceType,
    correlationId,
    metadata,
  });
};
