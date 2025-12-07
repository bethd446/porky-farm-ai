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
}: MetricCardProps) {
  return (
    <Card className={cn("p-4 sm:p-6 hover:shadow-lg transition-shadow", className)}>
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className={cn("w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center", iconBgColor)}>
          <Icon className={cn("w-5 h-5 sm:w-6 sm:h-6", iconColor)} />
        </div>
      </div>
      <div>
        <p className="text-xs sm:text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-2xl sm:text-3xl font-bold mt-1">{value}</p>
        {subValue && <p className={cn("text-xs mt-1 sm:mt-2", subValueColor)}>{subValue}</p>}
      </div>
    </Card>
  )
}
