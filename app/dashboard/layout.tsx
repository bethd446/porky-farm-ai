"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { LivestockProvider } from "@/contexts/livestock-context"
import { HealthProvider } from "@/contexts/health-context"
import { supabase } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session) {
          setIsAuthenticated(true)
          setIsLoading(false)
        } else {
          // No session, redirect to login
          router.replace("/auth/login")
        }
      } catch (error) {
        console.error("Auth check error:", error)
        router.replace("/auth/login")
      }
    }

    checkAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        setIsAuthenticated(false)
        router.replace("/auth/login")
      } else if (session) {
        setIsAuthenticated(true)
        setIsLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Redirection...</p>
        </div>
      </div>
    )
  }

  return (
    <LivestockProvider>
      <HealthProvider>
        <div className="flex min-h-screen bg-muted/30">
          <DashboardSidebar />
          <div className="flex flex-1 flex-col md:ml-64">
            <DashboardHeader />
            <main className="flex-1 p-4 md:p-6">{children}</main>
          </div>
        </div>
      </HealthProvider>
    </LivestockProvider>
  )
}
