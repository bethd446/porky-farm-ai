"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Bell, Search, Sun, Cloud, CloudRain, MapPin } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuthContext } from "@/contexts/auth-context"

export function DashboardHeader() {
  const { profile } = useAuthContext()
  const [weather, setWeather] = useState({
    temp: 28,
    condition: "sunny",
    humidity: 65,
    location: "Abidjan, CI",
  })
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const getWeatherIcon = () => {
    switch (weather.condition) {
      case "sunny":
        return <Sun className="h-5 w-5 text-amber-500" />
      case "cloudy":
        return <Cloud className="h-5 w-5 text-gray-500" />
      case "rainy":
        return <CloudRain className="h-5 w-5 text-blue-500" />
      default:
        return <Sun className="h-5 w-5 text-amber-500" />
    }
  }

  const firstName = profile?.full_name?.split(" ")[0] || "Utilisateur"

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-card/60 md:px-6">
      <div className="flex items-center gap-4">
        <div className="ml-12 md:ml-0">
          <p className="text-sm text-muted-foreground">
            {currentTime.toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
          <h2 className="text-lg font-semibold text-foreground">Bonjour, {firstName}</h2>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Weather Widget */}
        <div className="hidden items-center gap-2 rounded-full bg-muted px-4 py-2 lg:flex">
          {getWeatherIcon()}
          <span className="text-sm font-medium">{weather.temp}°C</span>
          <div className="h-4 w-px bg-border" />
          <MapPin className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{weather.location}</span>
        </div>

        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Rechercher..." className="h-10 w-56 rounded-full border-muted bg-muted pl-10" />
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative rounded-full">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-white">
            3
          </span>
        </Button>

        {/* Profile */}
        <Link href="/dashboard/profile">
          <button className="flex items-center gap-2 rounded-full p-1 transition hover:bg-muted">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
              {firstName.charAt(0).toUpperCase()}
            </div>
          </button>
        </Link>
      </div>
    </header>
  )
}
