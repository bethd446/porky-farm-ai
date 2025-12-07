"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react"

const benefits = [
  "Essai gratuit de 30 jours",
  "Aucune carte bancaire requise",
  "Support en français",
  "Formation incluse",
]

export function LandingCTA() {
  return (
    <section className="relative overflow-hidden py-24 px-4 md:py-32">
      {/* Background with overlay */}
      <div className="absolute inset-0">
        <img
          src="/happy-pigs-in-modern-clean-farm-sunrise.jpg"
          alt="Porcs en bonne santé"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary-dark/90 to-emerald-900/95" />
      </div>

      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-4xl text-center">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm border border-white/20">
          <Sparkles className="h-4 w-4 text-accent-light" />
          <span className="text-sm font-medium text-white">Offre de lancement</span>
        </div>

        <h2 className="text-balance text-3xl font-bold text-white md:text-5xl lg:text-6xl">
          Prêt à transformer
          <span className="block mt-2 text-accent-light">votre élevage ?</span>
        </h2>
        <p className="mt-6 text-pretty text-lg text-white/80 md:text-xl max-w-2xl mx-auto">
          Rejoignez plus de 500 éleveurs ivoiriens qui font confiance à PorkyFarm pour gérer leur exploitation.
        </p>

        {/* Benefits grid */}
        <div className="mt-10 grid grid-cols-2 gap-4 max-w-lg mx-auto md:flex md:flex-wrap md:justify-center md:gap-6 md:max-w-none">
          {benefits.map((benefit, i) => (
            <div
              key={i}
              className="flex items-center gap-2 text-white bg-white/10 rounded-full px-4 py-2 backdrop-blur-sm"
            >
              <CheckCircle2 className="h-5 w-5 text-accent-light shrink-0" />
              <span className="text-sm font-medium">{benefit}</span>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link href="/auth/register">
            <Button
              size="lg"
              className="group h-14 gap-3 rounded-full bg-white px-8 text-lg text-primary hover:bg-white/90 shadow-xl shadow-black/20 transition-all hover:scale-105"
            >
              Créer mon compte gratuit
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button
              size="lg"
              variant="outline"
              className="h-14 rounded-full border-white/30 bg-white/10 px-8 text-lg text-white hover:bg-white/20 backdrop-blur-sm"
            >
              J'ai déjà un compte
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
