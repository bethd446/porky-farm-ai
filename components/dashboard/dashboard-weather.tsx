"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sun, Cloud, CloudRain, Wind, Droplets } from "lucide-react"

const hourlyForecast = [
  { time: "09h", temp: 26, icon: Sun },
  { time: "12h", temp: 32, icon: Sun },
  { time: "15h", temp: 34, icon: Cloud },
  { time: "18h", temp: 29, icon: CloudRain },
  { time: "21h", temp: 25, icon: Cloud },
]

export function DashboardWeather() {
  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Météo du jour</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 p-4">
            <Sun className="h-10 w-10 text-white" />
          </div>
          <div>
            <div className="text-4xl font-bold text-foreground">32°C</div>
            <div className="text-sm text-muted-foreground">Ensoleillé</div>
          </div>
        </div>

        <div className="mt-4 flex gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Wind className="h-4 w-4" />
            12 km/h
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Droplets className="h-4 w-4" />
            65%
          </div>
        </div>

        <div className="mt-6 flex justify-between">
          {hourlyForecast.map((hour, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <span className="text-xs text-muted-foreground">{hour.time}</span>
              <hour.icon className="h-5 w-5 text-amber-500" />
              <span className="text-sm font-medium">{hour.temp}°</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
