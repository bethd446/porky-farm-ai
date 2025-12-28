/**
 * Composant StatCard réutilisable avec variante premium
 * Carte de statistique avec design system + ultra design (gradients, ombres, animations)
 */

"use client"

import { Card } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { colors, spacing, shadows, typography, radius } from "@/lib/design-tokens"
import { premiumGradients, premiumShadows, premiumAnimations } from "@/lib/premium-styles"
import { useState } from "react"

interface StatCardProps {
  label: string
  value: string | number
  change?: string
  changeType?: "positive" | "negative" | "neutral"
  icon: LucideIcon
  colorClass?: string
  onClick?: () => void
  className?: string
  premium?: boolean
  variant?: "primary" | "success" | "warning" | "info"
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
  premium = true,
  variant = "primary",
}: StatCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const getGradient = () => {
    switch (variant) {
      case "success":
        return premiumGradients.success.icon
      case "warning":
        return premiumGradients.warning.icon
      case "info":
        return premiumGradients.info.icon
      default:
        return premiumGradients.primary.medium
    }
  }

  return (
    <Card
      className={cn(
        "p-4 sm:p-6 border border-border",
        premium ? "transition-all duration-200" : shadows.md,
        onClick && "cursor-pointer",
        premium && isHovered && "-translate-y-0.5",
        className
      )}
      style={{
        ...(premium && {
          boxShadow: isHovered ? premiumShadows.card.medium : premiumShadows.card.soft,
          borderRadius: radius.lg,
        }),
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
        {premium ? (
          <div
            className={cn(
              "rounded-xl p-2.5 sm:p-3 transition-transform duration-200",
              isHovered && "scale-110"
            )}
            style={{
              background: getGradient(),
              boxShadow: premiumShadows.icon.soft,
            }}
          >
            <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
        ) : (
          <div
            className={cn(
              "rounded-xl p-2.5 sm:p-3",
              colorClass || "bg-primary/10 text-primary"
            )}
          >
            <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
        )}
      </div>
    </Card>
  )
}

