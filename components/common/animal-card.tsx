"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical, Eye, Edit, Trash2, Camera } from "lucide-react"
import { cn } from "@/lib/utils"

interface AnimalCardProps {
  id: string
  name: string
  identifier?: string
  image?: string
  category?: string
  status?: string
  statusColor?: string
  badges?: Array<{
    label: string
    variant?: "default" | "secondary" | "outline" | "destructive"
    className?: string
  }>
  metadata?: Array<{
    label: string
    value: string
  }>
  onView?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onPhotoUpdate?: () => void
  className?: string
}

export function AnimalCard({
  name,
  identifier,
  image,
  category,
  status,
  statusColor = "bg-green-500",
  badges = [],
  metadata = [],
  onView,
  onEdit,
  onDelete,
  onPhotoUpdate,
  className,
}: AnimalCardProps) {
  return (
    <div className={cn("flex gap-4 rounded-xl border border-border p-4 transition hover:bg-muted/50", className)}>
      <div className="relative flex-shrink-0">
        <img
          src={image || "/placeholder.svg?height=80&width=80&query=pig"}
          alt={name}
          className="h-20 w-20 rounded-xl object-cover"
        />
        {onPhotoUpdate && (
          <button
            onClick={onPhotoUpdate}
            className="absolute -bottom-2 -right-2 rounded-full bg-primary p-1.5 text-white shadow-sm hover:bg-primary/90 transition"
          >
            <Camera className="h-3 w-3" />
          </button>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h4 className="font-semibold text-foreground truncate">{name}</h4>
            {identifier && <p className="text-sm text-muted-foreground">{identifier}</p>}
            {category && <p className="text-xs text-muted-foreground mt-0.5">{category}</p>}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {status && <Badge className={cn("text-white", statusColor)}>{status}</Badge>}

            {(onView || onEdit || onDelete) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onView && (
                    <DropdownMenuItem onClick={onView}>
                      <Eye className="h-4 w-4 mr-2" />
                      Voir détails
                    </DropdownMenuItem>
                  )}
                  {onEdit && (
                    <DropdownMenuItem onClick={onEdit}>
                      <Edit className="h-4 w-4 mr-2" />
                      Modifier
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={onDelete} className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {badges.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {badges.map((badge, index) => (
              <Badge key={index} variant={badge.variant || "outline"} className={badge.className}>
                {badge.label}
              </Badge>
            ))}
          </div>
        )}

        {metadata.length > 0 && (
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
            {metadata.map((item, index) => (
              <span key={index}>
                <span className="font-medium">{item.label}:</span> {item.value}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
