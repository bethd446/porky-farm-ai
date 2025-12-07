"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Camera, MapPin, Calendar, Edit, Save, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { z } from "zod"

const profileSchema = z.object({
  fullName: z.string().min(2, "Minimum 2 caracteres").max(100, "Maximum 100 caracteres"),
  farmName: z.string().min(2, "Minimum 2 caracteres").max(100, "Maximum 100 caracteres"),
  location: z.string().min(2, "Minimum 2 caracteres").max(100, "Maximum 100 caracteres"),
})

type ProfileErrors = {
  fullName?: string
  farmName?: string
  location?: string
}

interface UserProfile {
  fullName: string
  farmName: string
  location: string
  email: string
  avatar: string | null
  memberSince: string
}

const DEFAULT_PROFILE: UserProfile = {
  fullName: "Eleveur PorkyFarm",
  farmName: "Ma Ferme Porcine",
  location: "Cote d'Ivoire",
  email: "contact@porkyfarm.app",
  avatar: null,
  memberSince: new Date().getFullYear().toString(),
}

export function ProfileHeader() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [errors, setErrors] = useState<ProfileErrors>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    fullName: "",
    farmName: "",
    location: "",
  })

  useEffect(() => {
    const savedProfile = localStorage.getItem("porkyfarm-user-profile")
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile)
      setProfile(parsed)
      setFormData({
        fullName: parsed.fullName,
        farmName: parsed.farmName,
        location: parsed.location,
      })
    }
  }, [])

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("La taille de l'image ne doit pas depasser 5 Mo")
        return
      }
      const reader = new FileReader()
      reader.onload = (event) => {
        const avatarData = event.target?.result as string
        const updatedProfile = { ...profile, avatar: avatarData }
        setProfile(updatedProfile)
        localStorage.setItem("porkyfarm-user-profile", JSON.stringify(updatedProfile))
      }
      reader.readAsDataURL(file)
    }
  }

  const validateField = (field: keyof typeof formData, value: string) => {
    try {
      profileSchema.shape[field].parse(value)
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    } catch (err) {
      if (err instanceof z.ZodError) {
        setErrors((prev) => ({ ...prev, [field]: err.errors[0]?.message }))
      }
    }
  }

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    validateField(field, value)
  }

  const handleSave = async () => {
    const result = profileSchema.safeParse(formData)
    if (!result.success) {
      const fieldErrors: ProfileErrors = {}
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof ProfileErrors
        fieldErrors[field] = err.message
      })
      setErrors(fieldErrors)
      return
    }

    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 800))

    const updatedProfile = {
      ...profile,
      fullName: formData.fullName,
      farmName: formData.farmName,
      location: formData.location,
    }

    setProfile(updatedProfile)
    localStorage.setItem("porkyfarm-user-profile", JSON.stringify(updatedProfile))

    setIsSaving(false)
    setIsEditing(false)
    setErrors({})
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const handleOpenDialog = () => {
    setFormData({
      fullName: profile.fullName,
      farmName: profile.farmName,
      location: profile.location,
    })
    setErrors({})
    setIsEditing(true)
  }

  return (
    <>
      <Card className="relative overflow-hidden shadow-md">
        <div className="h-32 bg-gradient-to-r from-primary to-primary/70 md:h-48" />

        <div className="relative px-6 pb-6">
          <div className="absolute -top-12 left-6 md:-top-16">
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-card bg-primary text-3xl font-bold text-primary-foreground shadow-lg md:h-32 md:w-32 md:text-4xl overflow-hidden">
                {profile.avatar ? (
                  <img src={profile.avatar || "/placeholder.svg"} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  profile.fullName.charAt(0).toUpperCase()
                )}
              </div>
              <button
                onClick={handleAvatarClick}
                className="absolute bottom-0 right-0 rounded-full bg-primary p-2 text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
                aria-label="Changer l'avatar"
              >
                <Camera className="h-4 w-4" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>
          </div>

          <div className="pt-14 md:pt-20">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                {showSuccess && (
                  <div className="mb-3 flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary animate-in slide-in-from-top-2">
                    <CheckCircle className="h-4 w-4" />
                    Profil mis a jour avec succes !
                  </div>
                )}
                <h1 className="text-2xl font-bold text-foreground">{profile.fullName}</h1>
                <p className="text-muted-foreground">{profile.farmName}</p>
                <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {profile.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Membre depuis {profile.memberSince}
                  </span>
                </div>
              </div>
              <Button variant="outline" className="gap-2 bg-transparent" onClick={handleOpenDialog}>
                <Edit className="h-4 w-4" />
                Modifier le profil
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier le profil</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Votre nom</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                placeholder="Votre nom complet"
                aria-invalid={!!errors.fullName}
                className={errors.fullName ? "border-destructive" : ""}
              />
              {errors.fullName && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.fullName}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="farmName">Nom de la ferme</Label>
              <Input
                id="farmName"
                value={formData.farmName}
                onChange={(e) => handleInputChange("farmName", e.target.value)}
                placeholder="Nom de votre exploitation"
                aria-invalid={!!errors.farmName}
                className={errors.farmName ? "border-destructive" : ""}
              />
              {errors.farmName && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.farmName}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Localisation</Label>
              <Input
                id="location"
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
