"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bell,
  Globe,
  Lock,
  Palette,
  Save,
  Smartphone,
  Shield,
  Database,
  Loader2,
  CheckCircle,
  AlertCircle,
  Download,
  Trash2,
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useApp } from "@/contexts/app-context"

export default function SettingsPage() {
  const router = useRouter()
  const { animals, healthCases, gestations, activities } = useApp()

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    alerts: true,
    reports: true,
  })

  const [passwordForm, setPasswordForm] = useState({
    current: "",
    new: "",
    confirm: "",
  })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const [exportLoading, setExportLoading] = useState(false)
  const [backupLoading, setBackupLoading] = useState(false)
  const [lastBackup, setLastBackup] = useState("Jamais")

  const [theme, setTheme] = useState("light")
  const [language, setLanguage] = useState("fr")

  const [offlineMode, setOfflineMode] = useState(true)
  const [autoSync, setAutoSync] = useState(true)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem("porkyfarm-theme") || "light"
    const savedLanguage = localStorage.getItem("porkyfarm-language") || "fr"
    const savedLastBackup = localStorage.getItem("porkyfarm-last-backup")
    const savedNotifications = localStorage.getItem("porkyfarm-notifications")
    const savedOfflineMode = localStorage.getItem("porkyfarm-offline-mode")
    const savedAutoSync = localStorage.getItem("porkyfarm-auto-sync")

    setTheme(savedTheme)
    setLanguage(savedLanguage)
    if (savedLastBackup) setLastBackup(savedLastBackup)
    if (savedNotifications) setNotifications(JSON.parse(savedNotifications))
    if (savedOfflineMode !== null) setOfflineMode(savedOfflineMode === "true")
    if (savedAutoSync !== null) setAutoSync(savedAutoSync === "true")

    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [])

  const handlePasswordUpdate = async () => {
    if (passwordForm.new !== passwordForm.confirm) {
      setPasswordError("Les mots de passe ne correspondent pas")
      return
    }
    if (passwordForm.new.length < 8) {
      setPasswordError("Le mot de passe doit contenir au moins 8 caracteres")
      return
    }

    setPasswordLoading(true)
    setPasswordError(null)
    setPasswordSuccess(false)

    try {
      const { supabaseAuth } = await import("@/lib/supabase/client")
      const { error } = await supabaseAuth.updateUser({ password: passwordForm.new })

      if (error) {
        setPasswordError(error.message || "Erreur lors de la mise a jour du mot de passe")
        setPasswordLoading(false)
        return
      }

      setPasswordSuccess(true)
      setPasswordForm({ current: "", new: "", confirm: "" })
      setTimeout(() => setPasswordSuccess(false), 3000)
    } catch (err) {
      setPasswordError("Une erreur est survenue. Veuillez reessayer.")
      console.error("[Settings] handlePasswordUpdate error:", err)
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleExport = async () => {
    setExportLoading(true)

    await new Promise((resolve) => setTimeout(resolve, 500))

    const data = {
      exportDate: new Date().toISOString(),
      version: "1.0",
      animals: animals,
      healthCases: healthCases,
      gestations: gestations,
      activities: activities.slice(0, 100),
      statistics: {
        totalAnimals: animals.length,
        truies: animals.filter((a) => a.category === "truie").length,
        verrats: animals.filter((a) => a.category === "verrat").length,
        porcelets: animals.filter((a) => a.category === "porcelet").length,
        activeGestations: gestations.filter((g) => g.status === "active").length,
        activeHealthCases: healthCases.filter((hc) => hc.status === "open" || hc.status === "active").length,
      },
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `porkyfarm-export-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)

    setExportLoading(false)
  }

  const handleBackup = async () => {
    setBackupLoading(true)

    await new Promise((resolve) => setTimeout(resolve, 1500))

    const now = new Date().toLocaleString("fr-FR")
    setLastBackup(now)
    localStorage.setItem("porkyfarm-last-backup", now)

    setBackupLoading(false)
  }

  const handleDeleteAccount = async () => {
    // Clear all localStorage data
    localStorage.removeItem("porkyfarm_animals")
    localStorage.removeItem("porkyfarm_health_cases")
    localStorage.removeItem("porkyfarm_gestations")
    localStorage.removeItem("porkyfarm_vaccinations")
    localStorage.removeItem("porkyfarm_feeding_records")
    localStorage.removeItem("porkyfarm_activities")
    localStorage.removeItem("porkyfarm-theme")
    localStorage.removeItem("porkyfarm-language")
    localStorage.removeItem("porkyfarm-notifications")
    localStorage.removeItem("porkyfarm-last-backup")
    localStorage.removeItem("porkyfarm-offline-mode")
    localStorage.removeItem("porkyfarm-auto-sync")
    localStorage.removeItem("porkyfarm-user-profile")

    // Redirect to home
    window.location.href = "/"
  }

  const handleThemeChange = (value: string) => {
    setTheme(value)
    localStorage.setItem("porkyfarm-theme", value)

    if (value === "dark") {
      document.documentElement.classList.add("dark")
    } else if (value === "light") {
      document.documentElement.classList.remove("dark")
    } else {
      // System preference
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
      }
    }
  }

  const handleLanguageChange = (value: string) => {
    setLanguage(value)
    localStorage.setItem("porkyfarm-language", value)
  }

  const handleNotificationChange = (key: keyof typeof notifications, checked: boolean) => {
    const updated = { ...notifications, [key]: checked }
    setNotifications(updated)
    localStorage.setItem("porkyfarm-notifications", JSON.stringify(updated))
  }

  const handleOfflineModeChange = (checked: boolean) => {
    setOfflineMode(checked)
    localStorage.setItem("porkyfarm-offline-mode", String(checked))
  }

  const handleAutoSyncChange = (checked: boolean) => {
    setAutoSync(checked)
    localStorage.setItem("porkyfarm-auto-sync", String(checked))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Parametres</h1>
        <p className="text-muted-foreground">Configurez votre application PorkyFarm</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="general" className="gap-2">
            <Globe className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Lock className="h-4 w-4" />
            Securite
          </TabsTrigger>
          <TabsTrigger value="data" className="gap-2">
            <Database className="h-4 w-4" />
            Donnees
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                Apparence
              </CardTitle>
              <CardDescription>Personnalisez l'apparence de votre application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Theme</Label>
                  <p className="text-sm text-muted-foreground">Choisissez votre theme prefere</p>
                </div>
                <Select value={theme} onValueChange={handleThemeChange}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Clair</SelectItem>
                    <SelectItem value="dark">Sombre</SelectItem>
                    <SelectItem value="system">Systeme</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Langue</Label>
                  <p className="text-sm text-muted-foreground">Langue de l'interface</p>
                </div>
                <Select value={language} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">Francais</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-primary" />
                Application Mobile
              </CardTitle>
              <CardDescription>Parametres de l'application mobile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Mode hors-ligne</Label>
                  <p className="text-sm text-muted-foreground">Accedez aux donnees sans connexion</p>
                </div>
                <Switch checked={offlineMode} onCheckedChange={handleOfflineModeChange} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Synchronisation automatique</Label>
                  <p className="text-sm text-muted-foreground">Sync des donnees en arriere-plan</p>
                </div>
                <Switch checked={autoSync} onCheckedChange={handleAutoSyncChange} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Preferences de notification
              </CardTitle>
              <CardDescription>Gerez vos notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Notifications par email</Label>
                  <p className="text-sm text-muted-foreground">Recevez les alertes par email</p>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={(checked) => handleNotificationChange("email", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Notifications push</Label>
                  <p className="text-sm text-muted-foreground">Alertes sur votre appareil</p>
                </div>
                <Switch
                  checked={notifications.push}
                  onCheckedChange={(checked) => handleNotificationChange("push", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Alertes sanitaires</Label>
                  <p className="text-sm text-muted-foreground">Alertes de sante urgentes</p>
                </div>
                <Switch
                  checked={notifications.alerts}
                  onCheckedChange={(checked) => handleNotificationChange("alerts", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Rapports hebdomadaires</Label>
                  <p className="text-sm text-muted-foreground">Resume de la semaine</p>
                </div>
                <Switch
                  checked={notifications.reports}
                  onCheckedChange={(checked) => handleNotificationChange("reports", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Securite du compte
              </CardTitle>
              <CardDescription>Gerez la securite de votre compte</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {passwordSuccess && (
                <div className="flex items-center gap-2 rounded-lg bg-primary/10 p-3 text-sm text-primary">
                  <CheckCircle className="h-4 w-4" />
                  Mot de passe mis a jour avec succes !
                </div>
              )}
              {passwordError && (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {passwordError}
                </div>
              )}

              <div className="space-y-2">
                <Label>Mot de passe actuel</Label>
                <Input
                  type="password"
                  placeholder="********"
                  value={passwordForm.current}
                  onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Nouveau mot de passe</Label>
                <Input
                  type="password"
                  placeholder="********"
                  value={passwordForm.new}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Confirmer le mot de passe</Label>
                <Input
                  type="password"
                  placeholder="********"
                  value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                />
              </div>
              <Button
                className="gap-2 bg-primary text-white hover:bg-primary/90"
                onClick={handlePasswordUpdate}
                disabled={passwordLoading || !passwordForm.current || !passwordForm.new || !passwordForm.confirm}
              >
                {passwordLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Mettre a jour le mot de passe
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Authentification a deux facteurs</CardTitle>
              <CardDescription>Ajoutez une couche de securite supplementaire</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Activer 2FA</Label>
                  <p className="text-sm text-muted-foreground">Utilisez une app d'authentification</p>
                </div>
                <Switch checked={twoFactorEnabled} onCheckedChange={setTwoFactorEnabled} />
              </div>
              {twoFactorEnabled && (
                <p className="mt-3 text-sm text-amber-600">Note: La 2FA sera disponible dans une prochaine version.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                Gestion des donnees
              </CardTitle>
              <CardDescription>Exportez ou supprimez vos donnees</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted p-4 mb-4">
                <p className="text-sm text-muted-foreground mb-2">Donnees stockees localement :</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span>{animals.length} animaux</span>
                  <span>{healthCases.length} cas sanitaires</span>
                  <span>{gestations.length} gestations</span>
                  <span>{activities.length} activites</span>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <Label>Exporter les donnees</Label>
                  <p className="text-sm text-muted-foreground">Telechargez toutes vos donnees (JSON)</p>
                </div>
                <Button
                  variant="outline"
                  className="bg-transparent gap-2"
                  onClick={handleExport}
                  disabled={exportLoading}
                >
                  {exportLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  Exporter
                </Button>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <Label>Sauvegarder</Label>
                  <p className="text-sm text-muted-foreground">Derniere sauvegarde : {lastBackup}</p>
                </div>
                <Button
                  variant="outline"
                  className="bg-transparent gap-2"
                  onClick={handleBackup}
                  disabled={backupLoading}
                >
                  {backupLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Sauvegarder maintenant
                </Button>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-destructive/50 bg-destructive/5 p-4">
                <div>
                  <Label className="text-destructive">Supprimer toutes les donnees</Label>
                  <p className="text-sm text-muted-foreground">Cette action est irreversible</p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="gap-2">
                      <Trash2 className="h-4 w-4" />
                      Supprimer
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Etes-vous sur ?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Cette action est irreversible. Toutes vos donnees seront definitivement supprimees, incluant{" "}
                        {animals.length} animaux, {healthCases.length} cas sanitaires et {gestations.length} gestations.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Supprimer toutes mes donnees
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
