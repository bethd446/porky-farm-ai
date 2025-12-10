"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bell, Mail, Smartphone, Shield, CheckCircle, Send, Loader2, AlertCircle, RefreshCw } from "lucide-react"

interface ProfileSettingsState {
  pushNotifications: boolean
  dailyEmails: boolean
  smsAlerts: boolean
  twoFactor: boolean
  alertEmails: boolean
  emailAddress: string
}

const DEFAULT_SETTINGS: ProfileSettingsState = {
  pushNotifications: true,
  dailyEmails: true,
  smsAlerts: false,
  twoFactor: true,
  alertEmails: true,
  emailAddress: "",
}

export function ProfileSettings() {
  const [settings, setSettings] = useState<ProfileSettingsState>(DEFAULT_SETTINGS)
  const [showSaved, setShowSaved] = useState(false)
  const [testingEmail, setTestingEmail] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [emailServiceStatus, setEmailServiceStatus] = useState<"checking" | "ok" | "error" | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem("porkyfarm-profile-settings")
    if (saved) {
      setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) })
    }

    const profile = localStorage.getItem("porkyfarm-user-profile")
    if (profile) {
      const parsed = JSON.parse(profile)
      if (parsed.email) {
        setSettings((prev) => ({ ...prev, emailAddress: prev.emailAddress || parsed.email }))
      }
    }

    // Check email service status on mount
    checkEmailService()
  }, [])

  const checkEmailService = async () => {
    setEmailServiceStatus("checking")
    try {
      const response = await fetch("/api/email/test")
      const result = await response.json()
      setEmailServiceStatus(result.success ? "ok" : "error")
    } catch {
      setEmailServiceStatus("error")
    }
  }

  const handleToggle = (key: keyof ProfileSettingsState) => {
    if (key === "emailAddress") return

    const newSettings = { ...settings, [key]: !settings[key as keyof Omit<ProfileSettingsState, "emailAddress">] }
    setSettings(newSettings)
    localStorage.setItem("porkyfarm-profile-settings", JSON.stringify(newSettings))

    setShowSaved(true)
    setTimeout(() => setShowSaved(false), 2000)
  }

  const handleEmailChange = (email: string) => {
    const newSettings = { ...settings, emailAddress: email }
    setSettings(newSettings)
    localStorage.setItem("porkyfarm-profile-settings", JSON.stringify(newSettings))
    setTestResult(null)
  }

  const handleTestEmail = async () => {
    if (!settings.emailAddress) {
      setTestResult({ success: false, message: "Veuillez entrer une adresse email" })
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(settings.emailAddress)) {
      setTestResult({ success: false, message: "Format d'adresse email invalide" })
      return
    }

    setTestingEmail(true)
    setTestResult(null)

    try {
      const response = await fetch("/api/email/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: settings.emailAddress }),
      })

      const result = await response.json()

      if (result.success) {
        setTestResult({ success: true, message: "Email de test envoye ! Verifiez votre boite de reception." })
      } else {
        setTestResult({
          success: false,
          message: result.error || "Erreur lors de l'envoi. Verifiez votre adresse email.",
        })
      }
    } catch {
      setTestResult({ success: false, message: "Erreur de connexion. Verifiez votre connexion internet." })
    } finally {
      setTestingEmail(false)
    }
  }

  const settingsConfig = [
    {
      key: "alertEmails" as const,
      label: "Alertes par email",
      description: "Recevez les alertes critiques par email",
      icon: Mail,
    },
    {
      key: "dailyEmails" as const,
      label: "Resume quotidien",
      description: "Rapport journalier de votre elevage",
      icon: Mail,
    },
    {
      key: "pushNotifications" as const,
      label: "Notifications push",
      description: "Alertes en temps reel dans l'app",
      icon: Bell,
    },
    {
      key: "smsAlerts" as const,
      label: "SMS d'urgence",
      description: "Alertes critiques par SMS",
      icon: Smartphone,
    },
    {
      key: "twoFactor" as const,
      label: "Double authentification",
      description: "Securite renforcee",
      icon: Shield,
    },
  ]

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-medium">Parametres de notification</CardTitle>
            <CardDescription className="text-xs">Gerez vos preferences de communication</CardDescription>
          </div>
          {showSaved && (
            <span className="flex items-center gap-1 text-xs text-primary animate-in fade-in">
              <CheckCircle className="h-3 w-3" />
              Enregistre
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {emailServiceStatus === "error" && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm">
            <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-amber-800 font-medium">Service email en configuration</p>
              <p className="text-amber-600 text-xs">Les notifications par email seront disponibles prochainement.</p>
            </div>
            <Button variant="ghost" size="sm" onClick={checkEmailService}>
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>
        )}

        {/* Email configuration */}
        <div className="space-y-3 pb-4 border-b">
          <Label className="text-sm font-medium">Adresse email pour les notifications</Label>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="votre@email.com"
              value={settings.emailAddress}
              onChange={(e) => handleEmailChange(e.target.value)}
              className="flex-1"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleTestEmail}
              disabled={testingEmail || !settings.emailAddress || emailServiceStatus === "error"}
            >
              {testingEmail ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4 mr-1" />
                  Tester
                </>
              )}
            </Button>
          </div>
          {testResult && (
            <div
              className={`flex items-center gap-2 text-xs ${testResult.success ? "text-green-600" : "text-red-600"}`}
            >
              {testResult.success ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
              {testResult.message}
            </div>
          )}
        </div>

        {/* Notification toggles */}
        {settingsConfig.map((setting) => (
          <div key={setting.key} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-muted p-2">
                <setting.icon className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <Label className="text-sm font-medium">{setting.label}</Label>
                <p className="text-xs text-muted-foreground">{setting.description}</p>
              </div>
            </div>
            <Switch checked={settings[setting.key] as boolean} onCheckedChange={() => handleToggle(setting.key)} />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
