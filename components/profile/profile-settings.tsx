"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Bell, Mail, Smartphone, Shield } from "lucide-react"

export function ProfileSettings() {
  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="text-base font-medium">Paramètres rapides</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-muted p-2">
              <Bell className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <Label className="text-sm font-medium">Notifications push</Label>
              <p className="text-xs text-muted-foreground">Alertes en temps réel</p>
            </div>
          </div>
          <Switch defaultChecked />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-muted p-2">
              <Mail className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <Label className="text-sm font-medium">Emails quotidiens</Label>
              <p className="text-xs text-muted-foreground">Résumé journalier</p>
            </div>
          </div>
          <Switch defaultChecked />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-muted p-2">
              <Smartphone className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <Label className="text-sm font-medium">SMS d'urgence</Label>
              <p className="text-xs text-muted-foreground">Alertes critiques</p>
            </div>
          </div>
          <Switch />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-muted p-2">
              <Shield className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <Label className="text-sm font-medium">Double authentification</Label>
              <p className="text-xs text-muted-foreground">Sécurité renforcée</p>
            </div>
          </div>
          <Switch defaultChecked />
        </div>
      </CardContent>
    </Card>
  )
}
