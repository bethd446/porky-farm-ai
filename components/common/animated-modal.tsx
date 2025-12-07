"use client"

import { useEffect, useState, type ReactNode } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface AnimatedModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: ReactNode
  size?: "sm" | "md" | "lg" | "xl"
  showCloseButton?: boolean
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
}

export function AnimatedModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "md",
  showCloseButton = true,
}: AnimatedModalProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true)
      requestAnimationFrame(() => setIsVisible(true))
    } else {
      setIsVisible(false)
      const timer = setTimeout(() => setIsAnimating(false), 200)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  if (!isAnimating && !isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200",
          isVisible ? "opacity-100" : "opacity-0",
        )}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={cn(
          "relative w-full bg-card rounded-xl shadow-2xl border transform transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
          sizeClasses[size],
          isVisible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4",
        )}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between p-6 pb-0">
            <div>
              {title && <h2 className="text-lg font-semibold">{title}</h2>}
              {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
            </div>
            {showCloseButton && (
              <Button variant="ghost" size="icon-sm" onClick={onClose} className="shrink-0 -mt-1 -mr-1">
                <X className="size-4" />
              </Button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

// Confirmation modal variant
interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive"
  isLoading?: boolean
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirmer",
  cancelText = "Annuler",
  variant = "default",
  isLoading = false,
}: ConfirmModalProps) {
  return (
    <AnimatedModal isOpen={isOpen} onClose={onClose} title={title} description={description} size="sm">
      <div className="flex gap-3 justify-end mt-2">
        <Button variant="outline" onClick={onClose} disabled={isLoading}>
          {cancelText}
        </Button>
        <Button
          variant={variant === "destructive" ? "destructive" : "default"}
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Chargement...
            </span>
          ) : (
            confirmText
          )}
        </Button>
      </div>
    </AnimatedModal>
  )
}
