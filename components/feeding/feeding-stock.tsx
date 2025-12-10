"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Package,
  AlertTriangle,
  Plus,
  Factory,
  TrendingDown,
  Edit2,
  Trash2,
  CheckCircle,
  Calculator,
} from "lucide-react"
import { useApp } from "@/contexts/app-context"

interface FeedStock {
  id: string
  name: string
  currentQty: number
  maxQty: number
  unit: string
  costPerUnit: number
  lastRestocked?: string
}

interface FeedProduction {
  id: string
  date: string
  ingredients: { name: string; qty: number }[]
  totalProduced: number
  costTotal: number
  notes?: string
}

interface DailyConsumption {
  id: string
  date: string
  stockId: string
  stockName: string
  quantity: number
  animalCategory: string
  animalCount: number
}

const defaultStock: FeedStock[] = [
  { id: "1", name: "Mais", currentQty: 850, maxQty: 1000, unit: "kg", costPerUnit: 150 },
  { id: "2", name: "Tourteau de soja", currentQty: 120, maxQty: 400, unit: "kg", costPerUnit: 350 },
  { id: "3", name: "Son de ble", currentQty: 200, maxQty: 300, unit: "kg", costPerUnit: 100 },
  { id: "4", name: "Concentre mineral (CMV)", currentQty: 15, maxQty: 50, unit: "kg", costPerUnit: 800 },
  { id: "5", name: "Farine de poisson", currentQty: 30, maxQty: 100, unit: "kg", costPerUnit: 500 },
]

export function FeedingStock() {
  const { animals, stats } = useApp()
  const [stock, setStock] = useState<FeedStock[]>([])
  const [productions, setProductions] = useState<FeedProduction[]>([])
  const [consumptions, setConsumptions] = useState<DailyConsumption[]>([])
  const [showAddStock, setShowAddStock] = useState(false)
  const [showProduction, setShowProduction] = useState(false)
  const [showConsumption, setShowConsumption] = useState(false)
  const [editingStock, setEditingStock] = useState<FeedStock | null>(null)
  const [successMessage, setSuccessMessage] = useState("")

  // New stock form
  const [newStock, setNewStock] = useState({
    name: "",
    currentQty: "",
    maxQty: "",
    costPerUnit: "",
  })

  // Production form
  const [productionForm, setProductionForm] = useState({
    totalProduced: "",
    ingredients: [{ name: "", qty: "" }],
    notes: "",
  })

  // Consumption form
  const [consumptionForm, setConsumptionForm] = useState({
    stockId: "",
    quantity: "",
    animalCategory: "",
    animalCount: "",
  })

  useEffect(() => {
    const savedStock = localStorage.getItem("porkyfarm_feedstock")
    const savedProductions = localStorage.getItem("porkyfarm_feedproductions")
    const savedConsumptions = localStorage.getItem("porkyfarm_feedconsumptions")

    if (savedStock) {
      setStock(JSON.parse(savedStock))
    } else {
      setStock(defaultStock)
      localStorage.setItem("porkyfarm_feedstock", JSON.stringify(defaultStock))
    }

    if (savedProductions) setProductions(JSON.parse(savedProductions))
    if (savedConsumptions) setConsumptions(JSON.parse(savedConsumptions))
  }, [])

  const saveStock = (newStockData: FeedStock[]) => {
    setStock(newStockData)
    localStorage.setItem("porkyfarm_feedstock", JSON.stringify(newStockData))
  }

  const showSuccess = (message: string) => {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(""), 3000)
  }

  // Add or update stock item
  const handleSaveStock = () => {
    if (!newStock.name || !newStock.currentQty || !newStock.maxQty) return

    if (editingStock) {
      const updated = stock.map((s) =>
        s.id === editingStock.id
          ? {
              ...s,
              name: newStock.name,
              currentQty: Number(newStock.currentQty),
              maxQty: Number(newStock.maxQty),
              costPerUnit: Number(newStock.costPerUnit) || 0,
              lastRestocked: new Date().toISOString(),
            }
          : s,
      )
      saveStock(updated)
      showSuccess("Stock mis a jour")
    } else {
      const newItem: FeedStock = {
        id: Date.now().toString(),
        name: newStock.name,
        currentQty: Number(newStock.currentQty),
        maxQty: Number(newStock.maxQty),
        unit: "kg",
        costPerUnit: Number(newStock.costPerUnit) || 0,
        lastRestocked: new Date().toISOString(),
      }
      saveStock([...stock, newItem])
      showSuccess("Nouvel aliment ajoute")
    }

    setNewStock({ name: "", currentQty: "", maxQty: "", costPerUnit: "" })
    setEditingStock(null)
    setShowAddStock(false)
  }

  // Record feed production
  const handleProduction = () => {
    if (!productionForm.totalProduced) return

    const validIngredients = productionForm.ingredients.filter((i) => i.name && i.qty)
    let totalCost = 0

    // Deduct ingredients from stock
    const updatedStock = stock.map((s) => {
      const ingredient = validIngredients.find((i) => i.name === s.id)
      if (ingredient) {
        totalCost += s.costPerUnit * Number(ingredient.qty)
        return { ...s, currentQty: Math.max(0, s.currentQty - Number(ingredient.qty)) }
      }
      return s
    })

    const production: FeedProduction = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      ingredients: validIngredients.map((i) => ({
        name: stock.find((s) => s.id === i.name)?.name || i.name,
        qty: Number(i.qty),
      })),
      totalProduced: Number(productionForm.totalProduced),
      costTotal: totalCost,
      notes: productionForm.notes,
    }

    // Add produced feed to "Aliment compose" stock or create it
    const composedIndex = updatedStock.findIndex((s) => s.name.toLowerCase().includes("compose"))
    if (composedIndex >= 0) {
      updatedStock[composedIndex].currentQty += Number(productionForm.totalProduced)
    } else {
      updatedStock.push({
        id: Date.now().toString(),
        name: "Aliment compose",
        currentQty: Number(productionForm.totalProduced),
        maxQty: 500,
        unit: "kg",
        costPerUnit: Math.round(totalCost / Number(productionForm.totalProduced)),
      })
    }

    saveStock(updatedStock)
    const newProductions = [...productions, production]
    setProductions(newProductions)
    localStorage.setItem("porkyfarm_feedproductions", JSON.stringify(newProductions))

    setProductionForm({ totalProduced: "", ingredients: [{ name: "", qty: "" }], notes: "" })
    setShowProduction(false)
    showSuccess(`${productionForm.totalProduced} kg d'aliment produit`)
  }

  // Record daily consumption
  const handleConsumption = () => {
    if (!consumptionForm.stockId || !consumptionForm.quantity) return

    const stockItem = stock.find((s) => s.id === consumptionForm.stockId)
    if (!stockItem) return

    // Deduct from stock
    const updatedStock = stock.map((s) =>
      s.id === consumptionForm.stockId
        ? { ...s, currentQty: Math.max(0, s.currentQty - Number(consumptionForm.quantity)) }
        : s,
    )
    saveStock(updatedStock)

    const consumption: DailyConsumption = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      stockId: consumptionForm.stockId,
      stockName: stockItem.name,
      quantity: Number(consumptionForm.quantity),
      animalCategory: consumptionForm.animalCategory,
      animalCount: Number(consumptionForm.animalCount) || 0,
    }

    const newConsumptions = [...consumptions, consumption]
    setConsumptions(newConsumptions)
    localStorage.setItem("porkyfarm_feedconsumptions", JSON.stringify(newConsumptions))

    setConsumptionForm({ stockId: "", quantity: "", animalCategory: "", animalCount: "" })
    setShowConsumption(false)
    showSuccess(`${consumptionForm.quantity} kg consommes`)
  }

  // Delete stock item
  const handleDeleteStock = (id: string) => {
    const updated = stock.filter((s) => s.id !== id)
    saveStock(updated)
    showSuccess("Aliment supprime")
  }

  // Calculate daily consumption estimate based on animals
  const estimatedDailyConsumption = () => {
    // Rough estimates: truie 2.5kg, verrat 2.5kg, porcelet 0.5kg, porc 2.5kg
    return stats.truies * 2.5 + stats.verrats * 2.5 + stats.porcelets * 0.5 + stats.porcs * 2.5
  }

  // Days of stock remaining
  const daysRemaining = () => {
    const totalStock = stock.reduce((acc, s) => acc + s.currentQty, 0)
    const daily = estimatedDailyConsumption()
    return daily > 0 ? Math.floor(totalStock / daily) : 999
  }

  const todayConsumption = consumptions
    .filter((c) => new Date(c.date).toDateString() === new Date().toDateString())
    .reduce((acc, c) => acc + c.quantity, 0)

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <Package className="h-5 w-5 text-primary" />
            Stock d'aliments
          </CardTitle>
          <div className="flex gap-2">
            <Dialog open={showProduction} onOpenChange={setShowProduction}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1 bg-transparent">
                  <Factory className="h-4 w-4" />
                  <span className="hidden sm:inline">Fabriquer</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Fabrication d'aliment</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Quantite produite (kg)</Label>
                    <Input
                      type="number"
                      value={productionForm.totalProduced}
                      onChange={(e) => setProductionForm((p) => ({ ...p, totalProduced: e.target.value }))}
                      placeholder="Ex: 100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Ingredients utilises</Label>
                    {productionForm.ingredients.map((ing, i) => (
                      <div key={i} className="flex gap-2">
                        <Select
                          value={ing.name}
                          onValueChange={(v) => {
                            const newIngs = [...productionForm.ingredients]
                            newIngs[i].name = v
                            setProductionForm((p) => ({ ...p, ingredients: newIngs }))
                          }}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Ingredient" />
                          </SelectTrigger>
                          <SelectContent>
                            {stock.map((s) => (
                              <SelectItem key={s.id} value={s.id}>
                                {s.name} ({s.currentQty} {s.unit})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          className="w-24"
                          value={ing.qty}
                          onChange={(e) => {
                            const newIngs = [...productionForm.ingredients]
                            newIngs[i].qty = e.target.value
                            setProductionForm((p) => ({ ...p, ingredients: newIngs }))
                          }}
                          placeholder="kg"
                        />
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setProductionForm((p) => ({
                          ...p,
                          ingredients: [...p.ingredients, { name: "", qty: "" }],
                        }))
                      }
                    >
                      <Plus className="h-4 w-4 mr-1" /> Ajouter ingredient
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label>Notes (optionnel)</Label>
                    <Input
                      value={productionForm.notes}
                      onChange={(e) => setProductionForm((p) => ({ ...p, notes: e.target.value }))}
                      placeholder="Ex: Formule pour porcelets"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Annuler</Button>
                  </DialogClose>
                  <Button onClick={handleProduction} className="gap-1">
                    <Factory className="h-4 w-4" /> Enregistrer
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={showConsumption} onOpenChange={setShowConsumption}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1 bg-transparent">
                  <TrendingDown className="h-4 w-4" />
                  <span className="hidden sm:inline">Consommer</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Enregistrer la consommation</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Type d'aliment</Label>
                    <Select
                      value={consumptionForm.stockId}
                      onValueChange={(v) => setConsumptionForm((c) => ({ ...c, stockId: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selectionner un aliment" />
                      </SelectTrigger>
                      <SelectContent>
                        {stock.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name} ({s.currentQty} {s.unit} dispo)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Quantite consommee (kg)</Label>
                    <Input
                      type="number"
                      value={consumptionForm.quantity}
                      onChange={(e) => setConsumptionForm((c) => ({ ...c, quantity: e.target.value }))}
                      placeholder="Ex: 25"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Categorie d'animaux</Label>
                    <Select
                      value={consumptionForm.animalCategory}
                      onValueChange={(v) => setConsumptionForm((c) => ({ ...c, animalCategory: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="truie">Truies ({stats.truies})</SelectItem>
                        <SelectItem value="verrat">Verrats ({stats.verrats})</SelectItem>
                        <SelectItem value="porcelet">Porcelets ({stats.porcelets})</SelectItem>
                        <SelectItem value="porc">Porcs ({stats.porcs})</SelectItem>
                        <SelectItem value="tous">Tous les animaux</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Nombre d'animaux nourris</Label>
                    <Input
                      type="number"
                      value={consumptionForm.animalCount}
                      onChange={(e) => setConsumptionForm((c) => ({ ...c, animalCount: e.target.value }))}
                      placeholder="Ex: 10"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Annuler</Button>
                  </DialogClose>
                  <Button onClick={handleConsumption} className="gap-1">
                    <TrendingDown className="h-4 w-4" /> Enregistrer
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={showAddStock} onOpenChange={setShowAddStock}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Ajouter</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingStock ? "Modifier l'aliment" : "Ajouter un aliment"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Nom de l'aliment</Label>
                    <Input
                      value={newStock.name}
                      onChange={(e) => setNewStock((s) => ({ ...s, name: e.target.value }))}
                      placeholder="Ex: Mais, Soja..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Quantite actuelle (kg)</Label>
                      <Input
                        type="number"
                        value={newStock.currentQty}
                        onChange={(e) => setNewStock((s) => ({ ...s, currentQty: e.target.value }))}
                        placeholder="Ex: 500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Capacite max (kg)</Label>
                      <Input
                        type="number"
                        value={newStock.maxQty}
                        onChange={(e) => setNewStock((s) => ({ ...s, maxQty: e.target.value }))}
                        placeholder="Ex: 1000"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Prix par kg (FCFA)</Label>
                    <Input
                      type="number"
                      value={newStock.costPerUnit}
                      onChange={(e) => setNewStock((s) => ({ ...s, costPerUnit: e.target.value }))}
                      placeholder="Ex: 150"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Annuler</Button>
                  </DialogClose>
                  <Button onClick={handleSaveStock}>{editingStock ? "Mettre a jour" : "Ajouter"}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Success message */}
        {successMessage && (
          <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 p-3 animate-in fade-in slide-in-from-top-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-700">{successMessage}</span>
          </div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-muted p-3 text-center">
            <p className="text-2xl font-bold text-primary">{daysRemaining()}</p>
            <p className="text-xs text-muted-foreground">jours de stock</p>
          </div>
          <div className="rounded-lg bg-muted p-3 text-center">
            <p className="text-2xl font-bold text-orange-500">{Math.round(estimatedDailyConsumption())}</p>
            <p className="text-xs text-muted-foreground">kg/jour estime</p>
          </div>
          <div className="rounded-lg bg-muted p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{todayConsumption}</p>
            <p className="text-xs text-muted-foreground">kg aujourd'hui</p>
          </div>
        </div>

        {/* Stock list */}
        {stock.map((item) => {
          const percentage = (item.currentQty / item.maxQty) * 100
          const isLow = percentage < 30
          const isCritical = percentage < 15

          return (
            <div key={item.id} className="space-y-2 group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{item.name}</span>
                  {isCritical && (
                    <Badge variant="destructive" className="text-xs animate-pulse">
                      Critique
                    </Badge>
                  )}
                  {isLow && !isCritical && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {item.currentQty} / {item.maxQty} {item.unit}
                  </span>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => {
                        setEditingStock(item)
                        setNewStock({
                          name: item.name,
                          currentQty: item.currentQty.toString(),
                          maxQty: item.maxQty.toString(),
                          costPerUnit: item.costPerUnit.toString(),
                        })
                        setShowAddStock(true)
                      }}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive"
                      onClick={() => handleDeleteStock(item.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
              <Progress
                value={percentage}
                className={`h-2 ${isCritical ? "[&>div]:bg-destructive" : isLow ? "[&>div]:bg-amber-500" : ""}`}
              />
              {item.costPerUnit > 0 && (
                <p className="text-xs text-muted-foreground">
                  {item.costPerUnit} FCFA/kg - Valeur: {(item.currentQty * item.costPerUnit).toLocaleString()} FCFA
                </p>
              )}
            </div>
          )
        })}

        {/* Quick estimate */}
        {stats.total > 0 && (
          <div className="rounded-lg border border-dashed border-border p-3 bg-muted/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calculator className="h-4 w-4" />
              <span>
                Estimation: {stats.total} animaux x ~{(estimatedDailyConsumption() / stats.total).toFixed(1)} kg ={" "}
                {Math.round(estimatedDailyConsumption())} kg/jour
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
