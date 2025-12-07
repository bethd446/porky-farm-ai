"use client"

import { useEffect, useState, useCallback } from "react"
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react"
import { cn } from "@/lib/utils"

export type ToastType = "success" | "error" | "warning" | "info"

interface ToastProps {
  type: ToastType
  title: string
  message?: string
  duration?: number
  onClose: () => void
}

const toastConfig = {
  success: {
    icon: CheckCircle,
    bgClass: "bg-success/10 border-success/30",
    iconClass: "text-success",
    titleClass: "text-success",
  },
  error: {
    icon: XCircle,
    bgClass: "bg-destructive/10 border-destructive/30",
    iconClass: "text-destructive",
    titleClass: "text-destructive",
  },
  warning: {
    icon: AlertTriangle,
    bgClass: "bg-warning/10 border-warning/30",
    iconClass: "text-warning",
    titleClass: "text-warning-foreground",
  },
  info: {
    icon: Info,
    bgClass: "bg-info/10 border-info/30",
    iconClass: "text-info",
    titleClass: "text-info",
  },
}

export function AnimatedToast({ type, title, message, duration = 5000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const config = toastConfig[type]
  const Icon = config.icon

  const handleClose = useCallback(() => {
    setIsLeaving(true)
    setTimeout(onClose, 250)
  }, [onClose])

  useEffect(() => {
    const enterTimer = setTimeout(() => setIsVisible(true), 10)
    return () => clearTimeout(enterTimer)
  }, [])

  useEffect(() => {
    if (isPaused) return

    // Auto close after duration
    const timer = setTimeout(() => {
      handleClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, isPaused, handleClose])

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={cn(
        "fixed bottom-4 right-4 z-50 max-w-sm w-full pointer-events-auto",
        "transform transition-all duration-250 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
        isVisible && !isLeaving ? "translate-x-0 opacity-100 scale-100" : "translate-x-[120%] opacity-0 scale-95",
      )}
    >
      <div className={cn("flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-sm", config.bgClass)}>
        <div
          className={cn(
            type === "success" && isVisible && "animate-bounce-in",
            type === "error" && isVisible && "animate-error-shake",
          )}
        >
          <Icon className={cn("size-5 shrink-0 mt-0.5", config.iconClass)} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn("font-medium text-sm", config.titleClass)}>{title}</p>
          {message && (
            <p
              className={cn(
                "text-sm text-muted-foreground mt-1",
                "transition-opacity duration-200",
                isVisible ? "opacity-100" : "opacity-0",
              )}
              style={{ transitionDelay: "100ms" }}
            >
              {message}
            </p>
          )}
        </div>
        <button
          onClick={handleClose}
          className={cn(
            "shrink-0 p-1 rounded-md transition-all duration-150",
            "hover:bg-black/10 dark:hover:bg-white/10",
            "hover:rotate-90",
          )}
        >
          <X className="size-4 text-muted-foreground" />
        </button>
      </div>
      {/* Progress bar animee */}
      <div className="absolute bottom-0 left-4 right-4 h-1 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            config.iconClass.replace("text-", "bg-"),
            isPaused ? "[animation-play-state:paused]" : "",
          )}
          style={{
            animation: `shrink ${duration}ms linear forwards`,
          }}
        />
      </div>
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  )
}

// Toast container pour gerer plusieurs toasts
interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
}

interface ToastContainerProps {
  toasts: Toast[]
  onRemove: (id: string) => void
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          style={{
            transform: `translateY(-${index * 8}px)`,
            zIndex: toasts.length - index,
          }}
          className="pointer-events-auto"
        >
          <AnimatedToast
            type={toast.type}
            title={toast.title}
            message={toast.message}
            onClose={() => onRemove(toast.id)}
          />
        </div>
      ))}
    </div>
  )
}

// Hook pour utiliser les toasts
export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts((prev) => [...prev, { id, type, title, message }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return {
    toasts,
    addToast,
    removeToast,
    success: useCallback((title: string, message?: string) => addToast("success", title, message), [addToast]),
    error: useCallback((title: string, message?: string) => addToast("error", title, message), [addToast]),
    warning: useCallback((title: string, message?: string) => addToast("warning", title, message), [addToast]),
    info: useCallback((title: string, message?: string) => addToast("info", title, message), [addToast]),
  }
}
