"use client"

import { useEffect, useState, useCallback } from "react"
import type { Profile } from "@/lib/supabase/types"

export interface User {
  id: string
  email?: string
  user_metadata?: Record<string, unknown>
  app_metadata?: Record<string, unknown>
  created_at?: string
}

export interface Session {
  access_token: string
  refresh_token?: string
  expires_in?: number
  user: User
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { supabase, isSupabaseConfigured } = await import("@/lib/supabase/client")
      if (!isSupabaseConfigured()) return

      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()
      if (data && !error) {
        setProfile(data as Profile)
      }
    } catch (err) {
      console.warn("[useAuth] Error fetching profile:", err)
    }
  }, [])

  useEffect(() => {
    let mounted = true

    const initAuth = async () => {
      try {
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
          await fetchProfile(currentSession.user.id)
        }

        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
          if (!mounted) return

          setSession(newSession as unknown as Session)
          setUser((newSession?.user as unknown as User) ?? null)

          if (newSession?.user) {
            await fetchProfile(newSession.user.id)
          } else {
            setProfile(null)
          }
        })

        if (mounted) setLoading(false)

        return () => {
          subscription.unsubscribe()
        }
      } catch (err) {
        console.warn("[useAuth] Error initializing auth:", err)
        if (mounted) setLoading(false)
      }
    }

    initAuth()

    return () => {
      mounted = false
    }
  }, [fetchProfile])

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
        options: {
          data: { full_name: fullName },
          emailRedirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}/auth/callback`
              : process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL,
        },
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

  const updateProfile = useCallback(
    async (updates: Partial<Profile>) => {
      if (!user) return { data: null, error: { message: "Non connecte" } }

      try {
        const { supabase, isSupabaseConfigured } = await import("@/lib/supabase/client")
        if (!isSupabaseConfigured()) {
          return { data: null, error: { message: "Supabase non configure" } }
        }

        const { data, error } = await supabase.from("profiles").update(updates).eq("id", user.id).select().single()

        if (data) {
          setProfile(data as Profile)
        }

        return { data, error }
      } catch (error) {
        return { data: null, error: { message: "Erreur mise a jour profil" } }
      }
    },
    [user],
  )

  return {
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  }
}
