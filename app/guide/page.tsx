import Link from "next/link"
import { ArrowLeft, BookOpen, Video, FileText, HelpCircle, CheckCircle2, Play, ChevronRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function GuidePage() {
  const quickStartSteps = [
    {
      step: 1,
      title: "Créez votre compte",
      description: "Inscrivez-vous gratuitement avec votre email et configurez votre profil d'éleveur.",
    },
    {
      step: 2,
      title: "Ajoutez vos animaux",
      description: "Enregistrez vos truies, verrats et porcelets avec leurs informations de base.",
    },
    {
      step: 3,
      title: "Suivez la santé",
      description: "Enregistrez les vaccinations, traitements et signalements de maladies.",
    },
    {
      step: 4,
      title: "Gérez la reproduction",
      description: "Planifiez les saillies et suivez les gestations avec des alertes automatiques.",
    },
    {
      step: 5,
      title: "Optimisez l'alimentation",
      description: "Utilisez le calculateur de rations pour optimiser les coûts et la croissance.",
    },
  ]

  const videoTutorials = [
    { title: "Prise en main de PorkyFarm", duration: "5:30", category: "Débutant" },
    { title: "Gestion du cheptel", duration: "8:15", category: "Intermédiaire" },
    { title: "Suivi sanitaire avancé", duration: "12:00", category: "Avancé" },
    { title: "Assistant IA - Conseils personnalisés", duration: "6:45", category: "Nouveau" },
  ]

  const docSections = [
    { title: "Tableau de bord", description: "Vue d'ensemble de votre élevage" },
    { title: "Gestion du cheptel", description: "Ajouter, modifier, supprimer des animaux" },
    { title: "Module santé", description: "Vaccinations, traitements, maladies" },
    { title: "Reproduction", description: "Saillies, gestations, mise-bas" },
    { title: "Alimentation", description: "Calcul des rations, gestion des stocks" },
    { title: "Assistant IA", description: "Conseils et recommandations" },
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

        {/* Navigation cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-16">
          {[
            {
              icon: BookOpen,
              title: "Démarrage rapide",
              description: "Les bases en 10 minutes",
              anchor: "#quick-start",
            },
            { icon: Video, title: "Tutoriels vidéo", description: "Guides pas à pas", anchor: "#videos" },
            { icon: FileText, title: "Documentation", description: "Guide complet", anchor: "#docs" },
            { icon: HelpCircle, title: "FAQ", description: "Questions fréquentes", anchor: "/faq" },
          ].map((guide, i) => (
            <Link key={i} href={guide.anchor}>
              <Card className="h-full hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer">
                <CardHeader>
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <guide.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{guide.title}</CardTitle>
                  <CardDescription>{guide.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick Start Section */}
        <section id="quick-start" className="mb-16 scroll-mt-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Guide de démarrage rapide</h2>
              <p className="text-muted-foreground">5 étapes pour bien commencer</p>
            </div>
          </div>

          <div className="space-y-4">
            {quickStartSteps.map((item) => (
              <Card key={item.step} className="overflow-hidden">
                <CardContent className="flex items-start gap-4 p-6">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white font-bold">
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                  <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0" />
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-6 text-center">
            <Link href="/auth/register">
              <Button size="lg" className="gap-2">
                Commencer maintenant
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Video Tutorials Section */}
        <section id="videos" className="mb-16 scroll-mt-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-xl bg-red-500 flex items-center justify-center">
              <Video className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Tutoriels vidéo</h2>
              <p className="text-muted-foreground">Apprenez visuellement</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {videoTutorials.map((video, i) => (
              <Card key={i} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                <CardContent className="p-0">
                  <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <div className="h-16 w-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="h-8 w-8 text-primary ml-1" />
                    </div>
                    <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {video.duration}
                    </span>
                    <span className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded">
                      {video.category}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold">{video.title}</h3>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="text-center text-muted-foreground mt-6">Plus de tutoriels vidéo seront ajoutés prochainement</p>
        </section>

        {/* Documentation Section */}
        <section id="docs" className="mb-16 scroll-mt-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-xl bg-blue-500 flex items-center justify-center">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Documentation complète</h2>
              <p className="text-muted-foreground">Tout sur chaque fonctionnalité</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {docSections.map((doc, i) => (
              <Card key={i} className="hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    {doc.title}
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </CardTitle>
                  <CardDescription>{doc.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* Help Section */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="flex flex-col md:flex-row items-center justify-between gap-6 p-8">
            <div>
              <h3 className="text-xl font-bold mb-2">Besoin d'aide supplémentaire ?</h3>
              <p className="text-muted-foreground">
                Notre équipe de support est disponible pour répondre à toutes vos questions.
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/faq">
                <Button variant="outline">Voir la FAQ</Button>
              </Link>
              <Link href="/support">
                <Button>Contacter le support</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
