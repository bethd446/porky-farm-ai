"use client"

import { useState, useEffect, useCallback } from "react"
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
  Loader2,
} from "lucide-react"
import { useApp } from "@/contexts/app-context"
import { useAuthContext } from "@/contexts/auth-context"
import { db, isSupabaseConfigured } from "@/lib/supabase/client"
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
  const { user } = useAuthContext()
  const [stock, setStock] = useState<FeedStock[]>([])
  const [productions, setProductions] = useState<FeedProduction[]>([])
  const [consumptions, setConsumptions] = useState<DailyConsumption[]>([])
  const [showAddStock, setShowAddStock] = useState(false)
  const [showProduction, setShowProduction] = useState(false)
  const [showConsumption, setShowConsumption] = useState(false)
  const [editingStock, setEditingStock] = useState<FeedStock | null>(null)
  const [successMessage, setSuccessMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

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

  const loadData = useCallback(async () => {
    if (!user?.id) {
      setStock([])
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      if (isSupabaseConfigured()) {
        const { data, error } = await db.getFeedStock(user.id)
        if (error) throw error

        const mappedStock: FeedStock[] = (data || []).map((item: any) => ({
          id: item.id,
          name: item.name || item.feed_type || "Aliment",
          currentQty: Number(item.current_qty || item.quantity_kg || 0),
          maxQty: Number(item.max_qty || 1000),
          unit: "kg",
          costPerUnit: Number(item.cost_per_unit || item.unit_price || 0),
          lastRestocked: item.last_restocked || item.purchase_date,
        }))
        setStock(mappedStock)
      }
    } catch (err) {
      console.error("[FeedingStock] loadData error:", err)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    loadData()
  }, [loadData])

  const showSuccess = (message: string) => {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(""), 3000)
  }

  const handleSaveStock = async () => {
    if (!newStock.name || !newStock.currentQty || !newStock.maxQty || !user?.id) return

    setSaving(true)
    try {
      if (editingStock) {
        // Update existing
        const { error } = await db.updateFeedStock(editingStock.id, {
          name: newStock.name,
          feed_type: newStock.name,
          current_qty: Number(newStock.currentQty),
          quantity_kg: Number(newStock.currentQty),
          max_qty: Number(newStock.maxQty),
          cost_per_unit: Number(newStock.costPerUnit) || 0,
          unit_price: Number(newStock.costPerUnit) || 0,
          last_restocked: new Date().toISOString(),
        })
        if (error) throw error
        showSuccess("Stock mis a jour")
      } else {
        // Insert new
        const { error } = await db.addFeedStock({
          user_id: user.id,
          name: newStock.name,
          feed_type: newStock.name,
          current_qty: Number(newStock.currentQty),
          quantity_kg: Number(newStock.currentQty),
          max_qty: Number(newStock.maxQty),
          cost_per_unit: Number(newStock.costPerUnit) || 0,
          unit_price: Number(newStock.costPerUnit) || 0,
          last_restocked: new Date().toISOString(),
        })
        if (error) throw error
        showSuccess("Nouvel aliment ajoute")
      }

      await loadData()
      setNewStock({ name: "", currentQty: "", maxQty: "", costPerUnit: "" })
      setEditingStock(null)
      setShowAddStock(false)
    } catch (err) {
      console.error("[FeedingStock] handleSaveStock error:", err)
    } finally {
      setSaving(false)
    }
  }

  const handleProduction = async () => {
    if (!productionForm.totalProduced || !user?.id) return

    setSaving(true)
    try {
      const validIngredients = productionForm.ingredients.filter((i) => i.name && i.qty)
      let totalCost = 0

      // Mettre a jour les stocks utilises
      for (const ingredient of validIngredients) {
        const stockItem = stock.find((s) => s.id === ingredient.name)
        if (stockItem) {
          totalCost += stockItem.costPerUnit * Number(ingredient.qty)
          await db.updateFeedStock(stockItem.id, {
            current_qty: Math.max(0, stockItem.currentQty - Number(ingredient.qty)),
            quantity_kg: Math.max(0, stockItem.currentQty - Number(ingredient.qty)),
          })
        }
      }

      // Ajouter ou mettre a jour l'aliment compose
      const composedStock = stock.find((s) => s.name.toLowerCase().includes("compose"))
      if (composedStock) {
        await db.updateFeedStock(composedStock.id, {
          current_qty: composedStock.currentQty + Number(productionForm.totalProduced),
          quantity_kg: composedStock.currentQty + Number(productionForm.totalProduced),
        })
      } else {
        await db.addFeedStock({
          user_id: user.id,
          name: "Aliment compose",
          feed_type: "Aliment compose",
          current_qty: Number(productionForm.totalProduced),
          quantity_kg: Number(productionForm.totalProduced),
          max_qty: 500,
          cost_per_unit: totalCost > 0 ? Math.round(totalCost / Number(productionForm.totalProduced)) : 0,
          unit_price: totalCost > 0 ? Math.round(totalCost / Number(productionForm.totalProduced)) : 0,
        })
      }

      await loadData()
      setProductionForm({ totalProduced: "", ingredients: [{ name: "", qty: "" }], notes: "" })
      setShowProduction(false)
      showSuccess(`${productionForm.totalProduced} kg d'aliment produit`)
    } catch (err) {
      console.error("[FeedingStock] handleProduction error:", err)
    } finally {
      setSaving(false)
    }
  }

  const handleConsumption = async () => {
    if (!consumptionForm.stockId || !consumptionForm.quantity || !user?.id) return

    setSaving(true)
    try {
      const stockItem = stock.find((s) => s.id === consumptionForm.stockId)
      if (!stockItem) return

      await db.updateFeedStock(consumptionForm.stockId, {
        current_qty: Math.max(0, stockItem.currentQty - Number(consumptionForm.quantity)),
        quantity_kg: Math.max(0, stockItem.currentQty - Number(consumptionForm.quantity)),
      })

      await loadData()
      setConsumptionForm({ stockId: "", quantity: "", animalCategory: "", animalCount: "" })
      setShowConsumption(false)
      showSuccess(`${consumptionForm.quantity} kg consommes`)
    } catch (err) {
      console.error("[FeedingStock] handleConsumption error:", err)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteStock = async (id: string) => {
    if (!user?.id) return

    setSaving(true)
    try {
      await db.deleteFeedStock(id)
      await loadData()
      showSuccess("Aliment supprime")
    } catch (err) {
      console.error("[FeedingStock] handleDeleteStock error:", err)
    } finally {
      setSaving(false)
    }
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

  const lowStockItems = stock.filter((s) => s.currentQty / s.maxQty < 0.2)

  if (loading) {
    return (
      <Card className="shadow-soft">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

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
                      <Button onClick={handleProduction} disabled={saving} className="gap-1">
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Factory className="h-4 w-4" />}
                        Enregistrer
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
                      <Button onClick={handleConsumption} disabled={saving} className="gap-1">
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <TrendingDown className="h-4 w-4" />}
                        Enregistrer
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
                    <Label>Cout par kg (FCFA)</Label>
                    <Input
                      type="number"
                      value={newStock.costPerUnit}
                      onChange={(e) => setNewStock((s) => ({ ...s, costPerUnit: e.target.value }))}
                      placeholder="Ex: 250"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Annuler</Button>
                  </DialogClose>
                  <Button onClick={handleSaveStock} disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {editingStock ? "Mettre a jour" : "Ajouter"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {successMessage && (
          <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 flex items-center gap-2 text-green-700">
            <CheckCircle className="h-4 w-4" />
            {successMessage}
          </div>
        )}

        {stock.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-foreground">
                {stock.reduce((acc, s) => acc + s.currentQty, 0).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">kg total</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-foreground">{daysRemaining()}</p>
              <p className="text-xs text-muted-foreground">jours restants</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-foreground">{Math.round(estimatedDailyConsumption())}</p>
              <p className="text-xs text-muted-foreground">kg/jour estime</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-foreground">
                {stock.reduce((acc, s) => acc + s.currentQty * s.costPerUnit, 0).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">FCFA valeur</p>
            </div>
          </div>
        )}

        {lowStockItems.length > 0 && (
          <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-center gap-2 text-amber-700">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">Stock faible: {lowStockItems.map((s) => s.name).join(", ")}</span>
          </div>
        )}

        <div className="space-y-3">
          {stock.map((item) => {
            const percentage = Math.round((item.currentQty / item.maxQty) * 100)
            const isLow = percentage < 20

            return (
              <div key={item.id} className="p-4 border border-border rounded-xl bg-background">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary" />
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={isLow ? "destructive" : "secondary"}>
                      {item.currentQty} / {item.maxQty} {item.unit}
                    </Badge>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditStock(item)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDeleteStock(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Progress value={percentage} className={`h-2 ${isLow ? "[&>div]:bg-destructive" : ""}`} />
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>{percentage}% rempli</span>
                  <span>{item.costPerUnit} FCFA/kg</span>
                </div>
              </div>
            )
          })}

          {stock.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="font-medium">Aucun aliment en stock</p>
              <p className="text-xs mt-1">Ajoutez vos premiers aliments pour commencer le suivi</p>
              <Button variant="link" onClick={() => setShowAddStock(true)} className="mt-2">
                <Plus className="h-4 w-4 mr-1" />
                Ajouter un aliment
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
