"use client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Camera, MapPin, Calendar, Edit } from "lucide-react"
import { useAuthContext } from "@/contexts/auth-context"

export function ProfileHeader() {
  const { profile } = useAuthContext()

  return (
    <Card className="relative overflow-hidden shadow-md">
      {/* Cover Image */}
      <div className="h-32 bg-gradient-to-r from-primary to-primary/70 md:h-48" />

      <div className="relative px-6 pb-6">
        {/* Avatar */}
        <div className="absolute -top-12 left-6 md:-top-16">
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-card bg-primary text-3xl font-bold text-primary-foreground shadow-lg md:h-32 md:w-32 md:text-4xl">
              {profile?.full_name?.charAt(0).toUpperCase() || "U"}
            </div>
            <button className="absolute bottom-0 right-0 rounded-full bg-primary p-2 text-primary-foreground shadow-lg">
              <Camera className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="pt-14 md:pt-20">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{profile?.full_name || "Utilisateur"}</h1>
              <p className="text-muted-foreground">{profile?.farm_name || "Éleveur porcin"}</p>
              <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {profile?.location || "Côte d'Ivoire"}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Membre depuis 2024
                </span>
              </div>
            </div>
            <Button variant="outline" className="gap-2 bg-transparent">
              <Edit className="h-4 w-4" />
              Modifier le profil
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
