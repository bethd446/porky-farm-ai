"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Mail, Lock, Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { supabase } from "@/lib/supabase/client"

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    console.log("[v0] Attempting login with email:", formData.email)

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      console.log("[v0] Auth response:", { user: data?.user?.email, error: authError?.message })

      if (authError) {
        if (authError.message === "Invalid login credentials") {
          setError("Email ou mot de passe incorrect")
        } else if (authError.message.includes("Email not confirmed")) {
          setError("Veuillez confirmer votre email avant de vous connecter")
        } else {
          setError(authError.message)
        }
        setIsLoading(false)
        return
      }

      if (data?.session) {
        console.log("[v0] Login successful! User:", data.user?.email)
        console.log("[v0] Session stored, waiting for persistence...")
        setSuccess(true)

        await new Promise((resolve) => setTimeout(resolve, 300))

        console.log("[v0] Navigating to dashboard...")
        window.location.href = "/dashboard"
      }
    } catch (err) {
      console.error("[v0] Login error:", err)
      setError("Une erreur est survenue. Veuillez réessayer.")
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-lg bg-primary/10 p-3 text-sm text-primary">
          <CheckCircle className="h-4 w-4 shrink-0" />
          Connexion réussie ! Redirection en cours...
        </div>
      )}

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
            disabled={isLoading || success}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Mot de passe</Label>
          <a href="#" className="text-sm text-primary hover:underline">
            Mot de passe oublié ?
          </a>
        </div>
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
            disabled={isLoading || success}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <Button type="submit" className="h-12 w-full" disabled={isLoading || success}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Connexion...
          </>
        ) : success ? (
          <>
            <CheckCircle className="mr-2 h-5 w-5" />
            Connecté !
          </>
        ) : (
          "Se connecter"
        )}
      </Button>
    </form>
  )
}
