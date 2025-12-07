"use client"

import { useEffect, useState } from "react"
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
  const config = toastConfig[type]
  const Icon = config.icon

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => setIsVisible(true))

    // Auto close after duration
    const timer = setTimeout(() => {
      handleClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration])

  const handleClose = () => {
    setIsLeaving(true)
    setTimeout(onClose, 200)
  }

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 max-w-sm w-full pointer-events-auto",
        "transform transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
        isVisible && !isLeaving ? "translate-x-0 opacity-100" : "translate-x-full opacity-0",
      )}
    >
      <div className={cn("flex items-start gap-3 p-4 rounded-lg border shadow-lg backdrop-blur-sm", config.bgClass)}>
        <Icon className={cn("size-5 shrink-0 mt-0.5", config.iconClass)} />
        <div className="flex-1 min-w-0">
          <p className={cn("font-medium text-sm", config.titleClass)}>{title}</p>
          {message && <p className="text-sm text-muted-foreground mt-1">{message}</p>}
        </div>
        <button
          onClick={handleClose}
          className="shrink-0 p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          <X className="size-4 text-muted-foreground" />
        </button>
      </div>
      {/* Progress bar */}
      <div className="absolute bottom-0 left-4 right-4 h-1 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full", config.iconClass.replace("text-", "bg-"))}
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

// Toast container for managing multiple toasts
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
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast, index) => (
        <div key={toast.id} style={{ transform: `translateY(-${index * 8}px)` }} className="pointer-events-auto">
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

// Hook for using toasts
export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (type: ToastType, title: string, message?: string) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts((prev) => [...prev, { id, type, title, message }])
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return {
    toasts,
    addToast,
    removeToast,
    success: (title: string, message?: string) => addToast("success", title, message),
    error: (title: string, message?: string) => addToast("error", title, message),
    warning: (title: string, message?: string) => addToast("warning", title, message),
    info: (title: string, message?: string) => addToast("info", title, message),
  }
}
