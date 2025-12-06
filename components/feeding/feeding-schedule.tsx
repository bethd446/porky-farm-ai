import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle2, AlertCircle } from "lucide-react"

const schedule = [
  {
    time: "06:00",
    task: "Distribution truies gestantes",
    location: "Bâtiment A",
    quantity: "45 kg",
    status: "done",
  },
  {
    time: "07:00",
    task: "Alimentation porcelets",
    location: "Maternité",
    quantity: "8 kg",
    status: "done",
  },
  {
    time: "12:00",
    task: "Ration verrats",
    location: "Bâtiment B",
    quantity: "16 kg",
    status: "pending",
  },
  {
    time: "17:00",
    task: "Distribution truies allaitantes",
    location: "Maternité",
    quantity: "60 kg",
    status: "pending",
  },
  {
    time: "18:00",
    task: "Ration engraissement",
    location: "Bâtiment C",
    quantity: "175 kg",
    status: "pending",
  },
]

export function FeedingSchedule() {
  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-medium">
          <Clock className="h-5 w-5 text-primary" />
          Planning du jour
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {schedule.map((item, i) => (
            <div
              key={i}
              className={`flex items-center gap-4 rounded-xl border border-border p-4 ${
                item.status === "done" ? "bg-green-50" : ""
              }`}
            >
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">{item.time}</p>
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{item.task}</p>
                <p className="text-sm text-muted-foreground">{item.location}</p>
              </div>
              <Badge variant="outline">{item.quantity}</Badge>
              {item.status === "done" ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-amber-500" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
