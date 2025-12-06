import { LivestockCategoryList } from "@/components/livestock/livestock-category-list"
import { Button } from "@/components/ui/button"
import { Plus, ArrowLeft } from 'lucide-react'
import Link from "next/link"

export default function PigletsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/livestock">
            <Button variant="outline" size="icon" className="bg-transparent">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Porcelets</h1>
            <p className="text-muted-foreground">Gestion des porcelets et lots</p>
          </div>
        </div>
        <Link href="/dashboard/livestock/add?type=porcelet">
          <Button className="gap-2 bg-primary text-white hover:bg-primary/90">
            <Plus className="h-4 w-4" />
            Ajouter un lot
          </Button>
        </Link>
      </div>

      <LivestockCategoryList category="porcelet" />
    </div>
  )
}
