"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, memo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useLivestock } from "@/contexts/livestock-context"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreVertical, Eye, Edit, Trash2, Heart, Weight, Loader2 } from "lucide-react"
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
import type { Animal } from "@/contexts/livestock-context"

interface AnimalCardProps {
  animal: Animal
  onDelete: (id: string) => void
}

const AnimalCard = memo(function AnimalCard({ animal, onDelete }: AnimalCardProps) {
  const router = useRouter()

  return (
    <Card className="group overflow-hidden shadow-soft transition hover:shadow-lg">
      <div className="relative">
        <Image
          src={animal.image || animal.image_url || "/placeholder.svg?height=192&width=256&query=pig"}
          alt={animal.name}
          width={256}
          height={192}
          className="h-48 w-full object-cover transition group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute left-3 top-3 flex gap-2">
          <Badge className={`${animal.statusColor} text-white`}>{animal.status}</Badge>
          {animal.count && (
            <Badge variant="secondary" className="bg-black/50 text-white">
              {animal.count} tetes
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
                Voir details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/dashboard/livestock/${animal.id}?edit=true`)}>
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={() => onDelete(animal.id)}>
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
              {animal.breed} - {animal.age}
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
            {animal.weight ? `${animal.weight} kg` : "Non renseigne"}
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
  )
})

const ITEMS_PER_PAGE = 12

export function LivestockList() {
  const { animals, deleteAnimal, loading } = useLivestock()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [animalToDelete, setAnimalToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [page, setPage] = useState(1)

  const handleDelete = useCallback((id: string) => {
    setAnimalToDelete(id)
    setDeleteDialogOpen(true)
  }, [])

  const confirmDelete = useCallback(async () => {
    if (animalToDelete) {
      setIsDeleting(true)
      await deleteAnimal(animalToDelete)
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setAnimalToDelete(null)
    }
  }, [animalToDelete, deleteAnimal])

  const totalPages = Math.ceil(animals.length / ITEMS_PER_PAGE)
  const paginatedAnimals = animals.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Chargement du cheptel...</span>
      </div>
    )
  }

  if (animals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">Aucun animal enregistre pour le moment.</p>
        <Link href="/dashboard/livestock/add">
          <Button className="mt-4">Ajouter un animal</Button>
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {paginatedAnimals.map((animal) => (
          <AnimalCard key={animal.id} animal={animal} onDelete={handleDelete} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            Precedent
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} sur {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Suivant
          </Button>
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Etes-vous sur de vouloir supprimer cet animal ? Cette action est irreversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                "Supprimer"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
