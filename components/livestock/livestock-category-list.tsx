"use client"

import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreVertical, Eye, Edit, Trash2, Heart, Weight } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useApp } from "@/contexts/app-context"
import { useToast } from "@/hooks/use-toast"

interface LivestockCategoryListProps {
  category: "truie" | "verrat" | "porcelet"
}

export function LivestockCategoryList({ category }: LivestockCategoryListProps) {
  const router = useRouter()
  const { animals, deleteAnimal } = useApp()
  const { toast } = useToast()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const filteredAnimals = animals.filter((animal) => {
    if (category === "truie") return animal.category === "truie"
    if (category === "verrat") return animal.category === "verrat"
    if (category === "porcelet") return animal.category === "porcelet" || animal.category === "porc"
    return false
  })

  const handleDelete = (id: string) => {
    setDeleteId(id)
  }

  const confirmDelete = async () => {
    if (deleteId) {
      setIsDeleting(true)
      try {
        deleteAnimal(deleteId)
        toast({
          title: "Animal supprimé",
          description: "L'animal a été supprimé avec succès.",
        })
      } catch {
        toast({
          title: "Erreur",
          description: "Impossible de supprimer l'animal. Veuillez réessayer.",
          variant: "destructive",
        })
      } finally {
        setIsDeleting(false)
        setDeleteId(null)
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "gestante":
        return "bg-pink-500"
      case "allaitante":
        return "bg-purple-500"
      case "actif":
      case "reproducteur":
        return "bg-blue-500"
      case "sevrage":
        return "bg-green-500"
      case "sous traitement":
        return "bg-amber-500"
      default:
        return "bg-gray-500"
    }
  }

  if (filteredAnimals.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center p-12 text-center shadow-soft">
        <p className="text-lg font-medium text-muted-foreground">Aucun animal dans cette catégorie</p>
        <p className="mt-2 text-sm text-muted-foreground">Cliquez sur "Ajouter" pour commencer</p>
      </Card>
    )
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredAnimals.map((animal) => (
          <Card key={animal.id} className="group overflow-hidden shadow-soft transition hover:shadow-lg">
            <div className="relative">
              <img
                src={animal.photo || "/placeholder.svg?height=192&width=256&query=pig"}
                alt={animal.name || animal.identifier}
                className="h-48 w-full object-cover transition group-hover:scale-105"
              />
              <div className="absolute left-3 top-3 flex gap-2">
                <Badge className={`${getStatusColor(animal.status)} text-white`}>{animal.status || "Actif"}</Badge>
              </div>
              <div className="absolute right-3 top-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-white/90">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => router.push(`/dashboard/livestock/${animal.id}`)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Voir détails
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push(`/dashboard/livestock/${animal.id}?edit=true`)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Modifier
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(animal.id)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">{animal.name || animal.identifier}</h3>
                  <p className="text-sm text-muted-foreground">
                    {animal.breed} •{" "}
                    {animal.birthDate
                      ? `Ne le ${new Date(animal.birthDate).toLocaleDateString("fr-FR")}`
                      : "Age inconnu"}
                  </p>
                </div>
                <div className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-1">
                  <Heart className="h-3 w-3 text-green-600" />
                  <span className="text-xs font-medium text-green-600">OK</span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Weight className="h-4 w-4" />
                  {animal.weight ? `${animal.weight} kg` : "Poids non renseigné"}
                </div>
              </div>

              <Link href={`/dashboard/livestock/${animal.id}`}>
                <Button variant="outline" className="mt-4 w-full bg-transparent">
                  Voir le profil
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cet animal ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
