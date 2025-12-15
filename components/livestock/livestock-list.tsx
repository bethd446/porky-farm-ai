"use client"

import type React from "react"

import Link from "next/link"
import Image from "next/image"
import { useState, memo, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "@/contexts/app-context"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreVertical, Eye, Edit, Trash2, Heart, Weight, Loader2, DollarSign, Plus } from "lucide-react"
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
import type { Animal } from "@/lib/storage/local-database"
import { getStatusColor, getHealthScore, getCategoryLabel, getAge } from "@/lib/utils/animal-helpers"

interface AnimalCardProps {
  animal: Animal
  onDelete: (id: string) => void
  onSell: (id: string) => void
}

const AnimalCard = memo(function AnimalCard({ animal, onDelete, onSell }: AnimalCardProps) {
  const router = useRouter()
  const healthScore = getHealthScore(animal.healthStatus)

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.closest("[data-action-zone]")) {
      e.stopPropagation()
      return
    }
    router.push(`/dashboard/livestock/${animal.id}`)
  }

  return (
    <Card
      className="group overflow-hidden shadow-soft card-clickable focus-ring"
      onClick={handleCardClick}
      tabIndex={0}
      role="article"
      aria-label={`Fiche de ${animal.name}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          router.push(`/dashboard/livestock/${animal.id}`)
        }
      }}
    >
      <div className="relative">
        <Image
          src={animal.photo || "/placeholder.svg?height=192&width=256&query=pig farm"}
          alt={animal.name}
          width={256}
          height={192}
          className="h-48 w-full object-cover transition group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute left-3 top-3 flex gap-2">
          <Badge className={`${getStatusColor(animal.status)} text-white`}>
            {animal.status === "actif" ? "Actif" : animal.status}
          </Badge>
          <Badge variant="secondary" className="bg-black/50 text-white">
            {getCategoryLabel(animal.category)}
          </Badge>
        </div>
        <div className="absolute right-3 top-3" data-action-zone>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="h-10 w-10 rounded-full bg-white/90 tap-target"
                aria-label="Actions pour cet animal"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/dashboard/livestock/${animal.id}`)} className="tap-target">
                <Eye className="mr-2 h-4 w-4" />
                Voir details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push(`/dashboard/livestock/${animal.id}?edit=true`)}
                className="tap-target"
              >
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSell(animal.id)} className="tap-target">
                <DollarSign className="mr-2 h-4 w-4" />
                Marquer vendu
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive tap-target" onClick={() => onDelete(animal.id)}>
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
              {animal.breed || "Race inconnue"} - {getAge(animal.birthDate)}
            </p>
          </div>
          <div
            className={`flex items-center gap-1 rounded-full px-2 py-1 ${healthScore >= 80 ? "bg-success-light" : healthScore >= 60 ? "bg-warning-light" : "bg-destructive-light"}`}
          >
            <Heart
              className={`h-3 w-3 ${healthScore >= 80 ? "text-success" : healthScore >= 60 ? "text-warning" : "text-destructive"}`}
            />
            <span
              className={`text-xs font-medium ${healthScore >= 80 ? "text-success" : healthScore >= 60 ? "text-warning" : "text-destructive"}`}
            >
              {healthScore}%
            </span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Weight className="h-4 w-4" />
            {animal.weight ? `${animal.weight} kg` : "Non renseigne"}
          </div>
          <span className="text-xs text-muted-foreground">ID: {animal.identifier}</span>
        </div>

        <div className="mt-4" data-action-zone>
          <Button
            variant="outline"
            className="w-full bg-transparent tap-target"
            onClick={(e) => {
              e.stopPropagation()
              router.push(`/dashboard/livestock/${animal.id}`)
            }}
          >
            Voir le profil complet
          </Button>
        </div>
      </div>
    </Card>
  )
})

const ITEMS_PER_PAGE = 12

export function LivestockList() {
  const { animals, deleteAnimal, sellAnimal, isLoading } = useApp()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [sellDialogOpen, setSellDialogOpen] = useState(false)
  const [animalToDelete, setAnimalToDelete] = useState<string | null>(null)
  const [animalToSell, setAnimalToSell] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [page, setPage] = useState(1)

  const activeAnimals = useMemo(() => animals.filter((a) => a.status === "actif" || a.status === "malade"), [animals])

  const totalPages = useMemo(() => Math.ceil(activeAnimals.length / ITEMS_PER_PAGE), [activeAnimals.length])

  const paginatedAnimals = useMemo(
    () => activeAnimals.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE),
    [activeAnimals, page],
  )

  const handleDelete = useCallback((id: string) => {
    setAnimalToDelete(id)
    setDeleteDialogOpen(true)
  }, [])

  const handleSell = useCallback((id: string) => {
    setAnimalToSell(id)
    setSellDialogOpen(true)
  }, [])

  const confirmDelete = useCallback(() => {
    if (animalToDelete) {
      setIsProcessing(true)
      deleteAnimal(animalToDelete)
      setIsProcessing(false)
      setDeleteDialogOpen(false)
      setAnimalToDelete(null)
    }
  }, [animalToDelete, deleteAnimal])

  const confirmSell = useCallback(() => {
    if (animalToSell) {
      setIsProcessing(true)
      sellAnimal(animalToSell)
      setIsProcessing(false)
      setSellDialogOpen(false)
      setAnimalToSell(null)
    }
  }, [animalToSell, sellAnimal])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Chargement du cheptel...</span>
      </div>
    )
  }

  if (activeAnimals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border py-12 text-center">
        <p className="text-base font-medium text-foreground">Aucun animal enregistre</p>
        <p className="text-sm text-muted-foreground mt-2 max-w-md">
          Commencez par enregistrer votre premier animal pour suivre son poids, sa sante et ses performances.
        </p>
        <Link href="/dashboard/livestock/add">
          <Button className="mt-4 gap-2">
            <Plus className="h-4 w-4" />
            Enregistrer mon premier animal
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {paginatedAnimals.map((animal) => (
          <AnimalCard key={animal.id} animal={animal} onDelete={handleDelete} onSell={handleSell} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            Page precedente
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
            Page suivante
          </Button>
        </div>
      )}

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Etes-vous sur de vouloir supprimer cet animal ? Cette action est irreversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isProcessing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isProcessing ? (
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

      {/* Sell Dialog */}
      <AlertDialog open={sellDialogOpen} onOpenChange={setSellDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la vente</AlertDialogTitle>
            <AlertDialogDescription>
              Voulez-vous marquer cet animal comme vendu ? Il ne sera plus visible dans la liste active.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSell} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Traitement...
                </>
              ) : (
                "Confirmer la vente"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
