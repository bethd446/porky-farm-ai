import { supabase } from "@/lib/supabase/client"

/**
 * Vérifie si l'utilisateur connecté est admin
 */
export async function checkIsAdmin(): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc("is_admin")
    if (error) throw error
    return data === true
  } catch {
    // Fallback: vérifier par email
    const { data: session } = await supabase.auth.getSession()
    return session?.session?.user?.email === "openformac@gmail.com"
  }
}

/**
 * Vérifie si l'utilisateur connecté est super admin
 */
export async function checkIsSuperAdmin(): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc("is_super_admin")
    if (error) throw error
    return data === true
  } catch {
    // Fallback: vérifier par email
    const { data: session } = await supabase.auth.getSession()
    return session?.session?.user?.email === "openformac@gmail.com"
  }
}

/**
 * Récupère le rôle de l'utilisateur connecté
 */
export async function getUserRole(): Promise<string> {
  try {
    const { data, error } = await supabase.rpc("get_user_role")
    if (error) throw error
    return data || "user"
  } catch {
    const { data: session } = await supabase.auth.getSession()
    if (session?.session?.user?.email === "openformac@gmail.com") {
      return "super_admin"
    }
    return "user"
  }
}

/**
 * Récupère les statistiques admin (nécessite admin)
 */
export async function getAdminStats(): Promise<AdminStats | null> {
  try {
    const { data, error } = await supabase.rpc("get_admin_stats")
    if (error) throw error
    return data
  } catch {
    return null
  }
}

/**
 * Promeut un utilisateur au rôle admin (nécessite super_admin)
 */
export async function promoteToAdmin(targetUserId: string): Promise<boolean> {
  try {
    const { error } = await supabase.rpc("promote_to_admin", { target_user_id: targetUserId })
    if (error) throw error
    return true
  } catch (error) {
    console.error("Erreur promotion admin:", error)
    return false
  }
}

/**
 * Rétrograde un admin au rôle utilisateur (nécessite super_admin)
 */
export async function demoteToUser(targetUserId: string): Promise<boolean> {
  try {
    const { error } = await supabase.rpc("demote_to_user", { target_user_id: targetUserId })
    if (error) throw error
    return true
  } catch (error) {
    console.error("Erreur rétrogradation:", error)
    return false
  }
}

/**
 * Active/désactive un compte utilisateur (nécessite admin)
 */
export async function toggleUserStatus(targetUserId: string): Promise<boolean> {
  try {
    const { error } = await supabase.rpc("toggle_user_status", { target_user_id: targetUserId })
    if (error) throw error
    return true
  } catch (error) {
    console.error("Erreur toggle status:", error)
    // Fallback: mise à jour directe
    try {
      const { data: user } = await supabase.from("profiles").select("is_active").eq("id", targetUserId).single()
      if (user) {
        await supabase.from("profiles").update({ is_active: !user.is_active }).eq("id", targetUserId)
        return true
      }
    } catch {
      // Ignore
    }
    return false
  }
}

// Types
export interface AdminStats {
  total_users: number
  active_users: number
  inactive_users: number
  pro_users: number
  free_users: number
  admins: number
  new_users_today: number
  new_users_week: number
  total_pigs?: number
  open_tickets?: number
}

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  farm_name: string | null
  subscription_tier: string
  is_active: boolean
  role: string
  created_at: string
}
