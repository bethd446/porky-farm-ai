import Link from "next/link"
import { ArrowLeft, BookOpen, Video, FileText, HelpCircle } from "lucide-react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function GuidePage() {
  const guides = [
    {
      icon: BookOpen,
      title: "Guide de démarrage rapide",
      description: "Apprenez les bases de PorkyFarm en 10 minutes",
      link: "#quick-start",
    },
    {
      icon: Video,
      title: "Tutoriels vidéo",
      description: "Vidéos pas à pas pour maîtriser chaque fonctionnalité",
      link: "#videos",
    },
    {
      icon: FileText,
      title: "Documentation complète",
      description: "Guide détaillé de toutes les fonctionnalités",
      link: "#docs",
    },
    {
      icon: HelpCircle,
      title: "FAQ",
      description: "Réponses aux questions les plus fréquentes",
      link: "/faq",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" />
          Retour à l'accueil
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Guide d'utilisation</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tout ce dont vous avez besoin pour maîtriser PorkyFarm
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12">
          {guides.map((guide, i) => (
            <Link key={i} href={guide.link}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <guide.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{guide.title}</CardTitle>
                  <CardDescription>{guide.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Contenu à venir</CardTitle>
            <CardDescription>
              Nous préparons des guides détaillés et des tutoriels vidéo pour vous aider à tirer le meilleur parti de
              PorkyFarm
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}
