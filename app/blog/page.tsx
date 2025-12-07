import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" />
          Retour à l'accueil
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Blog PorkyFarm</h1>
          <p className="text-lg text-muted-foreground">Conseils et actualités pour l'élevage porcin en Côte d'Ivoire</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Articles à venir</CardTitle>
            <CardDescription>
              Nous préparons des articles sur les bonnes pratiques d'élevage, la santé animale, et l'actualité du
              secteur porcin ivoirien
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}
