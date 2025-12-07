"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Bell, Search, Sun, Cloud, CloudRain, MapPin, User, Settings, LogOut, HelpCircle, Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useApp } from "@/contexts/app-context"

interface UserProfile {
  fullName: string
  farmName: string
  location: string
  email: string
}

export function DashboardHeader() {
  const router = useRouter()
  const { alerts } = useApp()

  const [profile, setProfile] = useState<UserProfile>({
    fullName: "Eleveur PorkyFarm",
    farmName: "Ma Ferme",
    location: "Cote d'Ivoire",
    email: "contact@porkyfarm.app",
  })

  const [weather, setWeather] = useState({
    temp: 28,
    condition: "sunny",
    humidity: 65,
    location: "Abidjan, CI",
  })
  const [currentTime, setCurrentTime] = useState(new Date())
  const [searchQuery, setSearchQuery] = useState("")

  const [notifications, setNotifications] = useState<
    Array<{
      id: string
      title: string
      message: string
      time: string
      type: string
      read: boolean
    }>
  >([])

  useEffect(() => {
    // Load saved profile
    const savedProfile = localStorage.getItem("porkyfarm-user-profile")
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile)
      setProfile({
        fullName: parsed.fullName || "Eleveur PorkyFarm",
        farmName: parsed.farmName || "Ma Ferme",
        location: parsed.location || "Cote d'Ivoire",
        email: parsed.email || "contact@porkyfarm.app",
      })
    }

    // Generate notifications from alerts
    const notifs = alerts.slice(0, 5).map((alert, idx) => ({
      id: `notif-${idx}`,
      title: alert.title,
      message: alert.description,
      time: "Maintenant",
      type: alert.type,
      read: false,
    }))
    setNotifications(notifs)
  }, [alerts])

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

  const firstName = profile.fullName.split(" ")[0]

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/dashboard/livestock?search=${encodeURIComponent(searchQuery)}`)
      setSearchQuery("")
    }
  }

  const handleLogout = () => {
    // Clear session data
    localStorage.removeItem("porkyfarm-session")
    window.location.href = "/auth/login"
  }

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const handleNotificationClick = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

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

        <form onSubmit={handleSearch} className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher un animal..."
            className="h-10 w-56 rounded-full border-muted bg-muted pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative rounded-full">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-white">
                  {unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifications</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-xs text-primary hover:bg-transparent"
                onClick={handleMarkAllRead}
              >
                <Check className="h-3 w-3 mr-1" />
                Tout marquer comme lu
              </Button>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <DropdownMenuItem
                  key={notif.id}
                  className={`flex flex-col items-start gap-1 p-3 cursor-pointer ${notif.read ? "opacity-60" : ""}`}
                  onClick={() => handleNotificationClick(notif.id)}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="font-medium text-sm">{notif.title}</span>
                    <span className="text-xs text-muted-foreground">{notif.time}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{notif.message}</span>
                </DropdownMenuItem>
              ))
            ) : (
              <div className="py-6 text-center text-sm text-muted-foreground">Aucune notification</div>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings" className="w-full text-center text-sm text-primary">
                Voir toutes les notifications
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full p-1 transition hover:bg-muted">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                {firstName.charAt(0).toUpperCase()}
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>{profile.fullName}</span>
                <span className="text-xs font-normal text-muted-foreground">{profile.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile" className="flex items-center gap-2 cursor-pointer">
                <User className="h-4 w-4" />
                Mon profil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings" className="flex items-center gap-2 cursor-pointer">
                <Settings className="h-4 w-4" />
                Parametres
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/support" className="flex items-center gap-2 cursor-pointer">
                <HelpCircle className="h-4 w-4" />
                Aide & Support
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="flex items-center gap-2 text-destructive cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              Deconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
