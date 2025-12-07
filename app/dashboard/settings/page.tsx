"use client"

import { useState } from "react"
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
import { supabase } from "@/lib/supabase/client"

export default function SettingsPage() {
  const router = useRouter()
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
  const [lastBackup, setLastBackup] = useState("il y a 2 heures")

  const [theme, setTheme] = useState("light")
  const [language, setLanguage] = useState("fr")

  const handlePasswordUpdate = async () => {
    if (passwordForm.new !== passwordForm.confirm) {
      setPasswordError("Les mots de passe ne correspondent pas")
      return
    }
    if (passwordForm.new.length < 8) {
      setPasswordError("Le mot de passe doit contenir au moins 8 caractères")
      return
    }

    setPasswordLoading(true)
    setPasswordError(null)

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.new,
      })

      if (error) {
        setPasswordError(error.message)
      } else {
        setPasswordSuccess(true)
        setPasswordForm({ current: "", new: "", confirm: "" })
        setTimeout(() => setPasswordSuccess(false), 3000)
      }
    } catch {
      setPasswordError("Une erreur est survenue")
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleExport = async () => {
    setExportLoading(true)

    // Simulate export - in real app, would fetch data and create CSV
    setTimeout(() => {
      const data = {
        exportDate: new Date().toISOString(),
        animals: [],
        healthRecords: [],
        gestations: [],
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `porkyfarm-export-${new Date().toISOString().split("T")[0]}.json`
      a.click()
      URL.revokeObjectURL(url)

      setExportLoading(false)
    }, 1500)
  }

  const handleBackup = async () => {
    setBackupLoading(true)

    // Simulate backup
    setTimeout(() => {
      setLastBackup("à l'instant")
      setBackupLoading(false)
    }, 2000)
  }

  const handleDeleteAccount = async () => {
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  const handleThemeChange = (value: string) => {
    setTheme(value)
    localStorage.setItem("porkyfarm-theme", value)
    // In real app, would apply theme to document
  }

  const handleLanguageChange = (value: string) => {
    setLanguage(value)
    localStorage.setItem("porkyfarm-language", value)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Paramètres</h1>
        <p className="text-muted-foreground">Configurez votre application PorkyFarm</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="general" className="gap-2">
            <Globe className="h-4 w-4" />
            Général
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Lock className="h-4 w-4" />
            Sécurité
          </TabsTrigger>
          <TabsTrigger value="data" className="gap-2">
            <Database className="h-4 w-4" />
            Données
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
                  <Label>Thème</Label>
                  <p className="text-sm text-muted-foreground">Choisissez votre thème préféré</p>
                </div>
                <Select value={theme} onValueChange={handleThemeChange}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Clair</SelectItem>
                    <SelectItem value="dark">Sombre</SelectItem>
                    <SelectItem value="system">Système</SelectItem>
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
                    <SelectItem value="fr">Français</SelectItem>
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
              <CardDescription>Paramètres de l'application mobile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Mode hors-ligne</Label>
                  <p className="text-sm text-muted-foreground">Accédez aux données sans connexion</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Synchronisation automatique</Label>
                  <p className="text-sm text-muted-foreground">Sync des données en arrière-plan</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Préférences de notification
              </CardTitle>
              <CardDescription>Gérez vos notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Notifications par email</Label>
                  <p className="text-sm text-muted-foreground">Recevez les alertes par email</p>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Notifications push</Label>
                  <p className="text-sm text-muted-foreground">Alertes sur votre appareil</p>
                </div>
                <Switch
                  checked={notifications.push}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, push: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Alertes sanitaires</Label>
                  <p className="text-sm text-muted-foreground">Alertes de santé urgentes</p>
                </div>
                <Switch
                  checked={notifications.alerts}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, alerts: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Rapports hebdomadaires</Label>
                  <p className="text-sm text-muted-foreground">Résumé de la semaine</p>
                </div>
                <Switch
                  checked={notifications.reports}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, reports: checked })}
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
                Sécurité du compte
              </CardTitle>
              <CardDescription>Gérez la sécurité de votre compte</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {passwordSuccess && (
                <div className="flex items-center gap-2 rounded-lg bg-primary/10 p-3 text-sm text-primary">
                  <CheckCircle className="h-4 w-4" />
                  Mot de passe mis à jour avec succès !
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
                  placeholder="••••••••"
                  value={passwordForm.current}
                  onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Nouveau mot de passe</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={passwordForm.new}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Confirmer le mot de passe</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
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
                Mettre à jour le mot de passe
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Authentification à deux facteurs</CardTitle>
              <CardDescription>Ajoutez une couche de sécurité supplémentaire</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Activer 2FA</Label>
                  <p className="text-sm text-muted-foreground">Utilisez une app d'authentification</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                Gestion des données
              </CardTitle>
              <CardDescription>Exportez ou supprimez vos données</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <Label>Exporter les données</Label>
                  <p className="text-sm text-muted-foreground">Téléchargez toutes vos données (JSON)</p>
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
                  <p className="text-sm text-muted-foreground">Dernière sauvegarde : {lastBackup}</p>
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
                  <Label className="text-destructive">Supprimer le compte</Label>
                  <p className="text-sm text-muted-foreground">Cette action est irréversible</p>
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
                      <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Cette action est irréversible. Toutes vos données seront définitivement supprimées.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Supprimer mon compte
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
