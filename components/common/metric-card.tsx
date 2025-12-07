"use client"

import { useEffect, useState, useRef } from "react"
import type { LucideIcon } from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface MetricCardProps {
  icon: LucideIcon
  iconColor?: string
  iconBgColor?: string
  label: string
  value: string | number
  subValue?: string
  subValueColor?: string
  trend?: "up" | "down" | "neutral"
  className?: string
  animate?: boolean
}

function useCountUp(end: number, duration = 1000, enabled = true) {
  const [count, setCount] = useState(0)
  const countRef = useRef(0)
  const startTimeRef = useRef<number | null>(null)

  useEffect(() => {
    if (!enabled) {
      setCount(end)
      return
    }

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp
      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1)

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      countRef.current = Math.floor(easeOut * end)
      setCount(countRef.current)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)

    return () => {
      startTimeRef.current = null
    }
  }, [end, duration, enabled])

  return count
}

export function MetricCard({
  icon: Icon,
  iconColor = "text-primary",
  iconBgColor = "bg-primary/10",
  label,
  value,
  subValue,
  subValueColor = "text-muted-foreground",
  className,
  animate = true,
}: MetricCardProps) {
  const [isVisible, setIsVisible] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  // Detect when card is visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 },
    )

    if (cardRef.current) {
      observer.observe(cardRef.current)
    }

    return () => observer.disconnect()
  }, [])

  // Animate numeric values
  const numericValue = typeof value === "number" ? value : Number.parseInt(String(value), 10)
  const isNumeric = !isNaN(numericValue)
  const animatedValue = useCountUp(isNumeric ? numericValue : 0, 800, animate && isVisible && isNumeric)

  const displayValue = isNumeric && animate ? animatedValue : value

  return (
    <Card
      ref={cardRef}
      className={cn(
        "p-4 sm:p-6 group cursor-default",
        "hover:shadow-lg hover:-translate-y-1 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
        "hover:border-primary/30",
        className,
      )}
    >
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div
          className={cn(
            "w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center",
            "transition-transform duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
            "group-hover:scale-110",
            iconBgColor,
          )}
        >
          <Icon
            className={cn(
              "w-5 h-5 sm:w-6 sm:h-6",
              "transition-transform duration-200",
              "group-hover:rotate-6",
              iconColor,
            )}
          />
        </div>
      </div>
      <div>
        <p className="text-xs sm:text-sm font-medium text-muted-foreground">{label}</p>
        <p className={cn("text-2xl sm:text-3xl font-bold mt-1", isVisible ? "animate-count-up" : "opacity-0")}>
          {displayValue}
        </p>
        {subValue && (
          <p
            className={cn(
              "text-xs mt-1 sm:mt-2 transition-opacity duration-300",
              isVisible ? "opacity-100" : "opacity-0",
              subValueColor,
            )}
            style={{ transitionDelay: "150ms" }}
          >
            {subValue}
          </p>
        )}
      </div>
    </Card>
  )
}
