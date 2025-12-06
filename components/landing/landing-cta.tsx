import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle2 } from "lucide-react"

const benefits = [
  "Essai gratuit de 30 jours",
  "Aucune carte bancaire requise",
  "Support en français",
  "Formation incluse",
]

export function LandingCTA() {
  return (
    <section className="relative overflow-hidden py-20 px-4 md:py-32">
      <div className="absolute inset-0">
        <img src="/happy-pigs-in-modern-clean-farm-sunrise.jpg" alt="Porcs en bonne santé" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 to-primary-dark/90" />
      </div>

      <div className="relative mx-auto max-w-4xl text-center">
        <h2 className="text-balance text-3xl font-bold text-white md:text-5xl">Prêt à transformer votre élevage ?</h2>
        <p className="mt-4 text-pretty text-lg text-white/80">
          Rejoignez plus de 500 éleveurs ivoiriens qui font confiance à PorkyFarm
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          {benefits.map((benefit, i) => (
            <div key={i} className="flex items-center gap-2 text-white">
              <CheckCircle2 className="h-5 w-5 text-accent-light" />
              <span className="text-sm">{benefit}</span>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <Link href="/auth/register">
            <Button
              size="lg"
              className="group h-14 gap-2 rounded-full bg-white px-8 text-lg text-primary hover:bg-white/90"
            >
              Créer mon compte gratuit
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
