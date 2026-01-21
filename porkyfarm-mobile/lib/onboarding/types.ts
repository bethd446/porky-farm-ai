/**
 * Types TypeScript pour le système d'onboarding
 * Partagé entre web et mobile
 */

export interface OnboardingState {
  hasCompleted: boolean
  step: string | null
  version: string | null
  completedAt: Date | null
  data: unknown | null
  role: string | null
  isActive: boolean
}

export interface OnboardingService {
  loadState: () => Promise<{ state: OnboardingState | null; error: Error | null }>
  markStep: (step: string, partialData?: any) => Promise<{ error: Error | null; persisted: boolean }>
  completeOnboarding: (finalData?: any) => Promise<{ error: Error | null; persisted: boolean }>
}

export interface OnboardingCache {
  step: string | null
  data: unknown | null
  pendingCompletion: boolean
  pendingData: unknown | null
}

export type ActivityType = 'onboarding_step_view' | 'onboarding_completed'

export interface ActivityDetails {
  step?: string
  version?: string
  total_steps?: number
  [key: string]: unknown
}

export type HealthSeverity = 'info' | 'warning' | 'error'

export interface HealthLogContext {
  userId?: string
  step?: string
  error?: string
  [key: string]: unknown
}

