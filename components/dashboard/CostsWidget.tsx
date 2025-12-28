/**
 * Widget Coûts & Finances pour le Dashboard
 * Affiche un résumé des dépenses et entrées sur les 30 derniers jours
 */

"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, DollarSign, ArrowRight } from "lucide-react"
import { getCostSummary } from "@/lib/supabase/costs"
import { StatCard } from "@/components/common/StatCard"
import Link from "next/link"
import { toast } from "@/lib/toast"

interface CostSummary {
  totalExpenses: number
  totalIncome: number
  balance: number
}

export function CostsWidget() {
  const [summary, setSummary] = useState<CostSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSummary()
  }, [])

  const loadSummary = async () => {
    setLoading(true)
    const { data, error } = await getCostSummary("month")
    if (error) {
      console.error("[CostsWidget] Error loading summary:", error)
      toast.error("Erreur lors du chargement des données financières")
    } else {
      setSummary(data)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Coûts & Finances</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-8 bg-muted animate-pulse rounded" />
            <div className="h-8 bg-muted animate-pulse rounded" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!summary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Coûts & Finances</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Aucune donnée disponible</p>
        </CardContent>
      </Card>
    )
  }

  const formatAmount = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`
    }
    return amount.toLocaleString("fr-FR")
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Coûts & Finances</CardTitle>
        <Link href="/dashboard/costs">
          <Button variant="ghost" size="sm">
            Voir tout
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Dépenses */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-destructive/10">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-destructive" />
            <span className="text-sm font-medium">Dépenses (30j)</span>
          </div>
          <span className="text-lg font-bold text-destructive">
            {formatAmount(summary.totalExpenses)} FCFA
          </span>
        </div>

        {/* Entrées */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-success/10">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-success" />
            <span className="text-sm font-medium">Entrées (30j)</span>
          </div>
          <span className="text-lg font-bold text-success">
            {formatAmount(summary.totalIncome)} FCFA
          </span>
        </div>

        {/* Solde */}
        <div
          className={`flex items-center justify-between p-3 rounded-lg ${
            summary.balance >= 0 ? "bg-success/10" : "bg-destructive/10"
          }`}
        >
          <div className="flex items-center gap-2">
            <DollarSign
              className={`h-5 w-5 ${summary.balance >= 0 ? "text-success" : "text-destructive"}`}
            />
            <span className="text-sm font-medium">Solde</span>
          </div>
          <span
            className={`text-lg font-bold ${
              summary.balance >= 0 ? "text-success" : "text-destructive"
            }`}
          >
            {summary.balance >= 0 ? "+" : ""}
            {formatAmount(summary.balance)} FCFA
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

