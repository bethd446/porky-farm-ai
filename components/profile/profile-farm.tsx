"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { MapPin, Home, Ruler, Thermometer, Edit, Save, Loader2, Camera, CheckCircle, AlertCircle } from "lucide-react"
import { z } from "zod"

const farmSchema = z.object({
  location: z.string().min(2, "Minimum 2 caracteres"),
  buildings: z
    .string()
    .min(1, "Requis")
    .refine((v) => Number(v) >= 0, "Nombre positif requis"),
  area: z
    .string()
    .min(1, "Requis")
    .refine((v) => Number(v) > 0, "Superficie positive requise"),
  climate: z.string().min(2, "Minimum 2 caracteres"),
})

type FarmErrors = {
  location?: string
  buildings?: string
  area?: string
  climate?: string
}

interface FarmData {
  location: string
  buildings: string
  area: string
  climate: string
  image: string | null
}

const DEFAULT_FARM: FarmData = {
  location: "Bouake, RCI",
  buildings: "5",
  area: "2.5",
  climate: "Tropical humide",
  image: null,
}

export function ProfileFarm() {
  const [farm, setFarm] = useState<FarmData>(DEFAULT_FARM)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [errors, setErrors] = useState<FarmErrors>({})
  const [formData, setFormData] = useState<FarmData>(DEFAULT_FARM)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem("porkyfarm-farm-data")
    if (saved) {
      const parsed = JSON.parse(saved)
      setFarm(parsed)
      setFormData(parsed)
    }
  }, [])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("La taille de l'image ne doit pas depasser 5 Mo")
        return
      }
      const reader = new FileReader()
      reader.onload = (event) => {
        const imageData = event.target?.result as string
        setFormData((prev) => ({ ...prev, image: imageData }))
      }
      reader.readAsDataURL(file)
    }
  }

  const validateField = (field: keyof FarmData, value: string) => {
    if (field === "image") return
    try {
      farmSchema.shape[field].parse(value)
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    } catch (err) {
      if (err instanceof z.ZodError) {
        setErrors((prev) => ({ ...prev, [field]: err.errors[0]?.message }))
      }
    }
  }

  const handleInputChange = (field: keyof FarmData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    validateField(field, value)
  }

  const handleSave = async () => {
    const result = farmSchema.safeParse(formData)
    if (!result.success) {
      const fieldErrors: FarmErrors = {}
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof FarmErrors
        fieldErrors[field] = err.message
      })
      setErrors(fieldErrors)
      return
    }

    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 800))

    setFarm(formData)
    localStorage.setItem("porkyfarm-farm-data", JSON.stringify(formData))

    setIsSaving(false)
    setIsEditing(false)
    setErrors({})
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const handleOpenDialog = () => {
    setFormData(farm)
    setErrors({})
    setIsEditing(true)
  }

  return (
    <>
      <Card className="shadow-soft">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-medium">Ma ferme</CardTitle>
          <Button variant="ghost" size="sm" className="gap-1" onClick={handleOpenDialog}>
            <Edit className="h-4 w-4" />
            Modifier
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {showSuccess && (
            <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary animate-in slide-in-from-top-2">
              <CheckCircle className="h-4 w-4" />
              Informations mises a jour !
            </div>
          )}

          <div className="aspect-video overflow-hidden rounded-xl bg-muted">
            {farm.image ? (
              <img
                src={farm.image || "/placeholder.svg"}
                alt="Vue de la ferme"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <Camera className="h-12 w-12" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 rounded-xl bg-muted p-3">
              <MapPin className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Localisation</p>
                <p className="text-xs text-muted-foreground">{farm.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-muted p-3">
              <Home className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Batiments</p>
                <p className="text-xs text-muted-foreground">{farm.buildings} structures</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-muted p-3">
              <Ruler className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Superficie</p>
                <p className="text-xs text-muted-foreground">{farm.area} hectares</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-muted p-3">
              <Thermometer className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Climat</p>
                <p className="text-xs text-muted-foreground">{farm.climate}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier les informations de la ferme</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Photo de la ferme</Label>
              <div
                className="aspect-video overflow-hidden rounded-xl bg-muted cursor-pointer hover:bg-muted/80 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {formData.image ? (
                  <img src={formData.image || "/placeholder.svg"} alt="Apercu" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                    <Camera className="h-8 w-8" />
                    <span className="text-sm">Cliquez pour ajouter une photo</span>
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="farm-location">Localisation</Label>
              <Input
                id="farm-location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="Ville, Region"
                aria-invalid={!!errors.location}
                className={errors.location ? "border-destructive" : ""}
              />
              {errors.location && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.location}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="farm-buildings">Nombre de batiments</Label>
                <Input
                  id="farm-buildings"
                  type="number"
                  value={formData.buildings}
                  onChange={(e) => handleInputChange("buildings", e.target.value)}
                  min="0"
                  aria-invalid={!!errors.buildings}
                  className={errors.buildings ? "border-destructive" : ""}
                />
                {errors.buildings && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.buildings}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="farm-area">Superficie (ha)</Label>
                <Input
                  id="farm-area"
                  type="number"
                  step="0.1"
                  value={formData.area}
                  onChange={(e) => handleInputChange("area", e.target.value)}
                  min="0"
                  aria-invalid={!!errors.area}
                  className={errors.area ? "border-destructive" : ""}
                />
                {errors.area && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.area}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="farm-climate">Type de climat</Label>
              <Input
                id="farm-climate"
                value={formData.climate}
                onChange={(e) => handleInputChange("climate", e.target.value)}
                placeholder="Ex: Tropical humide"
                aria-invalid={!!errors.climate}
                className={errors.climate ? "border-destructive" : ""}
              />
              {errors.climate && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.climate}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="gap-2">
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Enregistrer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
