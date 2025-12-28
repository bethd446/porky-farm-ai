/**
 * Composant EmptyState réutilisable
 * Pour afficher un état vide avec illustration, texte et CTA
 */

"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LucideIcon } from "lucide-react"

interface EmptyStateProps {
  icon?: LucideIcon | string
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
    variant?: "default" | "outline" | "ghost"
  }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  const IconComponent = typeof icon === "string" ? null : icon

  return (
    <Card className="p-8 md:p-12 text-center">
      <div className="flex flex-col items-center gap-4">
        {/* Illustration */}
        {IconComponent ? (
          <IconComponent className="h-16 w-16 text-muted-foreground opacity-50" />
        ) : typeof icon === "string" ? (
          <div className="text-6xl opacity-50">{icon}</div>
        ) : null}

        {/* Titre */}
        <h3 className="text-xl font-semibold text-foreground">{title}</h3>

        {/* Description */}
        <p className="text-muted-foreground max-w-md leading-relaxed">{description}</p>

        {/* CTA */}
        {action && (
          <Button
            variant={action.variant || "default"}
            size="lg"
            onClick={action.onClick}
            className="mt-4"
          >
            {action.label}
          </Button>
        )}
      </div>
    </Card>
  )
}

