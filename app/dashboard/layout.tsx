"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
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
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[v0] Auth state changed:", event, session ? "has session" : "no session")

      if (session) {
        setIsAuthenticated(true)
        setIsLoading(false)
      } else if (event === "SIGNED_OUT" || (event === "TOKEN_REFRESHED" && !session)) {
        router.push("/auth/login")
      }
    })

    // Check initial session
    const checkInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      console.log("[v0] Initial session check:", session ? "authenticated" : "not authenticated")

      if (session) {
        setIsAuthenticated(true)
        setIsLoading(false)
      } else {
        // Wait a bit for session to be restored from storage
        setTimeout(async () => {
          const {
            data: { session: retrySession },
          } = await supabase.auth.getSession()
          if (retrySession) {
            setIsAuthenticated(true)
            setIsLoading(false)
          } else {
            router.push("/auth/login")
          }
        }, 500)
      }
    }

    checkInitialSession()

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Chargement du tableau de bord...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col md:ml-64">
        <DashboardHeader />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
