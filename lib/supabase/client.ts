"use client"

import { createClient, type SupabaseClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Singleton pattern
let supabaseInstance: SupabaseClient | null = null

function getSupabaseClient(): SupabaseClient {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn("[Supabase] URL or ANON_KEY not configured. Using mock client.")
    // Return a mock client that won't crash but won't work either
    return createClient("https://placeholder.supabase.co", "placeholder-key", {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }

  if (typeof window === "undefined") {
    // Server-side: create new instance each time
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: false,
      },
    })
  }

  // Client-side: use singleton
  if (!supabaseInstance) {
    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  }

  return supabaseInstance
}

export const supabase = getSupabaseClient()

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_URL !== "https://placeholder.supabase.co")
}

export const supabaseAuth = {
  async signInWithPassword({ email, password }: { email: string; password: string }) {
    if (!isSupabaseConfigured()) {
      return { data: { user: null, session: null }, error: { message: "Supabase non configure" } as any }
    }
    try {
      const result = await supabase.auth.signInWithPassword({ email, password })
      if (result.error) {
        console.error("[Auth] signInWithPassword error:", result.error.message)
      }
      return result
    } catch (err) {
      console.error("[Auth] signInWithPassword exception:", err)
      return { data: { user: null, session: null }, error: { message: "Erreur de connexion" } as any }
    }
  },

  async signInWithOAuth({
    provider,
    options,
  }: {
    provider: "google" | "facebook" | "apple" | "github"
    options?: { redirectTo?: string; scopes?: string }
  }) {
    if (!isSupabaseConfigured()) {
      return { data: { provider: null, url: null }, error: { message: "Supabase non configure" } as any }
    }
    try {
      const redirectTo = options?.redirectTo || `${window.location.origin}/auth/callback`
      return supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          scopes: options?.scopes,
        },
      })
    } catch (err) {
      console.error("[Auth] signInWithOAuth exception:", err)
      return { data: { provider: null, url: null }, error: { message: "Erreur OAuth" } as any }
    }
  },

  async signUp({
    email,
    password,
    options,
  }: {
    email: string
    password: string
    options?: { data?: Record<string, unknown>; emailRedirectTo?: string }
  }) {
    if (!isSupabaseConfigured()) {
      return { data: { user: null, session: null }, error: { message: "Supabase non configure" } as any }
    }
    try {
      const emailRedirectTo =
        process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
        options?.emailRedirectTo ||
        `${window.location.origin}/auth/callback`

      const result = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: options?.data,
          emailRedirectTo,
        },
      })
      if (result.error) {
        console.error("[Auth] signUp error:", result.error.message)
      }
      return result
    } catch (err) {
      console.error("[Auth] signUp exception:", err)
      return { data: { user: null, session: null }, error: { message: "Erreur d'inscription" } as any }
    }
  },

  async signOut() {
    try {
      return supabase.auth.signOut()
    } catch (err) {
      console.error("[Auth] signOut exception:", err)
      return { error: { message: "Erreur de deconnexion" } as any }
    }
  },

  async getSession() {
    try {
      return supabase.auth.getSession()
    } catch (err) {
      console.error("[Auth] getSession exception:", err)
      return { data: { session: null }, error: { message: "Erreur session" } as any }
    }
  },

  async getUser() {
    try {
      return supabase.auth.getUser()
    } catch (err) {
      console.error("[Auth] getUser exception:", err)
      return { data: { user: null }, error: { message: "Erreur utilisateur" } as any }
    }
  },

  onAuthStateChange(callback: Parameters<typeof supabase.auth.onAuthStateChange>[0]) {
    return supabase.auth.onAuthStateChange(callback)
  },

  async resetPasswordForEmail(email: string, options?: { redirectTo?: string }) {
    if (!isSupabaseConfigured()) {
      return { data: {}, error: { message: "Supabase non configure" } as any }
    }
    try {
      const redirectTo = options?.redirectTo || `${window.location.origin}/auth/update-password`
      return supabase.auth.resetPasswordForEmail(email, { redirectTo })
    } catch (err) {
      console.error("[Auth] resetPasswordForEmail exception:", err)
      return { data: {}, error: { message: "Erreur reinitialisation" } as any }
    }
  },

  async updateUser(attributes: { password?: string; data?: Record<string, unknown> }) {
    if (!isSupabaseConfigured()) {
      return { data: { user: null }, error: { message: "Supabase non configure" } as any }
    }
    try {
      return supabase.auth.updateUser(attributes)
    } catch (err) {
      console.error("[Auth] updateUser exception:", err)
      return { data: { user: null }, error: { message: "Erreur mise a jour" } as any }
    }
  },
}

export const db = {
  from: (table: string) => supabase.from(table),

  async getProfile(userId: string) {
    try {
      return await supabase.from("profiles").select("*").eq("id", userId).single()
    } catch (err) {
      console.error("[DB] getProfile exception:", err)
      return { data: null, error: { message: "Erreur profil" } as any }
    }
  },

  async updateProfile(userId: string, updates: Record<string, unknown>) {
    try {
      return await supabase.from("profiles").update(updates).eq("id", userId).select().single()
    } catch (err) {
      console.error("[DB] updateProfile exception:", err)
      return { data: null, error: { message: "Erreur mise a jour profil" } as any }
    }
  },

  async upsertProfile(profile: Record<string, unknown>) {
    try {
      return await supabase.from("profiles").upsert(profile).select().single()
    } catch (err) {
      console.error("[DB] upsertProfile exception:", err)
      return { data: null, error: { message: "Erreur upsert profil" } as any }
    }
  },

  async getPigs(userId: string) {
    try {
      return await supabase.from("pigs").select("*").eq("user_id", userId).order("created_at", { ascending: false })
    } catch (err) {
      console.error("[DB] getPigs exception:", err)
      return { data: null, error: { message: "Erreur chargement animaux" } as any }
    }
  },

  async addPig(pig: Record<string, unknown>) {
    try {
      return await supabase.from("pigs").insert(pig).select().single()
    } catch (err) {
      console.error("[DB] addPig exception:", err)
      return { data: null, error: { message: "Erreur ajout animal" } as any }
    }
  },

  async updatePig(pigId: string, updates: Record<string, unknown>) {
    try {
      return await supabase
        .from("pigs")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", pigId)
        .select()
        .single()
    } catch (err) {
      console.error("[DB] updatePig exception:", err)
      return { data: null, error: { message: "Erreur mise a jour animal" } as any }
    }
  },

  async deletePig(pigId: string) {
    try {
      return await supabase.from("pigs").delete().eq("id", pigId)
    } catch (err) {
      console.error("[DB] deletePig exception:", err)
      return { error: { message: "Erreur suppression animal" } as any }
    }
  },

  async getGestations(userId: string) {
    try {
      return await supabase
        .from("gestations")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
    } catch (err) {
      console.error("[DB] getGestations exception:", err)
      return { data: null, error: { message: "Erreur chargement gestations" } as any }
    }
  },

  async addGestation(gestation: Record<string, unknown>) {
    try {
      return await supabase.from("gestations").insert(gestation).select().single()
    } catch (err) {
      console.error("[DB] addGestation exception:", err)
      return { data: null, error: { message: "Erreur ajout gestation" } as any }
    }
  },

  async updateGestation(gestationId: string, updates: Record<string, unknown>) {
    try {
      return await supabase
        .from("gestations")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", gestationId)
        .select()
        .single()
    } catch (err) {
      console.error("[DB] updateGestation exception:", err)
      return { data: null, error: { message: "Erreur mise a jour gestation" } as any }
    }
  },

  async deleteGestation(gestationId: string) {
    try {
      return await supabase.from("gestations").delete().eq("id", gestationId)
    } catch (err) {
      console.error("[DB] deleteGestation exception:", err)
      return { error: { message: "Erreur suppression gestation" } as any }
    }
  },

  async getVeterinaryCases(userId: string) {
    try {
      return await supabase
        .from("health_records")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
    } catch (err) {
      console.error("[DB] getVeterinaryCases exception:", err)
      return { data: null, error: { message: "Erreur chargement cas veterinaires" } as any }
    }
  },

  async addVeterinaryCase(vetCase: Record<string, unknown>) {
    try {
      return await supabase.from("veterinary_cases").insert(vetCase).select().single()
    } catch (err) {
      console.error("[DB] addVeterinaryCase exception:", err)
      return { data: null, error: { message: "Erreur ajout cas veterinaire" } as any }
    }
  },

  async updateVeterinaryCase(caseId: string, updates: Record<string, unknown>) {
    try {
      return await supabase
        .from("veterinary_cases")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", caseId)
        .select()
        .single()
    } catch (err) {
      console.error("[DB] updateVeterinaryCase exception:", err)
      return { data: null, error: { message: "Erreur mise a jour cas veterinaire" } as any }
    }
  },

  async deleteVeterinaryCase(caseId: string) {
    try {
      return await supabase.from("veterinary_cases").delete().eq("id", caseId)
    } catch (err) {
      console.error("[DB] deleteVeterinaryCase exception:", err)
      return { error: { message: "Erreur suppression cas veterinaire" } as any }
    }
  },

  async getFeedStock(userId: string) {
    try {
      return await supabase
        .from("feed_stock")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
    } catch (err) {
      console.error("[DB] getFeedStock exception:", err)
      return { data: null, error: { message: "Erreur chargement stock" } as any }
    }
  },

  async addFeedStock(stock: Record<string, unknown>) {
    try {
      return await supabase.from("feed_stock").insert(stock).select().single()
    } catch (err) {
      console.error("[DB] addFeedStock exception:", err)
      return { data: null, error: { message: "Erreur ajout stock" } as any }
    }
  },

  async updateFeedStock(stockId: string, updates: Record<string, unknown>) {
    try {
      return await supabase
        .from("feed_stock")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", stockId)
        .select()
        .single()
    } catch (err) {
      console.error("[DB] updateFeedStock exception:", err)
      return { data: null, error: { message: "Erreur mise a jour stock" } as any }
    }
  },

  async deleteFeedStock(stockId: string) {
    try {
      return await supabase.from("feed_stock").delete().eq("id", stockId)
    } catch (err) {
      console.error("[DB] deleteFeedStock exception:", err)
      return { error: { message: "Erreur suppression stock" } as any }
    }
  },

  async getFeedingSchedule(userId: string, date?: string) {
    try {
      const targetDate = date || new Date().toISOString().split("T")[0]
      return await supabase
        .from("feeding_schedule")
        .select("*")
        .eq("user_id", userId)
        .eq("schedule_date", targetDate)
        .order("time", { ascending: true })
    } catch (err) {
      console.error("[DB] getFeedingSchedule exception:", err)
      return { data: null, error: { message: "Erreur chargement planning" } as any }
    }
  },

  async addFeedingScheduleItem(item: Record<string, unknown>) {
    try {
      return await supabase.from("feeding_schedule").insert(item).select().single()
    } catch (err) {
      console.error("[DB] addFeedingScheduleItem exception:", err)
      return { data: null, error: { message: "Erreur ajout tache" } as any }
    }
  },

  async updateFeedingScheduleItem(itemId: string, updates: Record<string, unknown>) {
    try {
      return await supabase
        .from("feeding_schedule")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", itemId)
        .select()
        .single()
    } catch (err) {
      console.error("[DB] updateFeedingScheduleItem exception:", err)
      return { data: null, error: { message: "Erreur mise a jour tache" } as any }
    }
  },

  async deleteFeedingScheduleItem(itemId: string) {
    try {
      return await supabase.from("feeding_schedule").delete().eq("id", itemId)
    } catch (err) {
      console.error("[DB] deleteFeedingScheduleItem exception:", err)
      return { error: { message: "Erreur suppression tache" } as any }
    }
  },

  async resetFeedingScheduleStatus(userId: string, date: string) {
    try {
      return await supabase
        .from("feeding_schedule")
        .update({ status: "pending", updated_at: new Date().toISOString() })
        .eq("user_id", userId)
        .eq("schedule_date", date)
    } catch (err) {
      console.error("[DB] resetFeedingScheduleStatus exception:", err)
      return { error: { message: "Erreur reset planning" } as any }
    }
  },
}

export default supabase
