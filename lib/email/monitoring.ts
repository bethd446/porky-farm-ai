/**
 * Email monitoring and logging utilities
 * Production-ready logging for email operations
 */

import * as Sentry from "@sentry/nextjs";

export interface EmailLog {
  type: string;
  to: string;
  subject: string;
  success: boolean;
  messageId?: string;
  error?: string;
  timestamp: string;
  retries?: number;
  critical?: boolean;
}

/**
 * Log email operation for monitoring
 */
export function logEmailOperation(log: EmailLog): void {
  const logMessage = `[Email] ${log.success ? "✓" : "✗"} ${log.type} to ${log.to}`;

  if (log.success) {
    console.log(logMessage, {
      messageId: log.messageId,
      retries: log.retries || 0,
    });
  } else {
    console.error(logMessage, {
      error: log.error,
      retries: log.retries || 0,
      critical: log.critical,
    });

    // Send to Sentry for failed emails
    if (log.critical || !log.error?.includes("API key")) {
      Sentry.captureMessage(`Email failed: ${log.type}`, {
        level: log.critical ? "error" : "warning",
        tags: {
          type: "email",
          emailType: log.type,
          critical: log.critical || false,
        },
        extra: {
          to: log.to,
          subject: log.subject,
          error: log.error,
          retries: log.retries,
        },
      });
    }
  }
}

/**
 * Track email metrics (for future analytics integration)
 */
export function trackEmailMetric(
  type: "sent" | "failed" | "retry",
  emailType: string,
  metadata?: Record<string, unknown>
): void {
  // Log for now, can be extended to send to analytics service
  console.log(`[Email Metric] ${type}:`, {
    emailType,
    ...metadata,
    timestamp: new Date().toISOString(),
  });

  // Add Sentry breadcrumb for tracking
  Sentry.addBreadcrumb({
    category: "email",
    message: `${type}: ${emailType}`,
    level: type === "failed" ? "error" : "info",
    data: metadata,
  });
}
