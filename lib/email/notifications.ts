// Utility functions for sending email notifications

interface NotificationEmailOptions {
  userEmail: string
  userName?: string
  type: "alert" | "welcome" | "password-reset" | "daily-summary"
  data?: Record<string, unknown>
}

// Send notification email via API
export async function sendNotificationEmail(options: NotificationEmailOptions): Promise<boolean> {
  try {
    const response = await fetch("/api/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: options.type === "daily-summary" ? "alert" : options.type,
        to: options.userEmail,
        data: {
          userName: options.userName || "Eleveur",
          ...options.data,
        },
      }),
    })

    const result = await response.json()
    return result.success === true
  } catch (error) {
    console.error("[Notification] Failed to send email:", error)
    return false
  }
}

// Send alert email for critical notifications
export async function sendAlertEmail(
  userEmail: string,
  alert: {
    type: "health" | "gestation" | "vaccination" | "general"
    title: string
    message: string
    animalName?: string
    actionUrl?: string
  },
): Promise<boolean> {
  return sendNotificationEmail({
    userEmail,
    type: "alert",
    data: {
      alertType: alert.type,
      alertTitle: alert.title,
      alertMessage: alert.message,
      animalName: alert.animalName,
      actionUrl: alert.actionUrl || "https://www.porkyfarm.app/dashboard",
      actionLabel: "Voir dans PorkyFarm",
    },
  })
}

// Send welcome email after registration
export async function sendWelcomeEmail(userEmail: string, userName: string): Promise<boolean> {
  return sendNotificationEmail({
    userEmail,
    userName,
    type: "welcome",
    data: {
      loginUrl: "https://www.porkyfarm.app/auth/login",
    },
  })
}

// Check if email notifications are enabled
export function areEmailNotificationsEnabled(): boolean {
  if (typeof window === "undefined") return false

  try {
    const settings = localStorage.getItem("porkyfarm-profile-settings")
    if (!settings) return true // Default to enabled

    const parsed = JSON.parse(settings)
    return parsed.dailyEmails === true
  } catch {
    return true
  }
}

// Get user email from profile
export function getUserEmail(): string | null {
  if (typeof window === "undefined") return null

  try {
    const profile = localStorage.getItem("porkyfarm-user-profile")
    if (!profile) return null

    const parsed = JSON.parse(profile)
    return parsed.email || null
  } catch {
    return null
  }
}
