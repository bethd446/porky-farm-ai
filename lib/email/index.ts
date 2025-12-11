// Email service exports
export { sendEmail, resend, EMAIL_CONFIG } from "./resend";
export { WelcomeEmail } from "./templates/welcome-email";
export { PasswordResetEmail } from "./templates/password-reset-email";
export { AlertEmail } from "./templates/alert-email";
export { WeeklyReportEmail } from "./templates/weekly-report-email";

// Notification utilities
export {
  sendNotificationEmail,
  sendAlertEmail as sendAlertNotification,
  sendWelcomeEmail as sendWelcomeNotification,
  areEmailNotificationsEnabled,
  getUserEmail,
} from "./notifications";

// Helper functions for common email operations (server-side)
// Use critical email functions for guaranteed delivery
export async function sendWelcomeEmailServer(
  to: string,
  userName: string,
  userId?: string
) {
  const { sendCriticalEmail } = await import("./utils");
  const { WelcomeEmail } = await import("./templates/welcome-email");

  return sendCriticalEmail(
    {
      to,
      subject: "Bienvenue sur PorkyFarm !",
      react: WelcomeEmail({
        userName,
        loginUrl: "https://www.porkyfarm.app/auth/login",
      }),
    },
    {
      userId,
      action: "welcome",
    }
  );
}

export async function sendPasswordResetEmailServer(
  to: string,
  userName: string,
  resetUrl: string
) {
  const { sendCriticalEmail } = await import("./utils");
  const { PasswordResetEmail } =
    await import("./templates/password-reset-email");

  return sendCriticalEmail(
    {
      to,
      subject: "Reinitialisation de votre mot de passe PorkyFarm",
      react: PasswordResetEmail({
        userName,
        resetUrl,
        expiresIn: "24 heures",
      }),
    },
    {
      action: "password-reset",
    }
  );
}

export async function sendAlertEmailServer(
  to: string,
  userName: string,
  alert: {
    type: "vaccination" | "gestation" | "health" | "general";
    title: string;
    message: string;
    animalName?: string;
    actionUrl?: string;
  }
) {
  const { sendEmail } = await import("./resend");
  const { AlertEmail } = await import("./templates/alert-email");

  return sendEmail({
    to,
    subject: `[PorkyFarm] ${alert.title}`,
    react: AlertEmail({
      userName,
      alertType: alert.type,
      alertTitle: alert.title,
      alertMessage: alert.message,
      animalName: alert.animalName,
      actionUrl: alert.actionUrl || "https://www.porkyfarm.app/dashboard",
      actionLabel: "Voir dans PorkyFarm",
    }),
  });
}

export async function sendWeeklyReportEmailServer(
  to: string,
  userName: string,
  farmName: string,
  stats: {
    totalAnimals: number;
    newBirths: number;
    gestationsInProgress: number;
    upcomingBirths: number;
    healthCases: number;
    resolvedCases: number;
  },
  alerts: Array<{ type: string; message: string }>
) {
  const { sendEmail } = await import("./resend");
  const { WeeklyReportEmail } = await import("./templates/weekly-report-email");

  const now = new Date();
  const reportDate = now.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return sendEmail({
    to,
    subject: `📊 Rapport hebdomadaire PorkyFarm - ${reportDate}`,
    react: WeeklyReportEmail({
      userName,
      farmName,
      reportDate,
      stats,
      alerts,
    }),
  });
}
