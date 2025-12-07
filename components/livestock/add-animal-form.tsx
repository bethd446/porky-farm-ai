"use client"

import type React from "react"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Camera, Loader2, Upload, X, CheckCircle } from "lucide-react"
import { useLivestock } from "@/contexts/livestock-context"

export function AddAnimalForm() {
  const router = useRouter()
  const { addAnimal } = useLivestock()
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [photo, setPhoto] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    name: "",
    tagNumber: "",
    category: "",
    breed: "",
    birthDate: "",
    weight: "",
    acquisitionDate: "",
    acquisitionPrice: "",
    motherId: "",
    fatherId: "",
    notes: "",
  })

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhoto(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removePhoto = () => {
    setPhoto(null)
    setPhotoFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
    if (cameraInputRef.current) cameraInputRef.current.value = ""
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const birthDate = new Date(formData.birthDate)
      const ageInMonths = Math.floor((Date.now() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30))
      const ageYears = Math.floor(ageInMonths / 12)
      const ageMonthsRem = ageInMonths % 12
      const age =
        ageYears > 0 ? `${ageYears} an${ageYears > 1 ? "s" : ""} ${ageMonthsRem} mois` : `${ageMonthsRem} mois`

      const statusMap: Record<string, { status: string; color: string }> = {
        truie: { status: "Active", color: "bg-pink-500" },
        verrat: { status: "Reproducteur", color: "bg-blue-500" },
        porcelet: { status: "Croissance", color: "bg-green-500" },
        porc_engraissement: { status: "Engraissement", color: "bg-emerald-500" },
      }

      const statusInfo = statusMap[formData.category] || { status: "Active", color: "bg-gray-500" }

      addAnimal({
        name: formData.name,
        type:
          formData.category === "truie"
            ? "Truie"
            : formData.category === "verrat"
              ? "Verrat"
              : formData.category === "porcelet"
                ? "Porcelets"
                : "Engraissement",
        breed: formData.breed,
        age: age,
        weight: formData.weight ? `${formData.weight} kg` : "Non renseigné",
        status: statusInfo.status,
        statusColor: statusInfo.color,
        image: photo,
        healthScore: 100,
        nextEvent: "Pas d'événement prévu",
        tagNumber: formData.tagNumber,
        birthDate: formData.birthDate,
        acquisitionDate: formData.acquisitionDate,
        acquisitionPrice: formData.acquisitionPrice,
        motherId: formData.motherId,
        fatherId: formData.fatherId,
        notes: formData.notes,
      })

      setSuccess(true)
      setTimeout(() => {
        router.push("/dashboard/livestock")
      }, 1500)
    } catch (error) {
      console.error("Erreur lors de l'enregistrement:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
        <h2 className="text-xl font-semibold text-foreground">Animal enregistré avec succès !</h2>
        <p className="text-muted-foreground mt-2">Redirection vers la liste...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Photo Upload - Section entièrement fonctionnelle */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-base">Photo de l'animal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              {/* Zone d'aperçu/upload */}
              <div
                className="relative flex h-48 w-full items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/50 overflow-hidden cursor-pointer hover:bg-muted/70 transition"
                onClick={() => fileInputRef.current?.click()}
              >
                {photo ? (
                  <>
                    <img src={photo || "/placeholder.svg"} alt="Aperçu" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        removePhoto()
                      }}
                      className="absolute top-2 right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Upload className="h-10 w-10" />
                    <span className="text-sm">Cliquez ou glissez une image</span>
                  </div>
                )}
              </div>

              {/* Inputs cachés */}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handlePhotoUpload}
              />

              {/* Boutons fonctionnels */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2 bg-transparent"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4" />
                  Télécharger
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2 bg-transparent"
                  onClick={() => cameraInputRef.current?.click()}
                >
                  <Camera className="h-4 w-4" />
                  Prendre photo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Info */}
        <Card className="shadow-soft lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Informations principales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nom / Identifiant</Label>
                <Input
                  id="name"
                  placeholder="Ex: Truie #32"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tagNumber">Numéro de boucle</Label>
                <Input
                  id="tagNumber"
                  placeholder="Ex: CI-2024-0032"
                  value={formData.tagNumber}
                  onChange={(e) => setFormData({ ...formData, tagNumber: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Catégorie</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="truie">Truie</SelectItem>
                    <SelectItem value="verrat">Verrat</SelectItem>
                    <SelectItem value="porcelet">Porcelet</SelectItem>
                    <SelectItem value="porc_engraissement">Porc d'engraissement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="breed">Race</Label>
                <Select value={formData.breed} onValueChange={(value) => setFormData({ ...formData, breed: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="large_white">Large White</SelectItem>
                    <SelectItem value="landrace">Landrace</SelectItem>
                    <SelectItem value="duroc">Duroc</SelectItem>
                    <SelectItem value="pietrain">Piétrain</SelectItem>
                    <SelectItem value="croise">Croisé</SelectItem>
                    <SelectItem value="local">Race locale</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="birthDate">Date de naissance</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Poids actuel (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="Ex: 185"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Acquisition & Genealogy */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-base">Acquisition</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="acquisitionDate">Date d'acquisition</Label>
              <Input
                id="acquisitionDate"
                type="date"
                value={formData.acquisitionDate}
                onChange={(e) => setFormData({ ...formData, acquisitionDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="acquisitionPrice">Prix d'achat (FCFA)</Label>
              <Input
                id="acquisitionPrice"
                type="number"
                placeholder="Ex: 150000"
                value={formData.acquisitionPrice}
                onChange={(e) => setFormData({ ...formData, acquisitionPrice: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-base">Généalogie</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Mère</Label>
              <Select
                value={formData.motherId}
                onValueChange={(value) => setFormData({ ...formData, motherId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner la mère" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Non renseigné</SelectItem>
                  <SelectItem value="truie-32">Truie #32</SelectItem>
                  <SelectItem value="truie-28">Truie #28</SelectItem>
                  <SelectItem value="truie-45">Truie #45</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Père</Label>
              <Select
                value={formData.fatherId}
                onValueChange={(value) => setFormData({ ...formData, fatherId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le père" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Non renseigné</SelectItem>
                  <SelectItem value="verrat-8">Verrat #8</SelectItem>
                  <SelectItem value="verrat-5">Verrat #5</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-base">Notes additionnelles</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Ajoutez des observations ou informations supplémentaires..."
            className="min-h-24"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Annuler
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enregistrement...
            </>
          ) : (
            "Enregistrer l'animal"
          )}
        </Button>
      </div>
    </form>
  )
}
