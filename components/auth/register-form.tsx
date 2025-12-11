"use client"

import type React from "react"
import { useState, useCallback, useId } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Mail, Lock, User, Phone, Loader2, AlertCircle, CheckCircle2, Check, X } from "lucide-react"
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

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="#1877F2" aria-hidden="true">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
)

type AuthMethod = "email" | "phone"

interface FormErrors {
  name?: string
  email?: string
  phone?: string
  password?: string
  general?: string
}

export function RegisterForm() {
  const router = useRouter()

  const formId = useId()
  const nameErrorId = `${formId}-name-error`
  const emailErrorId = `${formId}-email-error`
  const phoneErrorId = `${formId}-phone-error`
  const passwordErrorId = `${formId}-password-error`
  const generalErrorId = `${formId}-general-error`

  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState<string | null>(null)
  const [errors, setErrors] = useState<FormErrors>({})
  const [success, setSuccess] = useState(false)
  const [authMethod, setAuthMethod] = useState<AuthMethod>("email")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  })

  const passwordChecks = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
  }
  const passwordStrength = Object.values(passwordChecks).filter(Boolean).length

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = "Le nom est requis"
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Le nom doit contenir au moins 2 caracteres"
    }

    if (authMethod === "email") {
      if (!formData.email.trim()) {
        newErrors.email = "L'email est requis"
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Format d'email invalide"
      }
    } else {
      if (!formData.phone.trim()) {
        newErrors.phone = "Le numero de telephone est requis"
      } else if (!/^[+]?[\d\s-]{8,}$/.test(formData.phone.replace(/\s/g, ""))) {
        newErrors.phone = "Format de telephone invalide"
      }
    }

    if (!formData.password) {
      newErrors.password = "Le mot de passe est requis"
    } else if (formData.password.length < 8) {
      newErrors.password = "Le mot de passe doit contenir au moins 8 caracteres"
    } else if (passwordStrength < 3) {
      newErrors.password = "Le mot de passe n'est pas assez securise"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData, authMethod, passwordStrength])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const emailToUse =
        authMethod === "email" ? formData.email : `${formData.phone.replace(/\s/g, "")}@phone.porkyfarm.app`

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: emailToUse,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: formData.name,
            phone: formData.phone,
          },
        },
      })

      if (signUpError) {
        console.error("Registration error:", signUpError)

        if (signUpError.message.includes("already registered")) {
          setErrors({ email: "Cet email est deja utilise" })
        } else if (signUpError.message.includes("invalid")) {
          setErrors({ general: "Donnees invalides. Veuillez verifier vos informations." })
        } else {
          setErrors({ general: signUpError.message })
        }
        return
      }

      // Send welcome email (non-blocking)
      if (authMethod === "email" && data?.user) {
        try {
          await fetch("/api/email/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "welcome",
              to: formData.email,
              data: {
                firstName: formData.name.split(" ")[0],
                name: formData.name,
              },
            }),
          })
        } catch (emailError) {
          // Log but don't block registration
          console.error("Failed to send welcome email:", emailError)
        }
      }

      setSuccess(true)
    } catch (error) {
      console.error("Unexpected registration error:", error)
      setErrors({ general: "Une erreur inattendue est survenue. Veuillez reessayer." })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignup = async (provider: "google" | "facebook") => {
    setSocialLoading(provider)
    setErrors({})

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        console.error(`OAuth ${provider} error:`, error)
        setErrors({ general: `Erreur de connexion avec ${provider === "google" ? "Google" : "Facebook"}` })
        setSocialLoading(null)
      }
    } catch (error) {
      console.error(`OAuth ${provider} error:`, error)
      setErrors({ general: `Erreur de connexion avec ${provider === "google" ? "Google" : "Facebook"}` })
      setSocialLoading(null)
    }
  }

  if (success) {
    return (
      <div className="space-y-4 text-center" role="status" aria-live="polite" aria-label="Inscription reussie">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle2 className="h-8 w-8 text-primary" aria-hidden="true" />
        </div>
        <h3 className="text-xl font-semibold text-foreground">Bienvenue sur PorkyFarm !</h3>
        <p className="text-muted-foreground">
          {authMethod === "email" ? (
            <>
              Nous avons envoye un lien de confirmation a <strong>{formData.email}</strong>. Cliquez sur le lien pour
              activer votre compte.
            </>
          ) : (
            <>Votre compte a ete cree avec succes !</>
          )}
        </p>
        <div className="pt-4 space-y-3">
          <Link href="/guide">
            <Button variant="outline" className="w-full bg-transparent">
              Decouvrir le guide de demarrage
            </Button>
          </Link>
          <Button variant="ghost" onClick={() => router.push("/auth/login")} className="w-full">
            Retour a la connexion
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* OAuth Buttons */}
      <div className="space-y-3">
        <Button
          type="button"
          variant="outline"
          className="h-12 w-full gap-3 bg-white hover:bg-gray-50 border-gray-300 text-gray-700 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          onClick={() => handleOAuthSignup("google")}
          disabled={isLoading || socialLoading !== null}
          aria-label="Continuer avec Google"
        >
          {socialLoading === "google" ? (
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          ) : (
            <GoogleIcon className="h-5 w-5" />
          )}
          <span>Continuer avec Google</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          className="h-12 w-full gap-3 bg-[#1877F2] hover:bg-[#166FE5] text-white border-0 focus-visible:ring-2 focus-visible:ring-[#1877F2] focus-visible:ring-offset-2"
          onClick={() => handleOAuthSignup("facebook")}
          disabled={isLoading || socialLoading !== null}
          aria-label="Continuer avec Facebook"
        >
          {socialLoading === "facebook" ? (
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          ) : (
            <FacebookIcon className="h-5 w-5" />
          )}
          <span>Continuer avec Facebook</span>
        </Button>
      </div>

      {/* Separator */}
      <div className="relative" role="separator" aria-orientation="horizontal">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Ou creez un compte</span>
        </div>
      </div>

      {/* Auth Method Toggle */}
      <div className="flex rounded-lg bg-muted p-1" role="tablist" aria-label="Methode d'inscription">
        <button
          type="button"
          role="tab"
          aria-selected={authMethod === "email"}
          aria-controls="email-form"
          onClick={() => setAuthMethod("email")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
            authMethod === "email"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Mail className="h-4 w-4" aria-hidden="true" />
          Email
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={authMethod === "phone"}
          aria-controls="phone-form"
          onClick={() => setAuthMethod("phone")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
            authMethod === "phone"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Phone className="h-4 w-4" aria-hidden="true" />
          Telephone
        </button>
      </div>

      {/* Registration Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-5"
        id={authMethod === "email" ? "email-form" : "phone-form"}
        noValidate
      >
        {/* General Error Alert */}
        {errors.general && (
          <div
            id={generalErrorId}
            className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
            role="alert"
            aria-live="assertive"
          >
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{errors.general}</span>
          </div>
        )}

        {/* Name Field */}
        <div className="space-y-2">
          <Label htmlFor={`${formId}-name`} className="text-sm font-medium">
            Votre nom
            <span className="text-destructive ml-1" aria-hidden="true">
              *
            </span>
          </Label>
          <div className="relative">
            <User
              className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground pointer-events-none"
              aria-hidden="true"
            />
            <Input
              id={`${formId}-name`}
              type="text"
              placeholder="Kouame Yao"
              className={`h-12 pl-10 ${errors.name ? "border-destructive focus-visible:ring-destructive" : ""}`}
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value })
                if (errors.name) setErrors({ ...errors, name: undefined })
              }}
              required
              aria-required="true"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? nameErrorId : undefined}
              autoComplete="name"
            />
          </div>
          {errors.name && (
            <p id={nameErrorId} className="text-sm text-destructive" role="alert">
              {errors.name}
            </p>
          )}
        </div>

        {/* Email or Phone Field */}
        {authMethod === "email" ? (
          <div className="space-y-2">
            <Label htmlFor={`${formId}-email`} className="text-sm font-medium">
              Email
              <span className="text-destructive ml-1" aria-hidden="true">
                *
              </span>
            </Label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground pointer-events-none"
                aria-hidden="true"
              />
              <Input
                id={`${formId}-email`}
                type="email"
                placeholder="votre@email.com"
                className={`h-12 pl-10 ${errors.email ? "border-destructive focus-visible:ring-destructive" : ""}`}
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value })
                  if (errors.email) setErrors({ ...errors, email: undefined })
                }}
                required
                aria-required="true"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? emailErrorId : undefined}
                autoComplete="email"
              />
            </div>
            {errors.email && (
              <p id={emailErrorId} className="text-sm text-destructive" role="alert">
                {errors.email}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor={`${formId}-phone`} className="text-sm font-medium">
              Numero de telephone
              <span className="text-destructive ml-1" aria-hidden="true">
                *
              </span>
            </Label>
            <div className="relative">
              <Phone
                className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground pointer-events-none"
                aria-hidden="true"
              />
              <Input
                id={`${formId}-phone`}
                type="tel"
                placeholder="+225 07 00 00 00 00"
                className={`h-12 pl-10 ${errors.phone ? "border-destructive focus-visible:ring-destructive" : ""}`}
                value={formData.phone}
                onChange={(e) => {
                  setFormData({ ...formData, phone: e.target.value })
                  if (errors.phone) setErrors({ ...errors, phone: undefined })
                }}
                required
                aria-required="true"
                aria-invalid={!!errors.phone}
                aria-describedby={errors.phone ? phoneErrorId : undefined}
                autoComplete="tel"
              />
            </div>
            {errors.phone && (
              <p id={phoneErrorId} className="text-sm text-destructive" role="alert">
                {errors.phone}
              </p>
            )}
          </div>
        )}

        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor={`${formId}-password`} className="text-sm font-medium">
            Mot de passe
            <span className="text-destructive ml-1" aria-hidden="true">
              *
            </span>
          </Label>
          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground pointer-events-none"
              aria-hidden="true"
            />
            <Input
              id={`${formId}-password`}
              type={showPassword ? "text" : "password"}
              placeholder="********"
              className={`h-12 pl-10 pr-10 ${errors.password ? "border-destructive focus-visible:ring-destructive" : ""}`}
              value={formData.password}
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value })
                if (errors.password) setErrors({ ...errors, password: undefined })
              }}
              required
              aria-required="true"
              aria-invalid={!!errors.password}
              aria-describedby={`${passwordErrorId} password-requirements`}
              autoComplete="new-password"
              minLength={8}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Eye className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
          {errors.password && (
            <p id={passwordErrorId} className="text-sm text-destructive" role="alert">
              {errors.password}
            </p>
          )}

          {/* Password Strength Indicator */}
          {formData.password && (
            <div className="space-y-2" id="password-requirements" aria-label="Exigences du mot de passe">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      passwordStrength >= level
                        ? passwordStrength <= 2
                          ? "bg-destructive"
                          : passwordStrength === 3
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        : "bg-muted"
                    }`}
                    aria-hidden="true"
                  />
                ))}
              </div>
              <ul className="grid grid-cols-2 gap-1 text-xs">
                {[
                  { check: passwordChecks.length, label: "8 caracteres min" },
                  { check: passwordChecks.uppercase, label: "Une majuscule" },
                  { check: passwordChecks.lowercase, label: "Une minuscule" },
                  { check: passwordChecks.number, label: "Un chiffre" },
                ].map(({ check, label }) => (
                  <li
                    key={label}
                    className={`flex items-center gap-1 ${check ? "text-green-600" : "text-muted-foreground"}`}
                  >
                    {check ? (
                      <Check className="h-3 w-3" aria-hidden="true" />
                    ) : (
                      <X className="h-3 w-3" aria-hidden="true" />
                    )}
                    <span>{label}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Terms Agreement */}
        <p className="text-xs text-muted-foreground">
          En vous inscrivant, vous acceptez nos{" "}
          <Link
            href="/terms"
            className="text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
          >
            Conditions d'utilisation
          </Link>{" "}
          et notre{" "}
          <Link
            href="/privacy"
            className="text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
          >
            Politique de confidentialite
          </Link>
          .
        </p>

        {/* Submit Button */}
        <Button
          type="submit"
          className="h-12 w-full text-base font-semibold"
          disabled={isLoading || socialLoading !== null}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
              <span>Inscription en cours...</span>
            </>
          ) : (
            "Creer mon compte"
          )}
        </Button>
      </form>

      {/* Login Link */}
      <p className="text-center text-sm text-muted-foreground">
        Vous avez deja un compte ?{" "}
        <Link
          href="/auth/login"
          className="font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
        >
          Connectez-vous
        </Link>
      </p>
    </div>
  )
}
