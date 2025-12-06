import { Stethoscope, Baby, Calculator, Brain, Camera, BarChart3, MapPin, Bell } from "lucide-react"

const features = [
  {
    icon: Stethoscope,
    title: "Module Vétérinaire",
    description: "Enregistrez les maladies, traitements et vaccinations avec photos et détails en temps réel.",
    color: "bg-red-500",
  },
  {
    icon: Baby,
    title: "Suivi Gestation",
    description: "Suivez chaque truie gestante, de la saillie jusqu'à la mise-bas et le sevrage des porcelets.",
    color: "bg-pink-500",
  },
  {
    icon: Calculator,
    title: "Calcul des Rations",
    description: "Optimisez l'alimentation avec des formules adaptées à chaque stade de croissance.",
    color: "bg-amber-500",
  },
  {
    icon: Brain,
    title: "Assistant IA",
    description: "Obtenez des conseils personnalisés et des prédictions basées sur vos données d'élevage.",
    color: "bg-purple-500",
  },
  {
    icon: Camera,
    title: "Capture Photo",
    description: "Documentez l'état de santé et la croissance de vos animaux avec des photos horodatées.",
    color: "bg-blue-500",
  },
  {
    icon: BarChart3,
    title: "Tableau de Bord",
    description: "Visualisez les performances de votre élevage avec des statistiques claires et des graphiques.",
    color: "bg-green-500",
  },
  {
    icon: MapPin,
    title: "Géolocalisation",
    description: "Localisez vos bâtiments et parcelles pour une gestion optimale de votre exploitation.",
    color: "bg-cyan-500",
  },
  {
    icon: Bell,
    title: "Alertes & Rappels",
    description: "Recevez des notifications pour les vaccinations, mise-bas prévues et traitements.",
    color: "bg-orange-500",
  },
]

export function LandingFeatures() {
  return (
    <section id="features" className="py-20 px-4 md:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            Fonctionnalités
          </span>
          <h2 className="mt-4 text-balance text-3xl font-bold text-foreground md:text-5xl">
            Tout ce dont vous avez besoin
            <span className="block text-primary">pour gérer votre élevage</span>
          </h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            Une suite complète d'outils conçus spécialement pour les éleveurs porcins
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-2xl bg-card p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className={`mb-4 inline-flex rounded-xl ${feature.color} p-3`}>
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-card-foreground">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/5 transition-transform group-hover:scale-150" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
