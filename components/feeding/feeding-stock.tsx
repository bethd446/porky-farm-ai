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
  PiggyBank,
} from "lucide-react"
import { useApp } from "@/contexts/app-context"
import Link from "next/link"

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

  const [newStock, setNewStock] = useState({
    name: "",
    currentQty: "",
    maxQty: "",
    costPerUnit: "",
  })

  const [productionForm, setProductionForm] = useState({
    totalProduced: "",
    ingredients: [{ name: "", qty: "" }],
    notes: "",
  })

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
    }
    // Sinon reste vide

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

  const handleProduction = () => {
    if (!productionForm.totalProduced) return

    const validIngredients = productionForm.ingredients.filter((i) => i.name && i.qty)
    let totalCost = 0

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

  const handleConsumption = () => {
    if (!consumptionForm.stockId || !consumptionForm.quantity) return

    const stockItem = stock.find((s) => s.id === consumptionForm.stockId)
    if (!stockItem) return

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

  const handleDeleteStock = (id: string) => {
    const updated = stock.filter((s) => s.id !== id)
    saveStock(updated)
    showSuccess("Aliment supprime")
  }

  const openEditStock = (item: FeedStock) => {
    setEditingStock(item)
    setNewStock({
      name: item.name,
      currentQty: item.currentQty.toString(),
      maxQty: item.maxQty.toString(),
      costPerUnit: item.costPerUnit.toString(),
    })
    setShowAddStock(true)
  }

  const estimatedDailyConsumption = () => {
    return stats.truies * 2.5 + stats.verrats * 2.5 + stats.porcelets * 0.5 + stats.porcs * 2.5
  }

  const daysRemaining = () => {
    const totalStock = stock.reduce((acc, s) => acc + s.currentQty, 0)
    const daily = estimatedDailyConsumption()
    return daily > 0 ? Math.floor(totalStock / daily) : 0
  }

  const todayConsumption = consumptions
    .filter((c) => new Date(c.date).toDateString() === new Date().toDateString())
    .reduce((acc, c) => acc + c.quantity, 0)

  const lowStockItems = stock.filter((s) => s.currentQty / s.maxQty < 0.2)

  if (animals.length === 0) {
    return (
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <Package className="h-5 w-5 text-primary" />
            Stock d'aliments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <PiggyBank className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-sm font-medium text-foreground">Cheptel vide</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
              Enregistrez des animaux pour commencer a gerer vos stocks d'aliments
            </p>
            <Link href="/dashboard/livestock/add">
              <Button size="sm" className="mt-4">
                <Plus className="h-4 w-4 mr-1" />
                Enregistrer un animal
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <Package className="h-5 w-5 text-primary" />
            Stock d'aliments
          </CardTitle>
          <div className="flex gap-2">
            {stock.length > 0 && (
              <>
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
              </>
            )}

            <Dialog
              open={showAddStock}
              onOpenChange={(open) => {
                setShowAddStock(open)
                if (!open) {
                  setEditingStock(null)
                  setNewStock({ name: "", currentQty: "", maxQty: "", costPerUnit: "" })
                }
              }}
            >
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
          <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-green-700">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">{successMessage}</span>
          </div>
        )}

        {/* Summary stats - only show if there's stock */}
        {stock.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl bg-muted/50 p-3 text-center">
              <p className="text-2xl font-bold text-foreground">{stock.reduce((acc, s) => acc + s.currentQty, 0)}</p>
              <p className="text-xs text-muted-foreground">kg total</p>
            </div>
            <div className="rounded-xl bg-muted/50 p-3 text-center">
              <p className="text-2xl font-bold text-foreground">{daysRemaining()}</p>
              <p className="text-xs text-muted-foreground">jours de stock</p>
            </div>
            <div className="rounded-xl bg-muted/50 p-3 text-center">
              <p className="text-2xl font-bold text-foreground">{todayConsumption}</p>
              <p className="text-xs text-muted-foreground">kg aujourd'hui</p>
            </div>
          </div>
        )}

        {/* Low stock warning */}
        {lowStockItems.length > 0 && (
          <div className="flex items-center gap-2 rounded-lg bg-amber-50 p-3 text-amber-700">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span className="text-sm">Stock bas: {lowStockItems.map((s) => s.name).join(", ")}</span>
          </div>
        )}

        {/* Stock list */}
        <div className="space-y-3">
          {stock.map((item) => {
            const percentage = Math.round((item.currentQty / item.maxQty) * 100)
            const isLow = percentage < 20

            return (
              <div
                key={item.id}
                className={`rounded-xl border p-4 ${isLow ? "border-amber-200 bg-amber-50/50" : "border-border"}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.name}</span>
                    {isLow && (
                      <Badge variant="outline" className="text-amber-600 border-amber-300">
                        Stock bas
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditStock(item)}>
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => handleDeleteStock(item.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Progress value={percentage} className={`flex-1 h-2 ${isLow ? "[&>div]:bg-amber-500" : ""}`} />
                  <span className="text-sm text-muted-foreground min-w-[80px] text-right">
                    {item.currentQty}/{item.maxQty} {item.unit}
                  </span>
                </div>
                {item.costPerUnit > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.costPerUnit} FCFA/kg - Valeur: {(item.currentQty * item.costPerUnit).toLocaleString()} FCFA
                  </p>
                )}
              </div>
            )
          })}

          {stock.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="font-medium">Stock vide</p>
              <p className="text-xs mt-1">Ajoutez vos matieres premieres pour suivre vos quantites</p>
              <Button variant="link" onClick={() => setShowAddStock(true)} className="mt-2">
                <Plus className="h-4 w-4 mr-1" />
                Ajouter un aliment au stock
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
