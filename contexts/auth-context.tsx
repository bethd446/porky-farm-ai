"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useAuth } from "@/hooks/use-auth"
import type { User, Session } from "@supabase/supabase-js"
import type { Profile } from "@/lib/supabase/types"

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ data: any; error: any }>
  signOut: () => Promise<{ error: any }>
  updateProfile: (updates: Partial<Profile>) => Promise<{ data: any; error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth()

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    // Return a default context for components that might render before provider
    return {
      user: null,
      session: null,
      profile: null,
      loading: true,
      signIn: async () => ({ data: null, error: new Error("Auth not initialized") }),
      signUp: async () => ({ data: null, error: new Error("Auth not initialized") }),
      signOut: async () => ({ error: new Error("Auth not initialized") }),
      updateProfile: async () => ({ data: null, error: new Error("Auth not initialized") }),
    }
  }
  return context
}
