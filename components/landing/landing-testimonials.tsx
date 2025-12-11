"use client"

import { useState, useEffect, useCallback, memo } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Star, Quote, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

const TESTIMONIALS = [
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
] as const

const FEATURES = [
  "Module vétérinaire complet",
  "Suivi gestation J/114",
  "Calcul rations automatique",
  "Photos intégrées",
] as const

const StarRating = memo(function StarRating({ rating }: { rating: number }) {
  return (
    <div className="ml-auto flex gap-0.5" aria-label={`Note: ${rating} sur 5`}>
      {Array.from({ length: rating }).map((_, i) => (
        <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" aria-hidden="true" />
      ))}
    </div>
  )
})

export function LandingTestimonials() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  const next = useCallback(() => {
    setActiveIndex((i) => (i + 1) % TESTIMONIALS.length)
  }, [])

  const prev = useCallback(() => {
    setActiveIndex((i) => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)
  }, [])

  useEffect(() => {
    if (!isAutoPlaying) return
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [isAutoPlaying, next])

  const handleMouseEnter = useCallback(() => setIsAutoPlaying(false), [])
  const handleMouseLeave = useCallback(() => setIsAutoPlaying(true), [])

  const currentTestimonial = TESTIMONIALS[activeIndex]

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

        <div className="relative mt-12" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          <div className="overflow-hidden rounded-3xl bg-card p-8 shadow-soft md:p-12 min-h-[280px]">
            <Quote className="mb-4 h-10 w-10 text-primary/20" aria-hidden="true" />

            <p className="text-lg text-card-foreground md:text-xl min-h-[80px]">"{currentTestimonial.content}"</p>

            <div className="mt-8 flex items-center gap-4">
              <div className="relative h-14 w-14 shrink-0">
                <Image
                  src={currentTestimonial.image || "/placeholder.svg"}
                  alt={currentTestimonial.name}
                  fill
                  loading="lazy"
                  className="rounded-full object-cover ring-2 ring-primary/20"
                  sizes="56px"
                />
              </div>
              <div>
                <div className="font-semibold text-card-foreground">{currentTestimonial.name}</div>
                <div className="text-sm text-muted-foreground">{currentTestimonial.role}</div>
              </div>
              <StarRating rating={currentTestimonial.rating} />
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-6 flex justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-transparent hover:bg-primary/10 hover:border-primary"
              onClick={prev}
              aria-label="Témoignage précédent"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </Button>
            <div className="flex items-center gap-2" role="tablist" aria-label="Témoignages">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  className={`h-2 rounded-full transition-all ${
                    i === activeIndex ? "w-8 bg-primary" : "w-2 bg-border hover:bg-primary/50"
                  }`}
                  onClick={() => setActiveIndex(i)}
                  aria-label={`Témoignage ${i + 1}`}
                  aria-selected={i === activeIndex}
                  role="tab"
                />
              ))}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-transparent hover:bg-primary/10 hover:border-primary"
              onClick={next}
              aria-label="Témoignage suivant"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </Button>
          </div>
        </div>

        {/* Features checklist */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          {FEATURES.map((feature, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
