"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus, Camera, Stethoscope, FileText } from "lucide-react"

export function DashboardQuickActions() {
  return (
    <div className="flex flex-wrap gap-2">
      <Link href="/dashboard/livestock/add">
        <Button className="gap-2 bg-primary text-white hover:bg-primary-dark">
          <Plus className="h-4 w-4" />
          Ajouter animal
        </Button>
      </Link>
      <Link href="/dashboard/livestock/add">
        <Button variant="outline" className="gap-2 bg-transparent">
          <Camera className="h-4 w-4" />
          Prendre photo
        </Button>
      </Link>
      <Link href="/dashboard/health">
        <Button variant="outline" className="gap-2 bg-transparent">
          <Stethoscope className="h-4 w-4" />
          Signaler maladie
        </Button>
      </Link>
      <Link href="/dashboard/settings">
        <Button variant="outline" className="gap-2 bg-transparent">
          <FileText className="h-4 w-4" />
          Rapport
        </Button>
      </Link>
    </div>
  )
}
