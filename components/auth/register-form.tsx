"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Mail, Lock, User, Phone, Loader2, AlertCircle, CheckCircle2, Check, X } from "lucide-react"
import { supabase } from "@/lib/supabase/client"

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
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
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

type AuthMethod = "email" | "phone"

export function RegisterForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (formData.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caracteres")
      setIsLoading(false)
      return
    }

    try {
      const emailToUse =
        authMethod === "email" ? formData.email : `${formData.phone.replace(/\s/g, "")}@phone.porkyfarm.app`

      const { error } = await supabase.auth.signUp({
        email: emailToUse,
        password: formData.password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/auth/callback`,
          data: {
            full_name: formData.name,
            phone: formData.phone,
          },
        },
      })

      if (error) {
        if (error.message.includes("already registered")) {
          setError("Cet email est deja utilise")
        } else {
          setError(error.message)
        }
        return
      }

      if (authMethod === "email") {
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
          // Ne pas bloquer l'inscription si l'email echoue
          console.error("Failed to send welcome email:", emailError)
        }
      }

      setSuccess(true)
    } catch {
      setError("Une erreur est survenue. Veuillez reessayer.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    setSocialLoading("google")
    setError(null)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) {
        setError(error.message)
        setSocialLoading(null)
      }
    } catch {
      setError("Erreur de connexion avec Google")
      setSocialLoading(null)
    }
  }

  const handleFacebookSignup = async () => {
    setSocialLoading("facebook")
    setError(null)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "facebook",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) {
        setError(error.message)
        setSocialLoading(null)
      }
    } catch {
      setError("Erreur de connexion avec Facebook")
      setSocialLoading(null)
    }
  }

  if (success) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle2 className="h-8 w-8 text-primary" />
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
      <div className="space-y-3">
        <Button
          type="button"
          variant="outline"
          className="h-12 w-full gap-3 bg-white hover:bg-gray-50 border-gray-300 text-gray-700"
          onClick={handleGoogleSignup}
          disabled={isLoading || socialLoading !== null}
        >
          {socialLoading === "google" ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <GoogleIcon className="h-5 w-5" />
          )}
          Continuer avec Google
        </Button>

        <Button
          type="button"
          variant="outline"
          className="h-12 w-full gap-3 bg-[#1877F2] hover:bg-[#166FE5] text-white border-0"
          onClick={handleFacebookSignup}
          disabled={isLoading || socialLoading !== null}
        >
          {socialLoading === "facebook" ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <FacebookIcon className="h-5 w-5" />
          )}
          Continuer avec Facebook
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Ou creez un compte</span>
        </div>
      </div>

      <div className="flex rounded-lg bg-muted p-1">
        <button
          type="button"
          onClick={() => setAuthMethod("email")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-colors ${
            authMethod === "email"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Mail className="h-4 w-4" />
          Email
        </button>
        <button
          type="button"
          onClick={() => setAuthMethod("phone")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-colors ${
            authMethod === "phone"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Phone className="h-4 w-4" />
          Telephone
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="name">Votre nom</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="name"
              type="text"
              placeholder="Kouame Yao"
              className="h-12 pl-10"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
        </div>

        {authMethod === "email" ? (
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
        ) : (
          <div className="space-y-2">
            <Label htmlFor="phone">Numero de telephone</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                placeholder="+225 07 00 00 00 00"
                className="h-12 pl-10"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
          </div>
        )}

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

          {formData.password && (
            <div className="space-y-2 pt-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      passwordStrength >= level
                        ? passwordStrength <= 1
                          ? "bg-red-500"
                          : passwordStrength === 2
                            ? "bg-orange-500"
                            : passwordStrength === 3
                              ? "bg-yellow-500"
                              : "bg-green-500"
                        : "bg-muted"
                    }`}
                  />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <div
                  className={`flex items-center gap-1 ${passwordChecks.length ? "text-green-600" : "text-muted-foreground"}`}
                >
                  {passwordChecks.length ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}8 caracteres min
                </div>
                <div
                  className={`flex items-center gap-1 ${passwordChecks.uppercase ? "text-green-600" : "text-muted-foreground"}`}
                >
                  {passwordChecks.uppercase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}1 majuscule
                </div>
                <div
                  className={`flex items-center gap-1 ${passwordChecks.lowercase ? "text-green-600" : "text-muted-foreground"}`}
                >
                  {passwordChecks.lowercase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}1 minuscule
                </div>
                <div
                  className={`flex items-center gap-1 ${passwordChecks.number ? "text-green-600" : "text-muted-foreground"}`}
                >
                  {passwordChecks.number ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}1 chiffre
                </div>
              </div>
            </div>
          )}
        </div>

        <Button type="submit" className="h-12 w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Creation du compte...
            </>
          ) : (
            "Creer mon elevage"
          )}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          En creant un compte, vous acceptez nos{" "}
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
