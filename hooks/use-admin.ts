"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import {
  checkIsAdmin,
  checkIsSuperAdmin,
  getUserRole,
  getAdminStats,
  promoteToAdmin as promoteAdmin,
  demoteToUser as demoteUser,
  toggleUserStatus as toggleStatus,
  type AdminStats,
  type UserProfile,
} from "@/lib/admin/admin-utils"

export function useAdmin() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [userRole, setUserRole] = useState<string>("user")
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<UserProfile[]>([])
  const [refreshing, setRefreshing] = useState(false)

  const checkAccess = useCallback(async () => {
    try {
      const session = await supabase.auth.getSession()
      const user = session?.data?.session?.user

      if (!user) {
        router.push("/auth/login")
        return false
      }

      const [adminResult, superAdminResult, roleResult] = await Promise.all([
        checkIsAdmin(),
        checkIsSuperAdmin(),
        getUserRole(),
      ])

      setIsAdmin(adminResult)
      setIsSuperAdmin(superAdminResult)
      setUserRole(roleResult)

      if (!adminResult) {
        router.push("/dashboard")
        return false
      }

      return true
    } catch (error) {
      console.error("Error checking admin access:", error)
      router.push("/dashboard")
      return false
    } finally {
      setLoading(false)
    }
  }, [router])

  const loadData = useCallback(async () => {
    setRefreshing(true)
    try {
      // Charger les stats
      const statsData = await getAdminStats()
      if (statsData) {
        setStats(statsData)
      } else {
        // Fallback: calcul depuis profiles
        const { data: profiles } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })

        if (profiles) {
          const now = new Date()
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

          setStats({
            total_users: profiles.length,
            active_users: profiles.filter((u: any) => u.is_active !== false).length,
            inactive_users: profiles.filter((u: any) => u.is_active === false).length,
            pro_users: profiles.filter((u: any) => u.subscription_tier === "pro").length,
            free_users: profiles.filter((u: any) => u.subscription_tier !== "pro").length,
            admins: profiles.filter((u: any) => u.role === "admin" || u.role === "super_admin").length || 1,
            new_users_today: profiles.filter((u: any) => new Date(u.created_at) >= today).length,
            new_users_week: profiles.filter((u: any) => new Date(u.created_at) >= weekAgo).length,
          })
          setUsers(profiles.slice(0, 50))
        }
      }

      // Charger les utilisateurs
      const { data: usersData } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50)

      if (usersData) {
        setUsers(usersData)
      }
    } catch (error) {
      console.error("Error loading admin data:", error)
    } finally {
      setRefreshing(false)
    }
  }, [])

  const promoteToAdmin = useCallback(
    async (userId: string) => {
      if (!isSuperAdmin) return false
      const success = await promoteAdmin(userId)
      if (success) await loadData()
      return success
    },
    [isSuperAdmin, loadData],
  )

  const demoteToUser = useCallback(
    async (userId: string) => {
      if (!isSuperAdmin) return false
      const success = await demoteUser(userId)
      if (success) await loadData()
      return success
    },
    [isSuperAdmin, loadData],
  )

  const toggleUserStatus = useCallback(
    async (userId: string) => {
      const success = await toggleStatus(userId)
      if (success) await loadData()
      return success
    },
    [loadData],
  )

  useEffect(() => {
    checkAccess().then((hasAccess) => {
      if (hasAccess) loadData()
    })
  }, [checkAccess, loadData])

  return {
    isAdmin,
    isSuperAdmin,
    userRole,
    loading,
    refreshing,
    stats,
    users,
    loadData,
    promoteToAdmin,
    demoteToUser,
    toggleUserStatus,
  }
}
