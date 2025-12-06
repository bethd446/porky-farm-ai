"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react"
import { Button } from "@/components/ui/button"

const testimonials = [
  {
    name: "Kouamé Yao",
    role: "Éleveur à Bouaké",
    image: "/african-farmer-man-portrait-smiling.jpg",
    content:
      "PorkyFarm a révolutionné ma façon de gérer mon élevage. Le suivi de gestation est incroyable, je ne perds plus aucun porcelet.",
    rating: 5,
  },
  {
    name: "Aminata Koné",
    role: "Propriétaire de ferme à Abidjan",
    image: "/african-woman-farmer-portrait.jpg",
    content:
      "L'assistant IA m'aide à prendre les bonnes décisions. Mes coûts d'alimentation ont baissé de 20% en 3 mois.",
    rating: 5,
  },
  {
    name: "Jean-Baptiste Diouf",
    role: "Vétérinaire conseil",
    image: "/african-veterinarian-man-professional.jpg",
    content:
      "En tant que vétérinaire, j'apprécie la qualité du module sanitaire. Les photos et l'historique médical sont très utiles.",
    rating: 5,
  },
]

export function LandingTestimonials() {
  const [activeIndex, setActiveIndex] = useState(0)

  const next = () => setActiveIndex((i) => (i + 1) % testimonials.length)
  const prev = () => setActiveIndex((i) => (i - 1 + testimonials.length) % testimonials.length)

  return (
    <section className="bg-muted py-20 px-4 md:py-32">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            Témoignages
          </span>
          <h2 className="mt-4 text-balance text-3xl font-bold text-foreground md:text-4xl">
            Ce que disent nos éleveurs
          </h2>
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
      </div>
    </section>
  )
}
