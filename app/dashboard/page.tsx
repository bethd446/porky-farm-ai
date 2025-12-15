"use client"

import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { DashboardWeather } from "@/components/dashboard/dashboard-weather"
import { DashboardAlerts } from "@/components/dashboard/dashboard-alerts"
import { DashboardQuickActions } from "@/components/dashboard/dashboard-quick-actions"
import { DashboardRecentActivity } from "@/components/dashboard/dashboard-recent-activity"
import { DashboardLivestockOverview } from "@/components/dashboard/dashboard-livestock-overview"
import { DashboardPlanning } from "@/components/dashboard/dashboard-planning"
import { useAuthContext } from "@/contexts/auth-context"
import { useApp } from "@/contexts/app-context"

export default function DashboardPage() {
  const { user, profile } = useAuthContext()
  const { stats } = useApp()

  const firstName = profile?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Eleveur"

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Bonjour"
    if (hour < 18) return "Bon apres-midi"
    return "Bonsoir"
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">
            {getGreeting()}, {firstName} !
          </h1>
          <p className="text-muted-foreground">
            {stats.totalAnimals > 0
              ? `Votre elevage compte ${stats.totalAnimals} animal${stats.totalAnimals > 1 ? "aux" : ""}`
              : "Commencez par ajouter vos animaux pour suivre votre elevage"}
          </p>
        </div>
        <DashboardQuickActions />
      </div>

      {/* Stats Grid - Vue d'ensemble chiffree */}
      <DashboardStats />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Apercu du cheptel - Repartition des animaux */}
          <DashboardLivestockOverview />

          {/* Planning intelligent - Taches automatiques */}
          <DashboardPlanning />

          {/* Activite recente - Historique */}
          <DashboardRecentActivity />
        </div>

        <div className="space-y-6">
          {/* Alertes & Rappels - Priorite haute */}
          <DashboardAlerts />

          {/* Meteo - Information contextuelle */}
          <DashboardWeather />
        </div>
      </div>
    </div>
  )
}
