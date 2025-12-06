"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
import { Calendar } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { useAuthContext } from "@/contexts/auth-context"
import { toast } from "sonner"

interface NewBreedingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewBreedingDialog({ open, onOpenChange }: NewBreedingDialogProps) {
  const router = useRouter()
  const { user } = useAuthContext()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    sowId: "",
    boarId: "",
    breedingDate: new Date().toISOString().split("T")[0],
    method: "naturel",
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
      // Ici, vous pouvez enregistrer dans la table breeding_records
      // Pour l'instant, on simule juste une sauvegarde
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      toast.success("Nouvelle saillie enregistrée avec succès")
      onOpenChange(false)
      router.refresh()
      
      // Reset form
      setFormData({
        sowId: "",
        boarId: "",
        breedingDate: new Date().toISOString().split("T")[0],
        method: "naturel",
        notes: "",
      })
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nouvelle saillie</DialogTitle>
          <DialogDescription>
            Enregistrez une nouvelle saillie pour le suivi de la reproduction
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sowId">Truie *</Label>
              <Select
                value={formData.sowId}
                onValueChange={(value) => setFormData({ ...formData, sowId: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une truie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sow-32">Truie #32</SelectItem>
                  <SelectItem value="sow-18">Truie #18</SelectItem>
                  <SelectItem value="sow-45">Truie #45</SelectItem>
                  <SelectItem value="sow-51">Truie #51</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="boarId">Verrat *</Label>
              <Select
                value={formData.boarId}
                onValueChange={(value) => setFormData({ ...formData, boarId: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un verrat" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="boar-8">Verrat #8</SelectItem>
                  <SelectItem value="boar-5">Verrat #5</SelectItem>
                  <SelectItem value="boar-3">Verrat #3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="breedingDate">Date de saillie *</Label>
              <Input
                id="breedingDate"
                type="date"
                value={formData.breedingDate}
                onChange={(e) => setFormData({ ...formData, breedingDate: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="method">Méthode *</Label>
              <Select
                value={formData.method}
                onValueChange={(value) => setFormData({ ...formData, method: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="naturel">Naturel</SelectItem>
                  <SelectItem value="ia">Insémination Artificielle</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Observations, remarques..."
              rows={3}
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
              {isLoading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

