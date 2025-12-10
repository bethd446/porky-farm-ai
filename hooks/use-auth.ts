"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase/client"
import type { User, Session } from "@supabase/supabase-js"
import type { Profile } from "@/lib/supabase/types"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()
      if (data && !error) {
        setProfile(data as Profile)
      }
    } catch (err) {
      console.error("Error fetching profile:", err)
    }
  }, [])

  useEffect(() => {
    const getSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          await fetchProfile(session.user.id)
        }
      } catch (err) {
        console.error("Error getting session:", err)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }

      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [fetchProfile])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      setUser(null)
      setSession(null)
      setProfile(null)
    }
    return { error }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { data: null, error: new Error("Not authenticated") }

    const { data, error } = await supabase.from("profiles").update(updates).eq("id", user.id).select().single()

    if (data) {
      setProfile(data as Profile)
    }

    return { data, error }
  }

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

// Re-export types for convenience
export type { User, Session } from "@supabase/supabase-js"
