"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Star, Quote, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

const testimonials = [
  {
    name: "Kouamé Y.",
    role: "Éleveur à Bouaké",
    image: "/african-farmer-man-portrait-smiling.jpg",
    content:
      "Le suivi de gestation est incroyable. Je sais exactement quand chaque truie va mettre bas et je peux me préparer.",
    rating: 5,
  },
  {
    name: "Aminata K.",
    role: "Propriétaire de ferme à Abidjan",
    image: "/african-woman-farmer-portrait.jpg",
    content:
      "Le calculateur de rations m'aide à optimiser l'alimentation. J'ai une meilleure visibilité sur mes coûts.",
    rating: 5,
  },
  {
    name: "Jean-Baptiste D.",
    role: "Technicien d'élevage",
    image: "/african-veterinarian-man-professional.jpg",
    content:
      "Le module sanitaire avec les photos est très pratique pour documenter l'évolution des cas et partager avec le vétérinaire.",
    rating: 5,
  },
]

export function LandingTestimonials() {
  const [activeIndex, setActiveIndex] = useState(0)

  const next = () => setActiveIndex((i) => (i + 1) % testimonials.length)
  const prev = () => setActiveIndex((i) => (i - 1 + testimonials.length) % testimonials.length)

  return (
    <section id="testimonials" className="bg-muted py-20 px-4 md:py-32">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            Retours utilisateurs
          </span>
          <h2 className="mt-4 text-balance text-3xl font-bold text-foreground md:text-4xl">
            Ce que disent nos utilisateurs
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Témoignages représentatifs des retours de nos premiers utilisateurs
          </p>
        </div>

        <div className="relative mt-12">
          <div className="overflow-hidden rounded-3xl bg-card p-8 shadow-soft md:p-12">
            <Quote className="mb-4 h-10 w-10 text-primary/20" />

            <p className="text-lg text-card-foreground md:text-xl">"{testimonials[activeIndex].content}"</p>

            <div className="mt-8 flex items-center gap-4">
              <img
                src={testimonials[activeIndex].image || "/placeholder.svg"}
                alt={testimonials[activeIndex].name}
                className="h-14 w-14 rounded-full object-cover"
              />
              <div>
                <div className="font-semibold text-card-foreground">{testimonials[activeIndex].name}</div>
                <div className="text-sm text-muted-foreground">{testimonials[activeIndex].role}</div>
              </div>
              <div className="ml-auto flex gap-0.5">
                {Array.from({ length: testimonials[activeIndex].rating }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-center gap-2">
            <Button variant="outline" size="icon" className="rounded-full bg-transparent" onClick={prev}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  className={`h-2 rounded-full transition-all ${
                    i === activeIndex ? "w-8 bg-primary" : "w-2 bg-border"
                  }`}
                  onClick={() => setActiveIndex(i)}
                />
              ))}
            </div>
            <Button variant="outline" size="icon" className="rounded-full bg-transparent" onClick={next}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            "Module vétérinaire complet",
            "Suivi gestation J/114",
            "Calcul rations automatique",
            "Photos intégrées",
          ].map((feature, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-primary shrink-0" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
