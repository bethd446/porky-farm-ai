"use client"

import { useApp } from "@/contexts/app-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { TrendingUp } from "lucide-react"

export function DashboardLivestockOverview() {
  const { stats } = useApp()

  const pieData = [
    { name: "Truies", value: stats.truies, color: "#ec4899" },
    { name: "Verrats", value: stats.verrats, color: "#3b82f6" },
    { name: "Porcelets", value: stats.porcelets, color: "#22c55e" },
    { name: "Porcs", value: stats.porcs, color: "#f59e0b" },
  ].filter((item) => item.value > 0)

  const totalAnimals = pieData.reduce((sum, item) => sum + item.value, 0)

  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-base font-medium">
          Composition de votre cheptel
          <span className="text-sm font-normal text-muted-foreground">
            {totalAnimals === 0 ? "Aucun animal" : `${totalAnimals} animal${totalAnimals > 1 ? "aux" : ""}`}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="distribution" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="distribution">Repartition</TabsTrigger>
            <TabsTrigger value="evolution">Evolution</TabsTrigger>
          </TabsList>

          <TabsContent value="distribution">
            {totalAnimals === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-sm font-medium text-foreground">Commencez par ajouter vos animaux</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-[260px]">
                  Enregistrez vos truies, verrats et porcelets pour suivre votre elevage
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 md:flex-row">
                <div className="h-64 w-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {pieData.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <div>
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-lg font-bold">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="evolution">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <TrendingUp className="h-12 w-12 text-muted-foreground/50 mb-2" />
              <p className="text-sm font-medium text-foreground">Graphiques a venir</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-[280px]">
                Apres quelques semaines d'utilisation, vous verrez ici l'evolution de votre cheptel
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
