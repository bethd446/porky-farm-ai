"use client"

import type React from "react"

import { cn } from "@/lib/utils"

// Skeleton loader with shimmer animation
interface SkeletonProps {
  className?: string
  variant?: "text" | "circular" | "rectangular"
}

export function Skeleton({ className, variant = "rectangular" }: SkeletonProps) {
  return (
    <div
      className={cn(
        "bg-muted animate-pulse",
        variant === "circular" && "rounded-full",
        variant === "text" && "rounded h-4",
        variant === "rectangular" && "rounded-lg",
        className,
      )}
    />
  )
}

// Card skeleton
export function CardSkeleton() {
  return (
    <div className="bg-card rounded-xl border p-6 space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton variant="circular" className="size-12" />
        <div className="space-y-2 flex-1">
          <Skeleton variant="text" className="w-1/3" />
          <Skeleton variant="text" className="w-1/2 h-3" />
        </div>
      </div>
      <Skeleton className="h-24" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  )
}

// Table skeleton
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-4 p-4 bg-muted/50 rounded-lg">
        <Skeleton variant="text" className="w-1/4" />
        <Skeleton variant="text" className="w-1/4" />
        <Skeleton variant="text" className="w-1/4" />
        <Skeleton variant="text" className="w-1/4" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 border rounded-lg">
          <Skeleton variant="text" className="w-1/4" />
          <Skeleton variant="text" className="w-1/4" />
          <Skeleton variant="text" className="w-1/4" />
          <Skeleton variant="text" className="w-1/4" />
        </div>
      ))}
    </div>
  )
}

// Spinner with different sizes
interface SpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function Spinner({ size = "md", className }: SpinnerProps) {
  const sizeClasses = {
    sm: "size-4 border-2",
    md: "size-6 border-2",
    lg: "size-8 border-3",
  }

  return (
    <div
      className={cn("rounded-full border-primary border-t-transparent animate-spin", sizeClasses[size], className)}
    />
  )
}

// Full page loader
export function PageLoader() {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p className="text-sm text-muted-foreground animate-pulse">Chargement...</p>
      </div>
    </div>
  )
}

// Button loading state
interface LoadingButtonContentProps {
  isLoading: boolean
  loadingText?: string
  children: React.ReactNode
}

export function LoadingButtonContent({
  isLoading,
  loadingText = "Chargement...",
  children,
}: LoadingButtonContentProps) {
  if (!isLoading) return <>{children}</>

  return (
    <span className="flex items-center gap-2">
      <Spinner size="sm" className="border-current" />
      {loadingText}
    </span>
  )
}

// Dots loading animation
export function DotsLoader() {
  return (
    <div className="flex gap-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="size-2 rounded-full bg-primary animate-bounce"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  )
}
