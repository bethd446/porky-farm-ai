import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"

/**
 * Helper d'authentification unifie pour Web (cookies) et Mobile (Bearer token)
 *
 * USAGE WEB :
 * Les cookies Supabase sont automatiquement envoyes via credentials: 'include'
 *
 * USAGE MOBILE (Expo/React Native) :
 * Envoyer le header Authorization: Bearer <access_token>
 * Le token est obtenu via supabase.auth.getSession() cote mobile
 */
export async function getAuthenticatedUser(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  // 1. Essayer d'abord le header Authorization (mobile)
  const authHeader = request.headers.get("Authorization")
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7)

    // Creer un client Supabase avec le token
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    })

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token)

    if (error || !user) {
      return { user: null, supabase: null, error: "Token invalide" }
    }

    return { user, supabase, error: null }
  }

  // 2. Fallback sur les cookies (web)
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    })

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return { user: null, supabase: null, error: "Non authentifie" }
    }

    return { user, supabase, error: null }
  } catch {
    return { user: null, supabase: null, error: "Erreur d'authentification" }
  }
}

/**
 * Version simplifiee pour obtenir le client Supabase authentifie
 */
export async function getSupabaseClient(request: Request) {
  const result = await getAuthenticatedUser(request)
  return result
}
