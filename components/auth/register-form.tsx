"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Mail, Lock, User, Phone, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { supabase } from "@/lib/supabase/client"

export function RegisterForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (formData.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères")
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
          data: {
            full_name: formData.name,
            phone: formData.phone,
          },
        },
      })

      if (error) {
        if (error.message.includes("already registered")) {
          setError("Cet email est déjà utilisé")
        } else {
          setError(error.message)
        }
        return
      }

      setSuccess(true)
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle2 className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold text-foreground">Vérifiez votre email</h3>
        <p className="text-muted-foreground">
          Nous avons envoyé un lien de confirmation à <strong>{formData.email}</strong>. Cliquez sur le lien pour
          activer votre compte.
        </p>
        <Button variant="outline" onClick={() => router.push("/auth/login")} className="mt-4">
          Retour à la connexion
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Nom complet</Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="name"
            type="text"
            placeholder="Kouamé Yao"
            className="h-12 pl-10"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="votre@email.com"
            className="h-12 pl-10"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Téléphone</Label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="phone"
            type="tel"
            placeholder="+225 07 00 00 00 00"
            className="h-12 pl-10"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Mot de passe</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className="h-12 pl-10 pr-10"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            minLength={8}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">Minimum 8 caractères</p>
      </div>

      <Button type="submit" className="h-12 w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Création du compte...
          </>
        ) : (
          "Créer mon compte"
        )}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        En créant un compte, vous acceptez nos{" "}
        <a href="#" className="text-primary hover:underline">
          Conditions d'utilisation
        </a>{" "}
        et notre{" "}
        <a href="#" className="text-primary hover:underline">
          Politique de confidentialité
        </a>
      </p>
    </form>
  )
}
