/**
 * Composant StatCard réutilisable
 * Carte de statistique avec design system
 */

"use client"

import { Card } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { colors, spacing, shadows, typography } from "@/lib/design-tokens"

interface StatCardProps {
  label: string
  value: string | number
  change?: string
  changeType?: "positive" | "negative" | "neutral"
  icon: LucideIcon
  colorClass?: string
  onClick?: () => void
  className?: string
}

export function StatCard({
  label,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  colorClass,
  onClick,
  className,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "p-4 sm:p-6 border border-border",
        shadows.md,
        onClick && "cursor-pointer hover:shadow-lg transition-shadow",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs sm:text-sm text-muted-foreground font-medium mb-1">{label}</p>
          <p className="text-2xl sm:text-3xl font-bold text-foreground">
            {value}
          </p>
          {change && (
            <p
              className={cn(
                "mt-1 text-xs sm:text-sm font-medium",
                changeType === "positive" && "text-success",
                changeType === "negative" && "text-warning",
                changeType === "neutral" && "text-muted-foreground"
              )}
            >
              {change}
            </p>
          )}
        </div>
        <div
          className={cn(
            "rounded-xl p-2.5 sm:p-3",
            colorClass || "bg-primary/10 text-primary"
          )}
        >
          <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
      </div>
    </Card>
  )
}

