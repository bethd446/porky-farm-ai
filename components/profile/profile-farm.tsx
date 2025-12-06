import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Home, Ruler, Thermometer } from "lucide-react"

export function ProfileFarm() {
  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="text-base font-medium">Ma ferme</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="aspect-video overflow-hidden rounded-xl">
          <img
            src="/placeholder.svg?height=300&width=500"
            alt="Vue de la ferme"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 rounded-xl bg-muted p-3">
            <MapPin className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium">Localisation</p>
              <p className="text-xs text-muted-foreground">Bouaké, RCI</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-muted p-3">
            <Home className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium">Bâtiments</p>
              <p className="text-xs text-muted-foreground">5 structures</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-muted p-3">
            <Ruler className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium">Superficie</p>
              <p className="text-xs text-muted-foreground">2.5 hectares</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-muted p-3">
            <Thermometer className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium">Climat</p>
              <p className="text-xs text-muted-foreground">Tropical humide</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
