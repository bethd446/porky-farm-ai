"use client"

import Link from "next/link"

import { useState } from "react"

import { useRouter } from "next/navigation"
import { useLivestock } from "@/contexts/livestock-context"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreVertical, Eye, Edit, Trash2, Heart, Weight } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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

export function LivestockList() {
  const router = useRouter()
  const { animals, deleteAnimal } = useLivestock()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [animalToDelete, setAnimalToDelete] = useState<number | null>(null)

  const handleDelete = (id: number) => {
    setAnimalToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (animalToDelete) {
      deleteAnimal(animalToDelete)
      setDeleteDialogOpen(false)
      setAnimalToDelete(null)
    }
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {animals.map((animal) => (
          <Card key={animal.id} className="group overflow-hidden shadow-soft transition hover:shadow-lg">
            <div className="relative">
              <img
                src={animal.image || "/placeholder.svg"}
                alt={animal.name}
                className="h-48 w-full object-cover transition group-hover:scale-105"
              />
              <div className="absolute left-3 top-3 flex gap-2">
                <Badge className={`${animal.statusColor} text-white`}>{animal.status}</Badge>
                {animal.count && (
                  <Badge variant="secondary" className="bg-black/50 text-white">
                    {animal.count} têtes
                  </Badge>
                )}
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
                  <h3 className="font-semibold text-foreground">{animal.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {animal.breed} • {animal.age}
                  </p>
                </div>
                <div className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-1">
                  <Heart className="h-3 w-3 text-green-600" />
                  <span className="text-xs font-medium text-green-600">{animal.healthScore}%</span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Weight className="h-4 w-4" />
                  {animal.weight}
                </div>
                <span className="text-xs text-muted-foreground">{animal.nextEvent}</span>
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cet animal ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
