"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import type { Profile } from "@/lib/supabase/types"

interface User {
  id: string
  email?: string
  user_metadata?: Record<string, unknown>
  app_metadata?: Record<string, unknown>
  created_at?: string
}

interface Session {
  access_token: string
  refresh_token?: string
  expires_in?: number
  user: User
}

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ data: any; error: any }>
  signOut: () => Promise<{ error: any }>
  signInWithOAuth: (provider: "google" | "facebook") => Promise<{ data: any; error: any }>
  updateProfile: (updates: Partial<Profile>) => Promise<{ data: any; error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  // Initialize auth state
  useEffect(() => {
    let mounted = true

    const initAuth = async () => {
      try {
        // Dynamic import to avoid SSR issues
        const { supabase, isSupabaseConfigured } = await import("@/lib/supabase/client")

        if (!isSupabaseConfigured()) {
          if (mounted) setLoading(false)
          return
        }

        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession()

        if (mounted && currentSession) {
          setSession(currentSession as unknown as Session)
          setUser(currentSession.user as unknown as User)
        }

        // Listen for auth changes
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
          if (mounted) {
            setSession(newSession as unknown as Session)
            setUser((newSession?.user as unknown as User) ?? null)
          }
        })

        if (mounted) setLoading(false)

        return () => {
          subscription.unsubscribe()
        }
      } catch (error) {
        console.warn("[Auth] Failed to initialize:", error)
        if (mounted) setLoading(false)
      }
    }

    initAuth()

    return () => {
      mounted = false
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { supabaseAuth } = await import("@/lib/supabase/client")
      return await supabaseAuth.signInWithPassword({ email, password })
    } catch (error) {
      return { data: null, error: { message: "Erreur de connexion" } }
    }
  }, [])

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    try {
      const { supabaseAuth } = await import("@/lib/supabase/client")
      return await supabaseAuth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      })
    } catch (error) {
      return { data: null, error: { message: "Erreur d'inscription" } }
    }
  }, [])

  const signOut = useCallback(async () => {
    try {
      const { supabaseAuth } = await import("@/lib/supabase/client")
      const result = await supabaseAuth.signOut()
      setUser(null)
      setSession(null)
      setProfile(null)
      return result
    } catch (error) {
      return { error: { message: "Erreur de deconnexion" } }
    }
  }, [])

  const signInWithOAuth = useCallback(async (provider: "google" | "facebook") => {
    try {
      const { supabaseAuth } = await import("@/lib/supabase/client")
      return await supabaseAuth.signInWithOAuth({ provider })
    } catch (error) {
      return { data: null, error: { message: "Erreur OAuth" } }
    }
  }, [])

  const updateProfile = useCallback(
    async (updates: Partial<Profile>) => {
      if (!user) {
        return { data: null, error: { message: "Non connecte" } }
      }
      try {
        const { db } = await import("@/lib/supabase/client")
        const result = await db.updateProfile(user.id, updates)
        if (result.data) {
          setProfile(result.data as Profile)
        }
        return result
      } catch (error) {
        return { data: null, error: { message: "Erreur mise a jour profil" } }
      }
    },
    [user],
  )

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
        signInWithOAuth,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    return {
      user: null,
      session: null,
      profile: null,
      loading: true,
      signIn: async () => ({ data: null, error: new Error("Auth not initialized") }),
      signUp: async () => ({ data: null, error: new Error("Auth not initialized") }),
      signOut: async () => ({ error: new Error("Auth not initialized") }),
      signInWithOAuth: async () => ({ data: null, error: new Error("Auth not initialized") }),
      updateProfile: async () => ({ data: null, error: new Error("Auth not initialized") }),
    }
  }
  return context
}
