import { FeedingCalculator } from "@/components/feeding/feeding-calculator"
import { FeedingSchedule } from "@/components/feeding/feeding-schedule"
import { FeedingStock } from "@/components/feeding/feeding-stock"

export default function FeedingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Alimentation & Rations</h1>
        <p className="text-muted-foreground">Calculez et gérez les rations alimentaires</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <FeedingCalculator />
        <FeedingStock />
      </div>
      <FeedingSchedule />
    </div>
  )
}
