import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Package, AlertTriangle } from "lucide-react"

const stock = [
  { name: "Maïs", current: 850, max: 1000, unit: "kg" },
  { name: "Tourteau de soja", current: 120, max: 400, unit: "kg" },
  { name: "Son de blé", current: 200, max: 300, unit: "kg" },
  { name: "Concentré minéral", current: 15, max: 50, unit: "kg" },
]

export function FeedingStock() {
  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-medium">
          <Package className="h-5 w-5 text-primary" />
          Stock d'aliments
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {stock.map((item, i) => {
          const percentage = (item.current / item.max) * 100
          const isLow = percentage < 30

          return (
            <div key={i} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{item.name}</span>
                  {isLow && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                </div>
                <span className="text-sm text-muted-foreground">
                  {item.current} / {item.max} {item.unit}
                </span>
              </div>
              <Progress value={percentage} className={`h-2 ${isLow ? "[&>div]:bg-amber-500" : ""}`} />
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
