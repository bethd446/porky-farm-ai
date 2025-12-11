"use client"

import type React from "react"
import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, CheckCircle2, Shield, User, Database, Mail, Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

type OAuthApp = {
  name: string
  icon?: string
  website?: string
}

type Scope = {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  required?: boolean
}

const AVAILABLE_SCOPES: Scope[] = [
  {
    id: "openid",
    name: "Identite",
    description: "Acceder a votre identifiant unique",
    icon: <User className="h-4 w-4" />,
    required: true,
  },
  {
    id: "profile",
    name: "Profil",
    description: "Acceder a votre nom et photo de profil",
    icon: <User className="h-4 w-4" />,
  },
  {
    id: "email",
    name: "Email",
    description: "Acceder a votre adresse email",
    icon: <Mail className="h-4 w-4" />,
  },
  {
    id: "offline_access",
    name: "Acces hors ligne",
    description: "Rester connecte meme quand vous n'utilisez pas l'application",
    icon: <Database className="h-4 w-4" />,
  },
]

function OAuthConsentContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [app, setApp] = useState<OAuthApp | null>(null)
  const [requestedScopes, setRequestedScopes] = useState<string[]>([])
  const [selectedScopes, setSelectedScopes] = useState<string[]>([])

  // OAuth parameters
  const clientId = searchParams.get("client_id")
  const redirectUri = searchParams.get("redirect_uri")
  const responseType = searchParams.get("response_type")
  const scope = searchParams.get("scope")
  const state = searchParams.get("state")
  const codeChallenge = searchParams.get("code_challenge")
  const codeChallengeMethod = searchParams.get("code_challenge_method")

  useEffect(() => {
    async function initialize() {
      try {
        // Verifier l'utilisateur connecte
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
          // Rediriger vers la connexion avec retour ici
          const returnUrl = encodeURIComponent(window.location.href)
          router.push(`/auth/login?returnTo=${returnUrl}`)
          return
        }

        setUser(user)

        // Valider les parametres OAuth
        if (!clientId || !redirectUri || !responseType) {
          setError("Parametres OAuth manquants ou invalides")
          setLoading(false)
          return
        }

        // Parser les scopes demandes
        const scopes = scope ? scope.split(" ") : ["openid"]
        setRequestedScopes(scopes)
        setSelectedScopes(scopes)

        // Recuperer les infos de l'application (simulees pour l'instant)
        // Dans une vraie implementation, vous recupereriez ces infos depuis Supabase
        setApp({
          name: clientId,
          website: redirectUri ? new URL(redirectUri).origin : undefined,
        })

        setLoading(false)
      } catch (err) {
        console.error("Erreur initialisation OAuth:", err)
        setError("Erreur lors de l'initialisation")
        setLoading(false)
      }
    }

    initialize()
  }, [clientId, redirectUri, responseType, scope, router])

  const handleAuthorize = async () => {
    if (!clientId || !redirectUri) return

    setSubmitting(true)
    setError(null)

    try {
      // Construire l'URL de redirection avec le code d'autorisation
      const params = new URLSearchParams()

      if (state) {
        params.set("state", state)
      }

      // Appeler l'API Supabase OAuth pour generer le code d'autorisation
      const { data, error: authError } = await supabase.auth.getSession()

      if (authError || !data.session) {
        throw new Error("Session invalide")
      }

      // Dans une vraie implementation, vous genereriez un code d'autorisation
      // via l'API Supabase OAuth Server
      // Pour l'instant, on simule avec un token
      params.set("code", "oauth_code_" + Date.now())

      const finalRedirectUri = `${redirectUri}?${params.toString()}`
      window.location.href = finalRedirectUri
    } catch (err: any) {
      console.error("Erreur autorisation:", err)
      setError(err.message || "Erreur lors de l'autorisation")
      setSubmitting(false)
    }
  }

  const handleDeny = () => {
    if (!redirectUri) {
      router.push("/dashboard")
      return
    }

    const params = new URLSearchParams()
    params.set("error", "access_denied")
    params.set("error_description", "L'utilisateur a refuse l'autorisation")
    if (state) {
      params.set("state", state)
    }

    window.location.href = `${redirectUri}?${params.toString()}`
  }

  const toggleScope = (scopeId: string) => {
    const scope = AVAILABLE_SCOPES.find((s) => s.id === scopeId)
    if (scope?.required) return

    setSelectedScopes((prev) => (prev.includes(scopeId) ? prev.filter((s) => s !== scopeId) : [...prev, scopeId]))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  if (error && !app) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>Erreur d'autorisation</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/dashboard">Retour au tableau de bord</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          {/* Logo PorkyFarm */}
          <div className="mx-auto mb-4">
            <Image src="/pig-logo.png" alt="PorkyFarm" width={48} height={48} className="mx-auto" />
          </div>

          <CardTitle className="text-xl">Autoriser l'acces</CardTitle>
          <CardDescription>
            <span className="font-semibold text-foreground">{app?.name}</span> souhaite acceder a votre compte PorkyFarm
          </CardDescription>

          {app?.website && <p className="text-xs text-muted-foreground mt-1">{app.website}</p>}
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Utilisateur connecte */}
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">{user?.email}</p>
              <p className="text-xs text-muted-foreground">Compte PorkyFarm</p>
            </div>
          </div>

          <Separator />

          {/* Permissions demandees */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Permissions demandees</span>
            </div>

            <div className="space-y-2">
              {AVAILABLE_SCOPES.filter((s) => requestedScopes.includes(s.id)).map((scope) => (
                <div
                  key={scope.id}
                  className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    id={scope.id}
                    checked={selectedScopes.includes(scope.id)}
                    onCheckedChange={() => toggleScope(scope.id)}
                    disabled={scope.required}
                  />
                  <div className="flex-1">
                    <Label htmlFor={scope.id} className="text-sm font-medium cursor-pointer flex items-center gap-2">
                      {scope.icon}
                      {scope.name}
                      {scope.required && <span className="text-xs text-muted-foreground">(requis)</span>}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">{scope.description}</p>
                  </div>
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg text-destructive text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button onClick={handleAuthorize} disabled={submitting} className="w-full">
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Autorisation...
              </>
            ) : (
              "Autoriser"
            )}
          </Button>

          <Button variant="outline" onClick={handleDeny} disabled={submitting} className="w-full bg-transparent">
            Refuser
          </Button>

          <p className="text-xs text-center text-muted-foreground mt-2">
            En autorisant, vous acceptez les{" "}
            <Link href="/legal/terms" className="underline hover:text-foreground">
              conditions d'utilisation
            </Link>{" "}
            de PorkyFarm
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

export default function OAuthConsentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <OAuthConsentContent />
    </Suspense>
  )
}
