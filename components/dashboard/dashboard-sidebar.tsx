"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from 'next/navigation'
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase/client"
import { LayoutDashboard, PiggyBank, Stethoscope, Baby, Calculator, Brain, User, Settings, LogOut, Menu, X, ChevronDown, Loader2 } from 'lucide-react'

const menuItems = [
  {
    label: "Tableau de bord",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    label: "Cheptel",
    icon: PiggyBank,
    href: "/dashboard/livestock",
    submenu: [
      { label: "Tous les animaux", href: "/dashboard/livestock" },
      { label: "Truies", href: "/dashboard/livestock/sows" },
      { label: "Verrats", href: "/dashboard/livestock/boars" },
      { label: "Porcelets", href: "/dashboard/livestock/piglets" },
    ],
  },
  {
    label: "Santé & Vétérinaire",
    icon: Stethoscope,
    href: "/dashboard/health",
  },
  {
    label: "Reproduction",
    icon: Baby,
    href: "/dashboard/reproduction",
  },
  {
    label: "Alimentation",
    icon: Calculator,
    href: "/dashboard/feeding",
  },
  {
    label: "Assistant IA",
    icon: Brain,
    href: "/dashboard/ai-assistant",
  },
  {
    label: "Profil",
    icon: User,
    href: "/dashboard/profile",
  },
  {
    label: "Paramètres",
    icon: Settings,
    href: "/dashboard/settings",
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [expandedItem, setExpandedItem] = useState<string | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await supabase.auth.signOut()
      window.location.href = "/"
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-primary-foreground" fill="currentColor">
            <path d="M12 2C8.5 2 5.5 4.5 5.5 8c0 2.5 1.5 4.5 3.5 5.5v2c0 .5.5 1 1 1h4c.5 0 1-.5 1-1v-2c2-1 3.5-3 3.5-5.5 0-3.5-3-6-6.5-6z" />
            <circle cx="9" cy="7" r="1.5" />
            <circle cx="15" cy="7" r="1.5" />
            <path d="M10 10h4c0 1-1 2-2 2s-2-1-2-2z" />
          </svg>
        </div>
        <span className="text-lg font-bold text-foreground">PorkyFarm</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          const hasSubmenu = item.submenu && item.submenu.length > 0
          const isExpanded = expandedItem === item.label

          return (
            <div key={item.label}>
              <Link
                href={item.href}
                onClick={(e) => {
                  if (hasSubmenu) {
                    // Toggle submenu but also allow navigation
                    setExpandedItem(isExpanded ? null : item.label)
                  }
                  setMobileOpen(false)
                }}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                  isActive ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="flex-1">{item.label}</span>
                {hasSubmenu && (
                  <ChevronDown 
                    className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-180")} 
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setExpandedItem(isExpanded ? null : item.label)
                    }}
                  />
                )}
              </Link>

              {hasSubmenu && isExpanded && (
                <div className="ml-8 mt-1 space-y-1">
                  {item.submenu.map((sub) => (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "block rounded-lg px-4 py-2 text-sm transition-colors",
                        pathname === sub.href
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-border p-4">
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
        >
          {isLoggingOut ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogOut className="h-5 w-5" />}
          {isLoggingOut ? "Déconnexion..." : "Déconnexion"}
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="fixed left-4 top-4 z-50 rounded-xl bg-card p-2 shadow-md md:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col bg-card shadow-lg">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 hidden h-screen w-64 flex-col border-r border-border bg-card md:flex">
        <SidebarContent />
      </aside>
    </>
  )
}
