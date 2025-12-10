"use client"

import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { DashboardWeather } from "@/components/dashboard/dashboard-weather"
import { DashboardAlerts } from "@/components/dashboard/dashboard-alerts"
import { DashboardQuickActions } from "@/components/dashboard/dashboard-quick-actions"
import { DashboardRecentActivity } from "@/components/dashboard/dashboard-recent-activity"
import { DashboardLivestockOverview } from "@/components/dashboard/dashboard-livestock-overview"
import { useAuthContext } from "@/contexts/auth-context"
import { useApp } from "@/contexts/app-context"

export default function DashboardPage() {
  const { user, profile } = useAuthContext()
  const { stats } = useApp()

  const firstName = profile?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Eleveur"

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Bonjour"
    if (hour < 18) return "Bon après-midi"
    return "Bonsoir"
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section - Titre plus personnalisé */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">
            {getGreeting()}, {firstName} !
          </h1>
          <p className="text-muted-foreground">
            {stats.totalAnimals > 0
              ? `Vous avez ${stats.totalAnimals} animaux dans votre élevage`
              : "Bienvenue sur votre tableau de bord"}
          </p>
        </div>
        <DashboardQuickActions />
      </div>

      {/* Stats Grid */}
      <DashboardStats />

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <DashboardLivestockOverview />
          <DashboardRecentActivity />
        </div>
        <div className="space-y-6">
          <DashboardWeather />
          <DashboardAlerts />
        </div>
      </div>
    </div>
  )
}
