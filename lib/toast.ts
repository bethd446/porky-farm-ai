/**
 * Helper pour toasts (utilise sonner)
 * Système de feedback utilisateur unifié
 */

import { toast as sonnerToast } from "sonner"

export const toast = {
  success: (message: string) => {
    sonnerToast.success(message, {
      duration: 3000,
      style: {
        background: "hsl(var(--success))",
        color: "hsl(var(--success-foreground))",
      },
    })
  },

  error: (message: string) => {
    sonnerToast.error(message, {
      duration: 5000,
      style: {
        background: "hsl(var(--destructive))",
        color: "hsl(var(--destructive-foreground))",
      },
    })
  },

  warning: (message: string) => {
    sonnerToast.warning(message, {
      duration: 4000,
      style: {
        background: "hsl(var(--warning))",
        color: "hsl(var(--warning-foreground))",
      },
    })
  },

  info: (message: string) => {
    sonnerToast.info(message, {
      duration: 3000,
      style: {
        background: "hsl(var(--info))",
        color: "hsl(var(--info-foreground))",
      },
    })
  },
}

