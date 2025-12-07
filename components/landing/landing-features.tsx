import { Stethoscope, Baby, Calculator, Brain, Camera, BarChart3, CloudSun, Bell } from "lucide-react"
import { iconColors, typography, spacing, cardStyles } from "@/lib/design-system"

const features = [
  {
    icon: Stethoscope,
    title: "Module Vétérinaire",
    description: "Enregistrez les cas sanitaires avec photos, suivez les traitements et marquez les résolutions.",
    colorClass: iconColors.health,
  },
  {
    icon: Baby,
    title: "Suivi Gestation",
    description: "Suivez chaque gestation avec calcul automatique du terme (114 jours) et progression visuelle.",
    colorClass: iconColors.reproduction,
  },
  {
    icon: Calculator,
    title: "Calcul des Rations",
    description: "Calculez les besoins alimentaires par catégorie et stade avec estimation des coûts en FCFA.",
    colorClass: iconColors.feeding,
  },
  {
    icon: Brain,
    title: "Assistant IA",
    description: "Posez vos questions sur l'alimentation, la santé et la reproduction de votre élevage.",
    colorClass: iconColors.ai,
  },
  {
    icon: Camera,
    title: "Capture Photo",
    description: "Documentez vos animaux et cas sanitaires avec des photos depuis votre téléphone.",
    colorClass: iconColors.photo,
  },
  {
    icon: BarChart3,
    title: "Tableau de Bord",
    description: "Visualisez vos statistiques d'élevage avec des graphiques clairs et des alertes.",
    colorClass: iconColors.stats,
  },
  {
    icon: CloudSun,
    title: "Météo Locale",
    description: "Consultez la météo de votre région pour adapter vos pratiques d'élevage.",
    colorClass: iconColors.weather,
  },
  {
    icon: Bell,
    title: "Alertes Intégrées",
    description: "Recevez des alertes dans l'app pour les mise-bas proches et cas sanitaires urgents.",
    colorClass: iconColors.alerts,
  },
]

export function LandingFeatures() {
  return (
    <section id="features" className={spacing.section}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            Fonctionnalités
          </span>
          <h2 className={`mt-4 text-balance ${typography.h2} text-foreground`}>
            Tout ce dont vous avez besoin
            <span className="block text-primary">pour gérer votre élevage</span>
          </h2>
          <p className={`mt-4 text-pretty ${typography.body} text-muted-foreground max-w-2xl mx-auto`}>
            Une suite complète d'outils conçus spécialement pour les éleveurs porcins
          </p>
        </div>

        <div className="mt-12 md:mt-16 grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <div key={i} className={`group relative overflow-hidden ${cardStyles.interactive} p-5 sm:p-6`}>
              <div className={`mb-4 inline-flex rounded-xl p-3 ${feature.colorClass}`}>
                <feature.icon className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <h3 className={`mb-2 ${typography.h5} text-card-foreground`}>{feature.title}</h3>
              <p className={typography.bodySmall + " text-muted-foreground"}>{feature.description}</p>
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/5 transition-transform group-hover:scale-150" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
