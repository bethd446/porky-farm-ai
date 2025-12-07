"use client"

import type React from "react"

import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface FormStatusProps {
  status: "idle" | "loading" | "success" | "error"
  successMessage?: string
  errorMessage?: string
  className?: string
}

export function FormStatus({
  status,
  successMessage = "Opération réussie !",
  errorMessage = "Une erreur est survenue",
  className,
}: FormStatusProps) {
  if (status === "idle") return null

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg p-3 text-sm",
        status === "loading" && "bg-muted text-muted-foreground",
        status === "success" && "bg-primary/10 text-primary",
        status === "error" && "bg-destructive/10 text-destructive",
        className,
      )}
    >
      {status === "loading" && (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Traitement en cours...
        </>
      )}
      {status === "success" && (
        <>
          <CheckCircle className="h-4 w-4" />
          {successMessage}
        </>
      )}
      {status === "error" && (
        <>
          <AlertCircle className="h-4 w-4" />
          {errorMessage}
        </>
      )}
    </div>
  )
}

interface SubmitButtonProps {
  isLoading?: boolean
  isSuccess?: boolean
  loadingText?: string
  successText?: string
  children: React.ReactNode
  disabled?: boolean
  className?: string
  type?: "submit" | "button"
  onClick?: () => void
}

export function SubmitButton({
  isLoading,
  isSuccess,
  loadingText = "Traitement...",
  successText = "Terminé !",
  children,
  disabled,
  className,
  type = "submit",
  onClick,
}: SubmitButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading || isSuccess}
      onClick={onClick}
      className={cn(
        "inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          {loadingText}
        </>
      ) : isSuccess ? (
        <>
          <CheckCircle className="h-5 w-5" />
          {successText}
        </>
      ) : (
        children
      )}
    </button>
  )
}
