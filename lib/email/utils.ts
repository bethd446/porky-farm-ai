/**
 * Email utilities with retry logic and error handling
 * Production-ready email sending with automatic retries
 */

import { sendEmail, type EmailResult } from "./resend";
import * as Sentry from "@sentry/nextjs";
import { logEmailOperation, trackEmailMetric } from "./monitoring";

export interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number; // in milliseconds
  exponentialBackoff?: boolean;
}

const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  exponentialBackoff: true,
};

/**
 * Send email with automatic retry logic
 * Production-ready function that ensures email delivery
 */
export async function sendEmailWithRetry(
  options: Parameters<typeof sendEmail>[0],
  retryOptions: RetryOptions = {}
): Promise<EmailResult> {
  const config = { ...DEFAULT_RETRY_OPTIONS, ...retryOptions };
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      const result = await sendEmail(options);

      if (result.success) {
        // Log success on retry
        if (attempt > 0) {
          trackEmailMetric("retry", "email_send", {
            to: options.to,
            attempts: attempt + 1,
            success: true,
          });
        } else {
          trackEmailMetric("sent", "email_send", {
            to: options.to,
            subject: options.subject,
          });
        }

        logEmailOperation({
          type: "email_send",
          to: Array.isArray(options.to) ? options.to[0] : options.to,
          subject: options.subject,
          success: true,
          messageId: result.messageId,
          timestamp: new Date().toISOString(),
          retries: attempt,
        });

        return result;
      }

      // If not successful, prepare for retry
      lastError = new Error(result.error || "Unknown error");

      // Don't retry on certain errors (invalid API key, etc.)
      if (
        result.error?.includes("API key") ||
        result.error?.includes("invalid") ||
        result.error?.includes("unauthorized")
      ) {
        console.error("[Email] Non-retryable error:", result.error);
        return result;
      }

      // If this was the last attempt, return the error
      if (attempt === config.maxRetries) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = config.exponentialBackoff
        ? config.retryDelay * Math.pow(2, attempt)
        : config.retryDelay;

      console.warn(
        `[Email] Retry ${attempt + 1}/${config.maxRetries} after ${delay}ms`,
        {
          to: options.to,
          error: result.error,
        }
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === config.maxRetries) {
        break;
      }

      const delay = config.exponentialBackoff
        ? config.retryDelay * Math.pow(2, attempt)
        : config.retryDelay;

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // All retries failed - log to Sentry
  const errorMessage =
    lastError?.message || "Failed to send email after all retries";

  trackEmailMetric("failed", "email_send", {
    to: options.to,
    subject: options.subject,
    attempts: config.maxRetries + 1,
  });

  logEmailOperation({
    type: "email_send",
    to: Array.isArray(options.to) ? options.to[0] : options.to,
    subject: options.subject,
    success: false,
    error: errorMessage,
    timestamp: new Date().toISOString(),
    retries: config.maxRetries,
  });

  Sentry.captureException(lastError || new Error(errorMessage), {
    tags: {
      type: "email",
      action: "send_with_retry",
    },
    extra: {
      to: options.to,
      subject: options.subject,
      attempts: config.maxRetries + 1,
    },
  });

  return {
    success: false,
    error: errorMessage,
  };
}

/**
 * Verify email was sent successfully
 */
export function verifyEmailSent(result: EmailResult): boolean {
  return result.success === true && !!result.messageId;
}

/**
 * Send critical email (welcome, password reset) with guaranteed delivery
 */
export async function sendCriticalEmail(
  options: Parameters<typeof sendEmail>[0],
  context?: { userId?: string; action?: string }
): Promise<EmailResult> {
  // Use more retries for critical emails
  const result = await sendEmailWithRetry(options, {
    maxRetries: 5,
    retryDelay: 2000,
    exponentialBackoff: true,
  });

  if (!result.success) {
    trackEmailMetric("failed", "critical_email", {
      to: options.to,
      subject: options.subject,
      action: context?.action,
    });

    logEmailOperation({
      type: context?.action || "critical_email",
      to: Array.isArray(options.to) ? options.to[0] : options.to,
      subject: options.subject,
      success: false,
      error: result.error,
      timestamp: new Date().toISOString(),
      critical: true,
    });

    Sentry.captureException(
      new Error(`Critical email failed: ${result.error}`),
      {
        level: "error",
        tags: {
          type: "email",
          critical: true,
          action: context?.action || "unknown",
        },
        extra: {
          to: options.to,
          subject: options.subject,
          context,
        },
      }
    );
  } else {
    trackEmailMetric("sent", "critical_email", {
      to: options.to,
      subject: options.subject,
      action: context?.action,
    });

    logEmailOperation({
      type: context?.action || "critical_email",
      to: Array.isArray(options.to) ? options.to[0] : options.to,
      subject: options.subject,
      success: true,
      messageId: result.messageId,
      timestamp: new Date().toISOString(),
      critical: true,
    });
  }

  return result;
}
