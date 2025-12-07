// Composant unifie pour les badges de statut
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  getStatusColor,
  getStatusLabel,
  getPriorityColor,
  getPriorityLabel,
  getCaseStatusColor,
  getCaseStatusLabel,
  type AnimalStatus,
  type Priority,
  type CaseStatus,
} from "@/lib/utils/animal-helpers"

interface StatusBadgeProps {
  type: "animal" | "priority" | "case"
  value: string
  className?: string
}

export function StatusBadge({ type, value, className }: StatusBadgeProps) {
  let colorClass = ""
  let label = ""

  switch (type) {
    case "animal":
      colorClass = getStatusColor(value as AnimalStatus)
      label = getStatusLabel(value as AnimalStatus)
      break
    case "priority":
      colorClass = getPriorityColor(value as Priority)
      label = getPriorityLabel(value as Priority)
      break
    case "case":
      colorClass = getCaseStatusColor(value as CaseStatus)
      label = getCaseStatusLabel(value as CaseStatus)
      break
  }

  return <Badge className={cn(colorClass, "text-white", className)}>{label}</Badge>
}

// Variantes specifiques pour usage plus simple
export function AnimalStatusBadge({ status, className }: { status: AnimalStatus; className?: string }) {
  return <StatusBadge type="animal" value={status} className={className} />
}

export function PriorityBadge({ priority, className }: { priority: Priority; className?: string }) {
  return <StatusBadge type="priority" value={priority} className={className} />
}

export function CaseStatusBadge({ status, className }: { status: CaseStatus; className?: string }) {
  return <StatusBadge type="case" value={status} className={className} />
}
