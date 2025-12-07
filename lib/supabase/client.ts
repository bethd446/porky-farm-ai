"use client"

const SUPABASE_URL = "https://cjzyvcrnwqejlplbkexg.supabase.co"
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqenl2Y3Jud3FlamxwbGJrZXhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5NDk5NzYsImV4cCI6MjA4MDUyNTk3Nn0.K01KyAy4rBS_7So2WNe2-4kZ9aw9Rqh3hBfFIWquI_A"

const STORAGE_KEY = "porky-farm-auth"

interface User {
  id: string
  email?: string
  user_metadata?: {
    full_name?: string
    [key: string]: any
  }
  [key: string]: any
}

interface Session {
  access_token: string
  refresh_token: string
  expires_at?: number
  user: User
}

interface AuthResponse {
  data: { user: User | null; session: Session | null }
  error: { message: string } | null
}

type AuthChangeCallback = (event: string, session: Session | null) => void

class SupabaseAuth {
  private listeners: AuthChangeCallback[] = []

  private getStoredSession(): Session | null {
    if (typeof window === "undefined") return null
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  }

  private setStoredSession(session: Session | null) {
    if (typeof window === "undefined") return
    if (session) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
    this.notifyListeners("SIGNED_IN", session)
  }

  private notifyListeners(event: string, session: Session | null) {
    this.listeners.forEach((callback) => callback(event, session))
  }

  async getSession(): Promise<{ data: { session: Session | null }; error: null }> {
    const session = this.getStoredSession()
    return { data: { session }, error: null }
  }

  async getUser(): Promise<{ data: { user: User | null }; error: null }> {
    const session = this.getStoredSession()
    return { data: { user: session?.user ?? null }, error: null }
  }

  async signInWithPassword({
    email,
    password,
  }: {
    email: string
    password: string
  }): Promise<AuthResponse> {
    try {
      const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          data: { user: null, session: null },
          error: { message: data.error_description || data.msg || "Erreur de connexion" },
        }
      }

      const session: Session = {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: data.expires_at,
        user: data.user,
      }

      this.setStoredSession(session)

      return {
        data: { user: data.user, session },
        error: null,
      }
    } catch (error: any) {
      return {
        data: { user: null, session: null },
        error: { message: error.message || "Erreur de connexion" },
      }
    }
  }

  async signUp({
    email,
    password,
    options,
  }: {
    email: string
    password: string
    options?: { data?: { full_name?: string }; emailRedirectTo?: string }
  }): Promise<AuthResponse> {
    try {
      const response = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          email,
          password,
          data: options?.data,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          data: { user: null, session: null },
          error: { message: data.error_description || data.msg || "Erreur d'inscription" },
        }
      }

      if (data.access_token) {
        const session: Session = {
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          expires_at: data.expires_at,
          user: data.user,
        }
        this.setStoredSession(session)
        return { data: { user: data.user, session }, error: null }
      }

      return {
        data: { user: data.user || data, session: null },
        error: null,
      }
    } catch (error: any) {
      return {
        data: { user: null, session: null },
        error: { message: error.message || "Erreur d'inscription" },
      }
    }
  }

  async signOut(): Promise<{ error: null }> {
    const session = this.getStoredSession()
    if (session?.access_token) {
      try {
        await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${session.access_token}`,
          },
        })
      } catch {
        // Ignore logout errors
      }
    }
    this.setStoredSession(null)
    this.notifyListeners("SIGNED_OUT", null)
    return { error: null }
  }

  onAuthStateChange(callback: AuthChangeCallback): { data: { subscription: { unsubscribe: () => void } } } {
    this.listeners.push(callback)

    // Call with initial session
    const session = this.getStoredSession()
    setTimeout(() => callback("INITIAL_SESSION", session), 0)

    return {
      data: {
        subscription: {
          unsubscribe: () => {
            this.listeners = this.listeners.filter((l) => l !== callback)
          },
        },
      },
    }
  }
}

class SupabaseQueryBuilder {
  private tableName: string
  private selectColumns = "*"
  private filters: string[] = []
  private orderByColumn: string | null = null
  private orderAscending = true
  private limitCount: number | null = null
  private isSingle = false
  private accessToken: string | null = null

  constructor(tableName: string) {
    this.tableName = tableName
    const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null
    if (stored) {
      try {
        const session = JSON.parse(stored)
        this.accessToken = session.access_token
      } catch {}
    }
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
      Prefer: this.isSingle ? "return=representation" : "return=representation",
    }
    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`
    }
    return headers
  }

  select(columns = "*") {
    this.selectColumns = columns
    return this
  }

  eq(column: string, value: string | number | boolean) {
    this.filters.push(`${column}=eq.${value}`)
    return this
  }

  neq(column: string, value: string | number | boolean) {
    this.filters.push(`${column}=neq.${value}`)
    return this
  }

  gt(column: string, value: number) {
    this.filters.push(`${column}=gt.${value}`)
    return this
  }

  lt(column: string, value: number) {
    this.filters.push(`${column}=lt.${value}`)
    return this
  }

  gte(column: string, value: number) {
    this.filters.push(`${column}=gte.${value}`)
    return this
  }

  lte(column: string, value: number) {
    this.filters.push(`${column}=lte.${value}`)
    return this
  }

  like(column: string, value: string) {
    this.filters.push(`${column}=like.${value}`)
    return this
  }

  ilike(column: string, value: string) {
    this.filters.push(`${column}=ilike.${value}`)
    return this
  }

  in(column: string, values: (string | number)[]) {
    this.filters.push(`${column}=in.(${values.join(",")})`)
    return this
  }

  order(column: string, { ascending = true }: { ascending?: boolean } = {}) {
    this.orderByColumn = column
    this.orderAscending = ascending
    return this
  }

  limit(count: number) {
    this.limitCount = count
    return this
  }

  single() {
    this.isSingle = true
    this.limitCount = 1
    return this
  }

  private buildUrl() {
    let url = `${SUPABASE_URL}/rest/v1/${this.tableName}?select=${this.selectColumns}`

    if (this.filters.length > 0) {
      url += `&${this.filters.join("&")}`
    }

    if (this.orderByColumn) {
      url += `&order=${this.orderByColumn}.${this.orderAscending ? "asc" : "desc"}`
    }

    if (this.limitCount) {
      url += `&limit=${this.limitCount}`
    }

    return url
  }

  async then(resolve: (value: { data: any; error: any }) => void) {
    try {
      const response = await fetch(this.buildUrl(), {
        method: "GET",
        headers: this.getHeaders(),
      })

      const data = await response.json()

      if (!response.ok) {
        resolve({ data: null, error: { message: data.message || "Erreur" } })
        return
      }

      resolve({ data: this.isSingle ? data[0] || null : data, error: null })
    } catch (error: any) {
      resolve({ data: null, error: { message: error.message } })
    }
  }
}

class SupabaseInsertBuilder {
  private tableName: string
  private data: any
  private accessToken: string | null = null
  private returnData = false

  constructor(tableName: string, data: any) {
    this.tableName = tableName
    this.data = data
    const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null
    if (stored) {
      try {
        const session = JSON.parse(stored)
        this.accessToken = session.access_token
      } catch {}
    }
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
      Prefer: "return=representation",
    }
    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`
    }
    return headers
  }

  select() {
    this.returnData = true
    return this
  }

  single() {
    return this
  }

  async then(resolve: (value: { data: any; error: any }) => void) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/${this.tableName}`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(this.data),
      })

      const data = await response.json()

      if (!response.ok) {
        resolve({ data: null, error: { message: data.message || "Erreur" } })
        return
      }

      resolve({ data: Array.isArray(data) ? data[0] : data, error: null })
    } catch (error: any) {
      resolve({ data: null, error: { message: error.message } })
    }
  }
}

class SupabaseUpdateBuilder {
  private tableName: string
  private data: any
  private filters: string[] = []
  private accessToken: string | null = null

  constructor(tableName: string, data: any) {
    this.tableName = tableName
    this.data = data
    const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null
    if (stored) {
      try {
        const session = JSON.parse(stored)
        this.accessToken = session.access_token
      } catch {}
    }
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
      Prefer: "return=representation",
    }
    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`
    }
    return headers
  }

  eq(column: string, value: string | number | boolean) {
    this.filters.push(`${column}=eq.${value}`)
    return this
  }

  select() {
    return this
  }

  single() {
    return this
  }

  async then(resolve: (value: { data: any; error: any }) => void) {
    try {
      const url = `${SUPABASE_URL}/rest/v1/${this.tableName}?${this.filters.join("&")}`
      const response = await fetch(url, {
        method: "PATCH",
        headers: this.getHeaders(),
        body: JSON.stringify(this.data),
      })

      const data = await response.json()

      if (!response.ok) {
        resolve({ data: null, error: { message: data.message || "Erreur" } })
        return
      }

      resolve({ data: Array.isArray(data) ? data[0] : data, error: null })
    } catch (error: any) {
      resolve({ data: null, error: { message: error.message } })
    }
  }
}

class SupabaseDeleteBuilder {
  private tableName: string
  private filters: string[] = []
  private accessToken: string | null = null

  constructor(tableName: string) {
    this.tableName = tableName
    const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null
    if (stored) {
      try {
        const session = JSON.parse(stored)
        this.accessToken = session.access_token
      } catch {}
    }
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
    }
    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`
    }
    return headers
  }

  eq(column: string, value: string | number | boolean) {
    this.filters.push(`${column}=eq.${value}`)
    return this
  }

  async then(resolve: (value: { data: any; error: any }) => void) {
    try {
      const url = `${SUPABASE_URL}/rest/v1/${this.tableName}?${this.filters.join("&")}`
      const response = await fetch(url, {
        method: "DELETE",
        headers: this.getHeaders(),
      })

      if (!response.ok) {
        const data = await response.json()
        resolve({ data: null, error: { message: data.message || "Erreur" } })
        return
      }

      resolve({ data: null, error: null })
    } catch (error: any) {
      resolve({ data: null, error: { message: error.message } })
    }
  }
}

class SupabaseTable {
  private tableName: string

  constructor(tableName: string) {
    this.tableName = tableName
  }

  select(columns = "*") {
    return new SupabaseQueryBuilder(this.tableName).select(columns)
  }

  insert(data: any) {
    return new SupabaseInsertBuilder(this.tableName, data)
  }

  update(data: any) {
    return new SupabaseUpdateBuilder(this.tableName, data)
  }

  delete() {
    return new SupabaseDeleteBuilder(this.tableName)
  }
}

class SupabaseClient {
  auth: SupabaseAuth

  constructor() {
    this.auth = new SupabaseAuth()
  }

  from(tableName: string) {
    return new SupabaseTable(tableName)
  }

  async rpc(functionName: string, params?: Record<string, any>): Promise<{ data: any; error: any }> {
    try {
      const session = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null
      let accessToken: string | null = null
      if (session) {
        try {
          accessToken = JSON.parse(session).access_token
        } catch {}
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
      }
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`
      }

      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${functionName}`, {
        method: "POST",
        headers,
        body: JSON.stringify(params || {}),
      })

      const data = await response.json()

      if (!response.ok) {
        return { data: null, error: { message: data.message || data.error || "Erreur RPC" } }
      }

      return { data, error: null }
    } catch (error: any) {
      return { data: null, error: { message: error.message } }
    }
  }
}

// Singleton instance
let supabaseInstance: SupabaseClient | null = null

function getClient(): SupabaseClient {
  if (!supabaseInstance) {
    supabaseInstance = new SupabaseClient()
  }
  return supabaseInstance
}

export const supabase = getClient()
export function getSupabaseBrowserClient() {
  return getClient()
}
export const getSupabase = () => getClient()

// Export types for compatibility
export type { User, Session }
