/**
 * Guard de navigation pour l'onboarding
 * Décide de la navigation selon l'état onboarding dans profiles (Supabase)
 * 
 * Règles :
 * - Pas connecté → routes d'auth
 * - Connecté + hasCompleted = false → onboarding
 * - Connecté + hasCompleted = true → dashboard
 */

import { useEffect, useState, ReactNode, useRef, useCallback } from 'react'
import { ActivityIndicator, View, Text } from 'react-native'
import { useAuthContext } from '../../../contexts/AuthContext'
import { loadOnboardingState } from '../state'
import { colors, spacing, typography } from '../../../lib/designTokens'
import { ErrorState } from '../../../components/ui/ErrorState'
import { LoginScreen } from '../../../components/LoginScreen'
import OnboardingWelcomeScreen from '../../../app/onboarding/index'
import { logger } from '../../logger'
import type { OnboardingState } from '../types'

interface OnboardingGuardProps {
  children: ReactNode
}

type GuardState = 'loading' | 'error' | 'auth' | 'onboarding' | 'ready'

export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const { user, loading: authLoading, error: authError, retryAuth } = useAuthContext()
  const [guardState, setGuardState] = useState<GuardState>('loading')
  const [onboardingState, setOnboardingState] = useState<OnboardingState | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [hasChecked, setHasChecked] = useState(false)
  const isCheckingRef = useRef(false)
  const lastUserIdRef = useRef<string | null>(null)

  /**
   * Vérifier l'état d'onboarding et décider de la navigation
   */
  const checkOnboarding = useCallback(async () => {
    if (!user) {
      logger.debug('[OnboardingGuard] checkOnboarding sans user, abort')
      return
    }

    // Protection contre les appels simultanés
    if (isCheckingRef.current) {
      logger.debug('[OnboardingGuard] checkOnboarding déjà en cours, skip')
      return
    }

    isCheckingRef.current = true
    setGuardState('loading')
    setError(null)

    try {
      logger.debug('[OnboardingGuard] Démarrage checkOnboarding pour user:', user.id)
      const { state, error } = await loadOnboardingState()

      if (error) {
        if (error.message === 'UNAUTHENTICATED') {
          logger.debug('[OnboardingGuard] UNAUTHENTICATED, retour login')
          setGuardState('auth')
          setHasChecked(true)
          isCheckingRef.current = false
          return
        }

        logger.error('[OnboardingGuard] Erreur loadOnboardingState:', error.message)
        setError(error)
        setGuardState('error')
        setHasChecked(true)
        isCheckingRef.current = false
        return
      }

      if (!state) {
        logger.error('[OnboardingGuard] state null sans erreur')
        setError(new Error('PROFILE_STATE_NULL'))
        setGuardState('error')
        setHasChecked(true)
        isCheckingRef.current = false
        return
      }

      setOnboardingState(state)

      if (!state.hasCompleted) {
        logger.debug('[OnboardingGuard] Onboarding non complété, passage à l\'onboarding')
        setGuardState('onboarding')
      } else {
        logger.debug('[OnboardingGuard] Onboarding complété, passage au dashboard')
        setGuardState('ready')
      }

      // Log de contrôle
      const newGuardState = state.hasCompleted ? 'ready' : 'onboarding'
      logger.debug('[OnboardingGuard] resolved state', {
        hasCompleted: state.hasCompleted,
        step: state.step,
        version: state.version,
        guardState: newGuardState,
      })
      
      setHasChecked(true)
      isCheckingRef.current = false
    } catch (e: any) {
      logger.error('[OnboardingGuard] Exception dans checkOnboarding:', e)
      setError(e instanceof Error ? e : new Error(String(e)))
      setGuardState('error')
      setHasChecked(true)
      isCheckingRef.current = false
    }
  }, [user])

  // Effect pour déclencher la vérification - UNE SEULE FOIS par utilisateur
  useEffect(() => {
    // Ne rien faire si auth est en chargement
    if (authLoading) {
      return
    }

    // Si pas d'utilisateur, on est en état auth
    if (!user) {
      setGuardState('auth')
      setHasChecked(false)
      lastUserIdRef.current = null
      return
    }

    // Si l'utilisateur a changé, réinitialiser les flags
    if (lastUserIdRef.current !== user.id) {
      logger.debug('[OnboardingGuard] Nouvel utilisateur détecté:', user.id, 'précédent:', lastUserIdRef.current)
      setHasChecked(false)
      lastUserIdRef.current = user.id
    }

    // Si on a déjà vérifié pour cet utilisateur, NE PAS relancer
    if (hasChecked && lastUserIdRef.current === user.id) {
      logger.debug('[OnboardingGuard] Déjà vérifié pour cet utilisateur, état stable:', guardState)
      return
    }

    // Lancer le check UNIQUEMENT si on n'a pas encore vérifié pour cet utilisateur
    if (!hasChecked) {
      logger.debug('[OnboardingGuard] Déclenchement checkOnboarding depuis useEffect pour user:', user.id)
      checkOnboarding()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user?.id, hasChecked])

  // Callback pour forcer une re-vérification après complétion de l'onboarding
  const refreshOnboardingState = useCallback(async () => {
    logger.debug('[OnboardingGuard] refreshOnboardingState appelé')
    setHasChecked(false)
    isCheckingRef.current = false
    
    // Petit délai pour laisser Supabase se synchroniser
    await new Promise(resolve => setTimeout(resolve, 300))
    
    await checkOnboarding()
  }, [checkOnboarding])

  // Gestion du retry
  const handleRetry = async () => {
    logger.debug('[OnboardingGuard] Retry déclenché')
    if (authError) {
      await retryAuth()
    } else {
      // Réinitialiser les flags pour permettre un nouveau check
      setHasChecked(false)
      isCheckingRef.current = false
      setError(null)
      await checkOnboarding()
    }
  }

  // Log de debug pour diagnostiquer (seulement en dev, et pas à chaque render)
  if (__DEV__ && (guardState === 'loading' || !hasChecked)) {
    logger.debug('[OnboardingGuard] render', {
      authLoading,
      guardState,
      hasCompleted: onboardingState?.hasCompleted,
      user: user?.id,
      hasChecked,
      lastUserId: lastUserIdRef.current,
    })
  }

  // État de chargement (auth)
  if (authLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: spacing.base, fontSize: typography.fontSize.body, color: colors.mutedForeground }}>
          Connexion en cours...
        </Text>
      </View>
    )
  }

  // Non authentifié → afficher l'écran de login directement
  if (!user || guardState === 'auth') {
    return <LoginScreen />
  }

  // Auth OK, mais onboarding en chargement OU pas encore vérifié
  if (guardState === 'loading' || !hasChecked) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: spacing.base, fontSize: typography.fontSize.body, color: colors.mutedForeground }}>
          Chargement de votre profil...
        </Text>
      </View>
    )
  }

  // État d'erreur
  if (guardState === 'error' || authError) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <ErrorState
          title="Erreur de chargement"
          message={
            error?.message ||
            authError?.message ||
            "Impossible de charger les données. Vérifiez votre connexion et réessayez."
          }
          onRetry={handleRetry}
          retryLabel="Réessayer"
        />
      </View>
    )
  }

  // Onboarding non complété → rendre directement l'écran d'onboarding
  if (guardState === 'onboarding') {
    return <OnboardingWelcomeScreen onComplete={refreshOnboardingState} />
  }

  // Onboarding complété → afficher le dashboard
  if (guardState === 'ready') {
    return <>{children}</>
  }

  // Par défaut, afficher les enfants (mais log pour debug)
  logger.warn('[OnboardingGuard] État inattendu, affichage children par défaut', { guardState, hasCompleted: onboardingState?.hasCompleted })
  return <>{children}</>
}
