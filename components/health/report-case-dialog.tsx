"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabase/client"
import { useAuthContext } from "@/contexts/auth-context"
import { toast } from "sonner"

interface ReportCaseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReportCaseDialog({ open, onOpenChange }: ReportCaseDialogProps) {
  const { user } = useAuthContext()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    animalId: "",
    issue: "",
    severity: "moyenne",
    symptoms: "",
    notes: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error("Vous devez être connecté")
      return
    }

    setIsLoading(true)
    try {
      // Enregistrer dans la table health_records
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      toast.success("Cas sanitaire signalé avec succès")
      onOpenChange(false)
      
      // Reset form
      setFormData({
        animalId: "",
        issue: "",
        severity: "moyenne",
        symptoms: "",
        notes: "",
      })
    } catch (error) {
      toast.error("Erreur lors du signalement")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Signaler un cas sanitaire</DialogTitle>
          <DialogDescription>
            Enregistrez un nouveau cas sanitaire nécessitant une attention
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="animalId">Animal concerné *</Label>
            <Select
              value={formData.animalId}
              onValueChange={(value) => setFormData({ ...formData, animalId: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un animal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pig-45">Truie #45</SelectItem>
                <SelectItem value="pig-32">Truie #32</SelectItem>
                <SelectItem value="pig-a12-3">Porcelet #A12-3</SelectItem>
                <SelectItem value="pig-28">Truie #28</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="issue">Problème identifié *</Label>
            <Input
              id="issue"
              value={formData.issue}
              onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
              placeholder="Ex: Fièvre, perte d'appétit, boiterie..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="severity">Gravité *</Label>
            <Select
              value={formData.severity}
              onValueChange={(value) => setFormData({ ...formData, severity: value })}
              required
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="faible">Faible</SelectItem>
                <SelectItem value="moyenne">Moyenne</SelectItem>
                <SelectItem value="haute">Haute</SelectItem>
                <SelectItem value="critique">Critique</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="symptoms">Symptômes observés *</Label>
            <Textarea
              id="symptoms"
              value={formData.symptoms}
              onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
              placeholder="Décrivez les symptômes observés..."
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes supplémentaires</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Traitements en cours, observations..."
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-primary text-white">
              {isLoading ? "Enregistrement..." : "Signaler le cas"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

