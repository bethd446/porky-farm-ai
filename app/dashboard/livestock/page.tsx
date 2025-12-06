import { LivestockList } from "@/components/livestock/livestock-list"
import { LivestockFilters } from "@/components/livestock/livestock-filters"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default function LivestockPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestion du Cheptel</h1>
          <p className="text-muted-foreground">Gérez tous vos animaux en un seul endroit</p>
        </div>
        <Link href="/dashboard/livestock/add">
          <Button className="gap-2 bg-primary text-white hover:bg-primary-dark">
            <Plus className="h-4 w-4" />
            Ajouter un animal
          </Button>
        </Link>
      </div>

      <LivestockFilters />
      <LivestockList />
    </div>
  )
}
