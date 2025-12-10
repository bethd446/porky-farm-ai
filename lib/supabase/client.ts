"use client"

import { createBrowserClient } from "@supabase/ssr"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://cjzyvcrnwqejlplbkexg.supabase.co"
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqenl2Y3Jud3Flamxwbktlehnlwyjpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqenl2Y3JucWYwMDAxYWNjZXNzIiwidHlwZSI6ImFub24iLCJpYXQiOjE3MzM0ODgwMDAsImV4cCI6MjA0OTA2NDAwMH0.placeholder"

// Singleton pattern for browser client
let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null

function getSupabaseClient() {
  if (supabaseInstance) return supabaseInstance

  supabaseInstance = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  return supabaseInstance
}

// Export the client
export const supabase = getSupabaseClient()

// Auth helper object for backward compatibility
export const supabaseAuth = {
  auth: supabase.auth,

  async signInWithPassword({ email, password }: { email: string; password: string }) {
    return supabase.auth.signInWithPassword({ email, password })
  },

  async signInWithOAuth({
    provider,
    options,
  }: {
    provider: "google" | "facebook" | "apple" | "github"
    options?: { redirectTo?: string; scopes?: string }
  }) {
    return supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: options?.redirectTo || `${window.location.origin}/auth/callback`,
        scopes: options?.scopes,
      },
    })
  },

  async signUp({
    email,
    password,
    options,
  }: {
    email: string
    password: string
    options?: { data?: Record<string, any>; emailRedirectTo?: string }
  }) {
    return supabase.auth.signUp({
      email,
      password,
      options: {
        data: options?.data,
        emailRedirectTo: options?.emailRedirectTo || `${window.location.origin}/auth/callback`,
      },
    })
  },

  async signOut() {
    return supabase.auth.signOut()
  },

  async getSession() {
    return supabase.auth.getSession()
  },

  async getUser() {
    return supabase.auth.getUser()
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  },

  async resetPasswordForEmail(email: string, options?: { redirectTo?: string }) {
    return supabase.auth.resetPasswordForEmail(email, {
      redirectTo: options?.redirectTo || `${window.location.origin}/auth/reset-password`,
    })
  },

  async updateUser(attributes: { password?: string; data?: Record<string, any> }) {
    return supabase.auth.updateUser(attributes)
  },
}

// Database helpers
export const db = {
  from: (table: string) => supabase.from(table),

  // Profiles
  async getProfile(userId: string) {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()
    return { data, error }
  },

  async updateProfile(userId: string, updates: Record<string, any>) {
    const { data, error } = await supabase.from("profiles").update(updates).eq("id", userId).select().single()
    return { data, error }
  },

  async upsertProfile(profile: Record<string, any>) {
    const { data, error } = await supabase.from("profiles").upsert(profile).select().single()
    return { data, error }
  },

  // Pigs
  async getPigs(userId: string) {
    const { data, error } = await supabase
      .from("pigs")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
    return { data, error }
  },

  async addPig(pig: Record<string, any>) {
    const { data, error } = await supabase.from("pigs").insert(pig).select().single()
    return { data, error }
  },

  async updatePig(pigId: string, updates: Record<string, any>) {
    const { data, error } = await supabase.from("pigs").update(updates).eq("id", pigId).select().single()
    return { data, error }
  },

  async deletePig(pigId: string) {
    const { error } = await supabase.from("pigs").delete().eq("id", pigId)
    return { error }
  },

  // Gestations
  async getGestations(userId: string) {
    const { data, error } = await supabase
      .from("gestations")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
    return { data, error }
  },

  async addGestation(gestation: Record<string, any>) {
    const { data, error } = await supabase.from("gestations").insert(gestation).select().single()
    return { data, error }
  },

  // Veterinary cases
  async getVeterinaryCases(userId: string) {
    const { data, error } = await supabase
      .from("veterinary_cases")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
    return { data, error }
  },

  async addVeterinaryCase(vetCase: Record<string, any>) {
    const { data, error } = await supabase.from("veterinary_cases").insert(vetCase).select().single()
    return { data, error }
  },
}

// Export for direct access
export default supabase
