"use client"

import { useApp } from "@/contexts/app-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts"

export function DashboardLivestockOverview() {
  const { stats } = useApp()

  const pieData = [
    { name: "Truies", value: stats.truies, color: "#ec4899" },
    { name: "Verrats", value: stats.verrats, color: "#3b82f6" },
    { name: "Porcelets", value: stats.porcelets, color: "#22c55e" },
    { name: "Porcs", value: stats.porcs, color: "#f59e0b" },
  ].filter((item) => item.value > 0)

  // Données simulées pour l'évolution (seront remplacées par des données réelles)
  const barData = [
    { month: "Jan", naissances: 45, ventes: 32 },
    { month: "Fév", naissances: 52, ventes: 28 },
    { month: "Mar", naissances: 38, ventes: 45 },
    { month: "Avr", naissances: 65, ventes: 38 },
    { month: "Mai", naissances: 48, ventes: 52 },
    { month: "Jun", naissances: 55, ventes: 42 },
  ]

  const totalAnimals = pieData.reduce((sum, item) => sum + item.value, 0)

  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-base font-medium">
          Aperçu du cheptel
          <span className="text-sm font-normal text-muted-foreground">Total: {totalAnimals} animaux</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="distribution" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
            <TabsTrigger value="evolution">Évolution</TabsTrigger>
          </TabsList>

          <TabsContent value="distribution">
            {totalAnimals === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground">Aucun animal enregistré</p>
                <p className="text-sm text-muted-foreground mt-1">Ajoutez des animaux pour voir la distribution</p>
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
                      <Tooltip formatter={(value) => [`${value} animaux`, ""]} />
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
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="naissances" fill="#22c55e" radius={[4, 4, 0, 0]} name="Naissances" />
                  <Bar dataKey="ventes" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Ventes" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
