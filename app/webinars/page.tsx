import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Card } from "@/components/ui/card"

export default function WebinarsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" />
          Retour à l'accueil
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Webinaires</h1>
          <p className="text-lg text-muted-foreground">Formations en ligne pour maîtriser l'élevage porcin moderne</p>
        </div>

        <Card className="p-8 text-center">
          <h3 className="text-xl font-bold mb-2">Webinaires à venir</h3>
          <p className="text-muted-foreground">
            Nous préparons des sessions de formation en ligne. Inscrivez-vous pour être informé des prochaines dates.
          </p>
        </Card>
      </div>
    </div>
  )
}
