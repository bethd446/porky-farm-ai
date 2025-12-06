import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { DashboardWeather } from "@/components/dashboard/dashboard-weather"
import { DashboardAlerts } from "@/components/dashboard/dashboard-alerts"
import { DashboardQuickActions } from "@/components/dashboard/dashboard-quick-actions"
import { DashboardRecentActivity } from "@/components/dashboard/dashboard-recent-activity"
import { DashboardLivestockOverview } from "@/components/dashboard/dashboard-livestock-overview"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">Bonjour, Kouamé !</h1>
          <p className="text-muted-foreground">Voici un aperçu de votre élevage aujourd'hui</p>
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
