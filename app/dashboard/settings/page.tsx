"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, Globe, Lock, Palette, Save, Smartphone, Shield, Database } from 'lucide-react'

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    alerts: true,
    reports: true,
  })

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
                <Select defaultValue="light">
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
                <Select defaultValue="fr">
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
                  onCheckedChange={(checked) => setNotifications({...notifications, email: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Notifications push</Label>
                  <p className="text-sm text-muted-foreground">Alertes sur votre appareil</p>
                </div>
                <Switch 
                  checked={notifications.push}
                  onCheckedChange={(checked) => setNotifications({...notifications, push: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Alertes sanitaires</Label>
                  <p className="text-sm text-muted-foreground">Alertes de santé urgentes</p>
                </div>
                <Switch 
                  checked={notifications.alerts}
                  onCheckedChange={(checked) => setNotifications({...notifications, alerts: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Rapports hebdomadaires</Label>
                  <p className="text-sm text-muted-foreground">Résumé de la semaine</p>
                </div>
                <Switch 
                  checked={notifications.reports}
                  onCheckedChange={(checked) => setNotifications({...notifications, reports: checked})}
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
              <div className="space-y-2">
                <Label>Mot de passe actuel</Label>
                <Input type="password" placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <Label>Nouveau mot de passe</Label>
                <Input type="password" placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <Label>Confirmer le mot de passe</Label>
                <Input type="password" placeholder="••••••••" />
              </div>
              <Button className="gap-2 bg-primary text-white hover:bg-primary/90">
                <Save className="h-4 w-4" />
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
                  <p className="text-sm text-muted-foreground">Téléchargez toutes vos données (CSV/Excel)</p>
                </div>
                <Button variant="outline" className="bg-transparent">Exporter</Button>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <Label>Sauvegarder</Label>
                  <p className="text-sm text-muted-foreground">Dernière sauvegarde : il y a 2 heures</p>
                </div>
                <Button variant="outline" className="bg-transparent">Sauvegarder maintenant</Button>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-destructive/50 bg-destructive/5 p-4">
                <div>
                  <Label className="text-destructive">Supprimer le compte</Label>
                  <p className="text-sm text-muted-foreground">Cette action est irréversible</p>
                </div>
                <Button variant="destructive">Supprimer</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
