"use client"

import type React from "react"
import { useState, useCallback, useId } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Mail, Lock, User, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { supabase } from "@/lib/supabase/client"

const GoogleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
)

const AppleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
  </svg>
)

interface FormErrors {
  name?: string
  email?: string
  password?: string
  general?: string
}

export function RegisterForm() {
  const router = useRouter()
  const formId = useId()

  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [appleLoading, setAppleLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  })

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = "Le nom est requis"
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Le nom doit contenir au moins 2 caracteres"
    }

    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Format d'email invalide"
    }

    if (!formData.password) {
      newErrors.password = "Le mot de passe est requis"
    } else if (formData.password.length < 6) {
      newErrors.password = "Le mot de passe doit contenir au moins 6 caracteres"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    setErrors({})

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: formData.name,
          },
        },
      })

      if (signUpError) {
        if (signUpError.message.includes("already registered")) {
          setErrors({ email: "Cet email est deja utilise" })
        } else {
          setErrors({ general: signUpError.message })
        }
        return
      }

      // Send welcome email (non-blocking)
      if (data?.user) {
        fetch("/api/email/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "welcome",
            to: formData.email,
            data: { firstName: formData.name.split(" ")[0], name: formData.name },
          }),
        }).catch(() => {})
      }

      setSuccess(true)
    } catch (error) {
      setErrors({ general: "Une erreur inattendue est survenue. Veuillez reessayer." })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    setGoogleLoading(true)
    setErrors({})

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setErrors({ general: "Erreur de connexion avec Google" })
        setGoogleLoading(false)
      }
    } catch {
      setErrors({ general: "Erreur de connexion avec Google" })
      setGoogleLoading(false)
    }
  }

  const handleAppleSignup = async () => {
    setAppleLoading(true)
    setErrors({})

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "apple",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setErrors({ general: "Erreur de connexion avec Apple" })
        setAppleLoading(false)
      }
    } catch {
      setErrors({ general: "Erreur de connexion avec Apple" })
      setAppleLoading(false)
    }
  }

  const isAnyLoading = isLoading || googleLoading || appleLoading

  if (success) {
    return (
      <div className="space-y-4 text-center" role="status" aria-live="polite">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle2 className="h-8 w-8 text-primary" aria-hidden="true" />
        </div>
        <h3 className="text-xl font-semibold text-foreground">Bienvenue sur PorkyFarm !</h3>
        <p className="text-muted-foreground">
          Nous avons envoye un lien de confirmation a <strong>{formData.email}</strong>. Cliquez sur le lien pour
          activer votre compte.
        </p>
        <Button variant="ghost" onClick={() => router.push("/auth/login")} className="w-full mt-4">
          Retour a la connexion
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {/* Google OAuth */}
        <Button
          type="button"
          variant="outline"
          className="h-12 w-full gap-3 bg-white hover:bg-gray-50 border-gray-300 text-gray-700"
          onClick={handleGoogleSignup}
          disabled={isAnyLoading}
          aria-label="Continuer avec Google"
        >
          {googleLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          ) : (
            <GoogleIcon className="h-5 w-5" />
          )}
          <span>Continuer avec Google</span>
        </Button>

        {/* Apple OAuth - Black button per Apple HIG */}
        <Button
          type="button"
          className="h-12 w-full gap-3 bg-black hover:bg-gray-900 text-white border-0"
          onClick={handleAppleSignup}
          disabled={isAnyLoading}
          aria-label="Continuer avec Apple"
        >
          {appleLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          ) : (
            <AppleIcon className="h-5 w-5" />
          )}
          <span>Continuer avec Apple</span>
        </Button>
      </div>

      {/* Separator */}
      <div className="relative" role="separator">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Ou avec votre email</span>
        </div>
      </div>

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* General Error */}
        {errors.general && (
          <div
            className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
            role="alert"
          >
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{errors.general}</span>
          </div>
        )}

        {/* Name Field */}
        <div className="space-y-2">
          <Label htmlFor={`${formId}-name`}>Votre nom</Label>
          <div className="relative">
            <User
              className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground pointer-events-none"
              aria-hidden="true"
            />
            <Input
              id={`${formId}-name`}
              type="text"
              placeholder="Kouame Yao"
              className={`h-12 pl-10 ${errors.name ? "border-destructive" : ""}`}
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value })
                if (errors.name) setErrors({ ...errors, name: undefined })
              }}
              required
              autoComplete="name"
              disabled={isAnyLoading}
            />
          </div>
          {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor={`${formId}-email`}>Email</Label>
          <div className="relative">
            <Mail
              className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground pointer-events-none"
              aria-hidden="true"
            />
            <Input
              id={`${formId}-email`}
              type="email"
              placeholder="votre@email.com"
              className={`h-12 pl-10 ${errors.email ? "border-destructive" : ""}`}
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value })
                if (errors.email) setErrors({ ...errors, email: undefined })
              }}
              required
              autoComplete="email"
              disabled={isAnyLoading}
            />
          </div>
          {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor={`${formId}-password`}>Mot de passe</Label>
          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground pointer-events-none"
              aria-hidden="true"
            />
            <Input
              id={`${formId}-password`}
              type={showPassword ? "text" : "password"}
              placeholder="Minimum 6 caracteres"
              className={`h-12 pl-10 pr-10 ${errors.password ? "border-destructive" : ""}`}
              value={formData.password}
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value })
                if (errors.password) setErrors({ ...errors, password: undefined })
              }}
              required
              autoComplete="new-password"
              minLength={6}
              disabled={isAnyLoading}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
        </div>

        {/* Submit Button */}
        <Button type="submit" className="h-12 w-full" disabled={isAnyLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Inscription en cours...
            </>
          ) : (
            "Creer mon compte"
          )}
        </Button>

        {/* Terms */}
        <p className="text-center text-xs text-muted-foreground">
          En vous inscrivant, vous acceptez nos{" "}
          <Link href="/terms" className="text-primary hover:underline">
            Conditions d'utilisation
          </Link>{" "}
          et notre{" "}
          <Link href="/privacy" className="text-primary hover:underline">
            Politique de confidentialite
          </Link>
        </p>
      </form>
    </div>
  )
}
