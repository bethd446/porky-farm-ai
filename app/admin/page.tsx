"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import {
  Users,
  AlertCircle,
  Shield,
  Activity,
  Settings,
  ArrowLeft,
  Search,
  Mail,
  Calendar,
  Crown,
  UserCog,
  RefreshCw,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

interface AdminStats {
  total_users: number
  active_users: number
  inactive_users: number
  pro_users: number
  free_users: number
  admins: number
  new_users_today: number
  new_users_week: number
}

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  farm_name: string | null
  subscription_tier: string
  is_active: boolean
  role: string
  created_at: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [recentUsers, setRecentUsers] = useState<UserProfile[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [userRole, setUserRole] = useState<string>("user")

  useEffect(() => {
    checkAdminAccess()
  }, [])

  async function checkAdminAccess() {
    try {
      const session = await supabase.auth.getSession()
      const user = session?.data?.session?.user

      if (!user) {
        router.push("/auth/login")
        return
      }

      // Check admin status via RPC
      const { data: isAdminResult } = await supabase.rpc("is_admin")
      const { data: isSuperAdminResult } = await supabase.rpc("is_super_admin")
      const { data: roleResult } = await supabase.rpc("get_user_role")

      // Fallback to email check if RPC fails (tables not set up yet)
      const adminByEmail = user.email === "openformac@gmail.com"

      if (!isAdminResult && !adminByEmail) {
        router.push("/dashboard")
        return
      }

      setIsAdmin(isAdminResult || adminByEmail)
      setIsSuperAdmin(isSuperAdminResult || adminByEmail)
      setUserRole(roleResult || (adminByEmail ? "super_admin" : "user"))

      await loadAdminData()
    } catch (error) {
      console.error("Error checking admin:", error)
      // Fallback check by email
      const session = await supabase.auth.getSession()
      if (session?.data?.session?.user?.email === "openformac@gmail.com") {
        setIsAdmin(true)
        setIsSuperAdmin(true)
        setUserRole("super_admin")
        await loadAdminData()
      } else {
        router.push("/dashboard")
      }
    }
  }

  async function loadAdminData() {
    try {
      setRefreshing(true)

      // Try to get stats via RPC first
      const { data: rpcStats, error: rpcError } = await supabase.rpc("get_admin_stats")

      if (rpcStats && !rpcError) {
        setStats(rpcStats)
      } else {
        // Fallback to direct query
        const { data: profiles } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })

        if (profiles) {
          const now = new Date()
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

          setStats({
            total_users: profiles.length,
            active_users: profiles.filter((u: any) => u.is_active !== false).length,
            inactive_users: profiles.filter((u: any) => u.is_active === false).length,
            pro_users: profiles.filter((u: any) => u.subscription_tier === "pro" || u.subscription_tier === "enterprise").length,
            free_users: profiles.filter((u: any) => !u.subscription_tier || u.subscription_tier === "free").length,
            admins: profiles.filter((u: any) => u.role === "admin" || u.role === "super_admin").length,
            new_users_today: profiles.filter((u: any) => new Date(u.created_at) >= today).length,
            new_users_week: profiles.filter((u: any) => new Date(u.created_at) >= weekAgo).length,
          })
          setRecentUsers(profiles.slice(0, 20))
        } else {
          // Mock data if no profiles table
          setStats({
            total_users: 12,
            active_users: 10,
            inactive_users: 2,
            pro_users: 3,
            free_users: 9,
            admins: 1,
            new_users_today: 2,
            new_users_week: 5,
          })
        }
      }

      // Load recent users
      const { data: users } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20)

      if (users) {
        setRecentUsers(users)
      }
    } catch (error) {
      console.error("Error loading admin data:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  async function toggleUserStatus(userId: string) {
    try {
      const { error } = await supabase.rpc("toggle_user_status", { target_user_id: userId })

      if (error) {
        // Fallback to direct update
        const user = recentUsers.find((u) => u.id === userId)
        if (user) {
          await supabase.from("profiles").update({ is_active: !user.is_active }).eq("id", userId)
        }
      }

      await loadAdminData()
    } catch (error) {
      console.error("Error toggling user status:", error)
    }
  }

  async function promoteToAdmin(userId: string) {
    if (!isSuperAdmin) return
    try {
      const { error } = await supabase.rpc("promote_to_admin", { target_user_id: userId })
      if (error) throw error
      await loadAdminData()
    } catch (error) {
      console.error("Error promoting user:", error)
    }
  }

  async function demoteToUser(userId: string) {
    if (!isSuperAdmin) return
    try {
      const { error } = await supabase.rpc("demote_to_user", { target_user_id: userId })
      if (error) throw error
      await loadAdminData()
    } catch (error) {
      console.error("Error demoting user:", error)
    }
  }

  const filteredUsers = recentUsers.filter(
    (user) =>
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Chargement du panneau admin...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <Shield className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Acces Refuse</h1>
          <p className="text-muted-foreground mb-4">Droits administrateur requis</p>
          <Link href="/dashboard">
            <Button>Retour au Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Admin */}
      <header className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-card/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground hidden sm:block">PorkyFarm Management</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Badge
                variant={isSuperAdmin ? "destructive" : "default"}
                className="px-2 sm:px-3 py-1 text-xs sm:text-sm flex items-center gap-1"
              >
                {isSuperAdmin && <Crown className="w-3 h-3" />}
                {isSuperAdmin ? "SUPER ADMIN" : "ADMIN"}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => loadAdminData()}
                disabled={refreshing}
                className="bg-transparent"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              </Button>
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Retour App</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">Utilisateurs</p>
              <p className="text-2xl sm:text-3xl font-bold mt-1">{stats?.total_users || 0}</p>
              <p className="text-xs text-primary mt-1 sm:mt-2">+{stats?.new_users_today || 0} aujourd'hui</p>
            </div>
          </Card>

          <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" />
              </div>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">Actifs</p>
              <p className="text-2xl sm:text-3xl font-bold mt-1">{stats?.active_users || 0}</p>
              <p className="text-xs text-red-500 mt-1 sm:mt-2">{stats?.inactive_users || 0} inactifs</p>
            </div>
          </Card>

          <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-500/10 rounded-xl flex items-center justify-center">
                <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />
              </div>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">Pro</p>
              <p className="text-2xl sm:text-3xl font-bold mt-1">{stats?.pro_users || 0}</p>
              <p className="text-xs text-muted-foreground mt-1 sm:mt-2">{stats?.free_users || 0} gratuits</p>
            </div>
          </Card>

          <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
              </div>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">Admins</p>
              <p className="text-2xl sm:text-3xl font-bold mt-1">{stats?.admins || 1}</p>
              <p className="text-xs text-muted-foreground mt-1 sm:mt-2">+{stats?.new_users_week || 0} cette semaine</p>
            </div>
          </Card>
        </div>

        {/* Navigation rapide */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Button variant="outline" className="h-auto py-3 sm:py-4 flex-col gap-1 sm:gap-2 bg-transparent">
            <Users className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="text-xs sm:text-sm">Utilisateurs</span>
          </Button>
          <Button variant="outline" className="h-auto py-3 sm:py-4 flex-col gap-1 sm:gap-2 bg-transparent">
            <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="text-xs sm:text-sm">Support</span>
          </Button>
          <Button variant="outline" className="h-auto py-3 sm:py-4 flex-col gap-1 sm:gap-2 bg-transparent">
            <Activity className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="text-xs sm:text-sm">Analytics</span>
          </Button>
          <Button variant="outline" className="h-auto py-3 sm:py-4 flex-col gap-1 sm:gap-2 bg-transparent">
            <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="text-xs sm:text-sm">Parametres</span>
          </Button>
        </div>

        {/* Search */}
        <div className="mb-4 sm:mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Rechercher par email ou nom..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Utilisateurs récents */}
        <Card className="p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold mb-4">Utilisateurs Recents</h2>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Utilisateur</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Role</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Plan</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Statut</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Inscription</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      Aucun utilisateur trouve
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="border-t border-border hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            {user.role === "super_admin" ? (
                              <Crown className="w-5 h-5 text-amber-500" />
                            ) : user.role === "admin" ? (
                              <Shield className="w-5 h-5 text-purple-500" />
                            ) : (
                              <Users className="w-5 h-5 text-primary" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold">{user.full_name || "Sans nom"}</p>
                            <p className="text-sm text-muted-foreground">{user.farm_name || "Ferme non definie"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm">{user.email}</td>
                      <td className="px-4 py-4">
                        <Badge
                          variant={
                            user.role === "super_admin"
                              ? "destructive"
                              : user.role === "admin"
                                ? "default"
                                : "secondary"
                          }
                          className="capitalize"
                        >
                          {user.role || "user"}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant={user.subscription_tier === "pro" ? "default" : "secondary"}>
                          {user.subscription_tier || "free"}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant={user.is_active !== false ? "default" : "destructive"}>
                          {user.is_active !== false ? "Actif" : "Inactif"}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-sm text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {isSuperAdmin && user.role !== "super_admin" && (
                            <>
                              {user.role === "admin" ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => demoteToUser(user.id)}
                                  className="gap-1"
                                >
                                  <UserCog className="w-3 h-3" />
                                  Rétrograder
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => promoteToAdmin(user.id)}
                                  className="gap-1"
                                >
                                  <Shield className="w-3 h-3" />
                                  Promouvoir
                                </Button>
                              )}
                            </>
                          )}
                          {user.role !== "super_admin" && (
                            <Button
                              size="sm"
                              variant={user.is_active !== false ? "destructive" : "default"}
                              onClick={() => toggleUserStatus(user.id)}
                            >
                              {user.is_active !== false ? "Desactiver" : "Activer"}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Aucun utilisateur trouve</div>
            ) : (
              filteredUsers.map((user) => (
                <div key={user.id} className="p-4 bg-secondary/30 rounded-xl">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        {user.role === "super_admin" ? (
                          <Crown className="w-5 h-5 text-amber-500" />
                        ) : user.role === "admin" ? (
                          <Shield className="w-5 h-5 text-purple-500" />
                        ) : (
                          <Users className="w-5 h-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold">{user.full_name || "Sans nom"}</p>
                        <p className="text-xs text-muted-foreground">{user.farm_name || "Ferme non definie"}</p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        user.role === "super_admin" ? "destructive" : user.role === "admin" ? "default" : "secondary"
                      }
                      className="capitalize text-xs"
                    >
                      {user.role || "user"}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(user.created_at).toLocaleDateString("fr-FR")}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                    <div className="flex gap-2">
                      <Badge variant={user.subscription_tier === "pro" ? "default" : "secondary"} className="text-xs">
                        {user.subscription_tier || "free"}
                      </Badge>
                      <Badge variant={user.is_active !== false ? "default" : "destructive"} className="text-xs">
                        {user.is_active !== false ? "Actif" : "Inactif"}
                      </Badge>
                    </div>
                    {user.role !== "super_admin" && (
                      <Button
                        size="sm"
                        variant={user.is_active !== false ? "destructive" : "default"}
                        onClick={() => toggleUserStatus(user.id)}
                      >
                        {user.is_active !== false ? "Desactiver" : "Activer"}
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </main>
    </div>
  )
}
