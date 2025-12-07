"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Bell, Mail, Smartphone, Shield, CheckCircle } from "lucide-react"

interface ProfileSettingsState {
  pushNotifications: boolean
  dailyEmails: boolean
  smsAlerts: boolean
  twoFactor: boolean
}

const DEFAULT_SETTINGS: ProfileSettingsState = {
  pushNotifications: true,
  dailyEmails: true,
  smsAlerts: false,
  twoFactor: true,
}

export function ProfileSettings() {
  const [settings, setSettings] = useState<ProfileSettingsState>(DEFAULT_SETTINGS)
  const [showSaved, setShowSaved] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("porkyfarm-profile-settings")
    if (saved) {
      setSettings(JSON.parse(saved))
    }
  }, [])

  const handleToggle = (key: keyof ProfileSettingsState) => {
    const newSettings = { ...settings, [key]: !settings[key] }
    setSettings(newSettings)
    localStorage.setItem("porkyfarm-profile-settings", JSON.stringify(newSettings))

    // Feedback visuel
    setShowSaved(true)
    setTimeout(() => setShowSaved(false), 2000)
  }

  const settingsConfig = [
    {
      key: "pushNotifications" as const,
      label: "Notifications push",
      description: "Alertes en temps reel",
      icon: Bell,
    },
    {
      key: "dailyEmails" as const,
      label: "Emails quotidiens",
      description: "Resume journalier",
      icon: Mail,
    },
    {
      key: "smsAlerts" as const,
      label: "SMS d'urgence",
      description: "Alertes critiques",
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
          <CardTitle className="text-base font-medium">Parametres rapides</CardTitle>
          {showSaved && (
            <span className="flex items-center gap-1 text-xs text-primary animate-in fade-in">
              <CheckCircle className="h-3 w-3" />
              Enregistre
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
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
            <Switch checked={settings[setting.key]} onCheckedChange={() => handleToggle(setting.key)} />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
