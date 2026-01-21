/**
 * AuthContext - Authentification Simplifiee PorkyFarm
 * Anonymous + Magic Link (100% GRATUIT)
 */

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react'
import { router } from 'expo-router'
import * as Linking from 'expo-linking'
import { authService, AuthState } from '../services/auth'
import { supabase } from '../services/supabase/client'
import { logger } from '../lib/logger'
import type { Session, User } from '@supabase/supabase-js'

interface AuthContextType {
  // Etat
  user: User | null
  session: Session | null
  loading: boolean
  error: Error | null
  isAuthenticated: boolean
  isAnonymous: boolean
  email: string | null
  isAdmin: boolean

  // Actions
  startAnonymously: () => Promise<{ error: Error | null }>
  linkEmail: (email: string) => Promise<{ error: Error | null }>
  signInWithEmail: (email: string) => Promise<{ error: Error | null }>
  signInWithPassword: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  retryAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [authState, setAuthState] = useState<AuthState>({
    isAnonymous: true,
    email: null,
    userId: null,
  })

  const loadingProfileRef = useRef<string | null>(null)

  // Charger le profil pour role admin
  const loadProfile = async (userId: string) => {
    if (loadingProfileRef.current === userId) return
    loadingProfileRef.current = userId

    try {
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()

      if (profileError) {
        logger.warn('[Auth] Profile error:', profileError.message)
        setIsAdmin(false)
        return
      }

      const adminStatus = data?.role === 'admin' || data?.role === 'super_admin'
      setIsAdmin(adminStatus)
    } catch (err) {
      logger.warn('[Auth] Profile exception:', err)
      setIsAdmin(false)
    } finally {
      loadingProfileRef.current = null
    }
  }

  // Initialisation
  const initAuth = async () => {
    setLoading(true)
    setError(null)

    try {
      const { data } = await authService.getSession()

      if (data?.session?.user) {
        setSession(data.session)
        setUser(data.session.user)
        const state = await authService.getAuthState()
        setAuthState(state)
        await loadProfile(data.session.user.id)
      }
    } catch (err) {
      logger.error('[Auth] Init error:', err)
      setError(err instanceof Error ? err : new Error('Erreur initialisation'))
    } finally {
      setLoading(false)
    }
  }

  // Gerer les deep links (Magic Link callback)
  const handleDeepLink = async ({ url }: { url: string }) => {
    logger.debug('[Auth] Deep link:', url)

    if (url.includes('auth/callback') || url.includes('access_token')) {
      setLoading(true)

      try {
        // Supabase gere automatiquement le token dans l'URL
        const { data } = await supabase.auth.getSession()

        if (data.session) {
          await authService.confirmEmailLink()
          const state = await authService.getAuthState()
          setAuthState(state)
        }
      } catch (err) {
        logger.error('[Auth] Deep link error:', err)
      } finally {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    initAuth()

    // Ecouter les changements d'auth
    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, newSession) => {
        logger.debug('[Auth] Event:', event)

        if (event !== 'INITIAL_SESSION' && event !== 'TOKEN_REFRESHED') {
          setLoading(false)
        }

        setSession(newSession)
        setUser(newSession?.user ?? null)
        setError(null)

        if (newSession?.user) {
          const state = await authService.getAuthState()
          setAuthState(state)
          loadProfile(newSession.user.id).catch((err) => logger.warn('[Auth] loadProfile error:', err))
        } else {
          setIsAdmin(false)
          setAuthState({ isAnonymous: true, email: null, userId: null })
        }

        // Redirection apres connexion reussie
        if (event === 'SIGNED_IN' && newSession?.user) {
          router.replace('/(tabs)')
        }
      }
    )

    // Gerer les deep links
    const linkSubscription = Linking.addEventListener('url', handleDeepLink)
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url })
    })

    return () => {
      subscription.unsubscribe()
      linkSubscription.remove()
    }
  }, [])

  // Demarrer en mode anonyme
  const startAnonymously = async () => {
    setLoading(true)
    setError(null)

    const { user: newUser, error: authError } = await authService.signInAnonymously()

    if (authError) {
      setError(authError)
      setLoading(false)
      return { error: authError }
    }

    if (newUser) {
      setUser(newUser)
      setAuthState({ isAnonymous: true, email: null, userId: newUser.id })
      router.replace('/(tabs)')
    }

    setLoading(false)
    return { error: null }
  }

  // Lier un email au compte anonyme
  const linkEmail = async (email: string) => {
    const result = await authService.linkEmail(email)
    return result
  }

  // Se connecter avec Magic Link
  const signInWithEmail = async (email: string) => {
    const result = await authService.signInWithMagicLink(email)
    return result
  }

  // Se connecter avec mot de passe (fallback)
  const signInWithPassword = async (email: string, password: string) => {
    setLoading(true)
    const { user: newUser, error: authError } = await authService.signInWithPassword(email, password)

    if (authError) {
      setLoading(false)
      return { error: authError }
    }

    if (newUser) {
      setUser(newUser)
      setAuthState({ isAnonymous: false, email: newUser.email ?? null, userId: newUser.id })
    }

    setLoading(false)
    return { error: null }
  }

  // S'inscrire avec email/password
  const signUp = async (email: string, password: string) => {
    setLoading(true)
    setError(null)

    logger.debug('[AuthContext] signUp: start', { email })

    const { user: newUser, error: authError } = await authService.signUp(email, password)

    if (authError) {
      logger.error('[AuthContext] signUp error:', authError)
      setError(authError)
      setLoading(false)
      return { error: authError }
    }

    if (newUser) {
      logger.info('[AuthContext] signUp: success', {
        userId: newUser.id,
        email: newUser.email,
        emailConfirmed: !!newUser.email_confirmed_at
      })
      setUser(newUser)
      setAuthState({ isAnonymous: false, email: newUser.email ?? null, userId: newUser.id })

      // Si l'email n'est pas confirmé, on reste sur la page d'inscription
      // Sinon, redirection automatique
      if (newUser.email_confirmed_at) {
        logger.debug('[AuthContext] Email already confirmed, redirecting to dashboard')
        router.replace('/(tabs)')
      } else {
        logger.debug('[AuthContext] Email not confirmed, staying on register screen')
      }
    } else {
      logger.warn('[AuthContext] signUp: no user returned')
    }

    setLoading(false)
    return { error: null }
  }

  // Deconnexion
  const signOut = async () => {
    setLoading(true)
    await authService.signOut()
    setUser(null)
    setSession(null)
    setIsAdmin(false)
    setAuthState({ isAnonymous: true, email: null, userId: null })
    router.replace('/(auth)/welcome')
    setLoading(false)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        error,
        isAuthenticated: !!user,
        isAnonymous: authState.isAnonymous,
        email: authState.email,
        isAdmin,
        startAnonymously,
        linkEmail,
        signInWithEmail,
        signInWithPassword,
        signUp,
        signOut,
        retryAuth: initAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}

// Alias pour compatibilite
export const useAuth = useAuthContext
