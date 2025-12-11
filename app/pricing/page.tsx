import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Check, ArrowLeft } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Tarifs - PorkyFarm",
  description: "Decouvrez nos plans tarifaires simples et transparents pour la gestion de votre elevage porcin.",
}

const PLANS = [
  {
    name: "Gratuit",
    price: "0",
    description: "Pour debuter et tester l'application",
    features: ["Jusqu'a 20 animaux", "Suivi sanitaire basique", "Calendrier des taches", "Support par email"],
    cta: "Commencer gratuitement",
    href: "/auth/register",
  },
  {
    name: "Pro",
    price: "15,000",
    description: "Pour les eleveurs professionnels",
    features: [
      "Animaux illimites",
      "Suivi sanitaire complet",
      "Gestion financiere avancee",
      "Assistant IA",
      "Rapports detailles",
      "Support prioritaire 24/7",
    ],
    cta: "Essai gratuit 30 jours",
    href: "/auth/register",
    popular: true,
  },
  {
    name: "Entreprise",
    price: "Sur devis",
    description: "Pour les grandes exploitations",
    features: [
      "Tout du plan Pro",
      "Multi-fermes",
      "API personnalisee",
      "Formation sur site",
      "Gestionnaire de compte dedie",
      "Personnalisation complete",
    ],
    cta: "Nous contacter",
    href: "mailto:contact@porkyfarm.app",
  },
] as const

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" />
          Retour a l'accueil
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Tarifs simples et transparents</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choisissez le plan qui correspond a la taille de votre elevage
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {PLANS.map((plan, i) => (
            <div
              key={i}
              className={`relative rounded-2xl p-8 ${
                plan.popular ? "bg-primary text-primary-foreground shadow-xl scale-105" : "bg-card border border-border"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground px-4 py-1 rounded-full text-sm font-medium">
                  Plus populaire
                </div>
              )}
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.price !== "Sur devis" && <span className="text-sm"> FCFA/mois</span>}
              </div>
              <p className={`mb-6 ${plan.popular ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                {plan.description}
              </p>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-3">
                    <Check className={`h-5 w-5 flex-shrink-0 ${plan.popular ? "" : "text-primary"}`} />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href={plan.href} className="block">
                <Button
                  className={`w-full ${
                    plan.popular ? "bg-white text-primary hover:bg-white/90" : "bg-primary text-primary-foreground"
                  }`}
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
