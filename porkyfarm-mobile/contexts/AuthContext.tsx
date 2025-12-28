import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authService } from '../services/supabase/auth'
import type { Session, User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  error: Error | null
  retryAuth: () => Promise<void>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadSession = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Timeout de 10 secondes pour le chargement de la session
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout: La connexion prend trop de temps')), 10000)
      })

      const sessionPromise = authService.getSession()
      
      const { data, error: sessionError } = await Promise.race([sessionPromise, timeoutPromise]) as any

      if (sessionError) {
        console.error('[AuthContext] Error loading session:', sessionError)
        setError(sessionError as Error)
        setLoading(false)
        return
      }

      if (data?.session) {
        setSession(data.session)
        setUser(data.session.user)
      }
      setLoading(false)
    } catch (err: any) {
      console.error('[AuthContext] Exception loading session:', err)
      setError(err instanceof Error ? err : new Error('Erreur lors du chargement de la session'))
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = authService.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
      setError(null) // Réinitialiser l'erreur si la session change
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await authService.signIn(email, password)
    return { error }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await authService.signUp(email, password, { full_name: fullName })
    return { error }
  }

  const signOut = async () => {
    await authService.signOut()
    setUser(null)
    setSession(null)
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, error, retryAuth: loadSession, signIn, signUp, signOut }}>
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

