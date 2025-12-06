"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, ArrowRight, Sparkles, Shield, TrendingUp, Heart } from "lucide-react"

export function LandingHero() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img src="/modern-pig-farm-aerial-view-green-fields-sunset-iv.jpg" alt="Ferme porcine moderne" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 px-4 py-4 md:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="currentColor">
                <path d="M12 2C8.5 2 5.5 4.5 5.5 8c0 2.5 1.5 4.5 3.5 5.5v2c0 .5.5 1 1 1h4c.5 0 1-.5 1-1v-2c2-1 3.5-3 3.5-5.5 0-3.5-3-6-6.5-6z" />
                <circle cx="9" cy="7" r="1.5" />
                <circle cx="15" cy="7" r="1.5" />
                <path d="M10 10h4c0 1-1 2-2 2s-2-1-2-2z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-white">PorkyFarm</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-8 md:flex">
            <Link href="#features" className="text-sm font-medium text-white/80 transition hover:text-white">
              Fonctionnalités
            </Link>
            <Link href="#about" className="text-sm font-medium text-white/80 transition hover:text-white">
              À propos
            </Link>
            <Link href="#contact" className="text-sm font-medium text-white/80 transition hover:text-white">
              Contact
            </Link>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Link href="/auth/login">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                Connexion
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button className="bg-primary hover:bg-primary-dark text-white">Commencer</Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button className="rounded-lg p-2 text-white md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="absolute left-0 right-0 top-full glass-dark mt-2 mx-4 rounded-2xl p-4 md:hidden">
            <div className="flex flex-col gap-3">
              <Link href="#features" className="rounded-lg px-4 py-2 text-white hover:bg-white/10">
                Fonctionnalités
              </Link>
              <Link href="#about" className="rounded-lg px-4 py-2 text-white hover:bg-white/10">
                À propos
              </Link>
              <Link href="#contact" className="rounded-lg px-4 py-2 text-white hover:bg-white/10">
                Contact
              </Link>
              <hr className="border-white/20" />
              <Link href="/auth/login">
                <Button variant="ghost" className="w-full text-white hover:bg-white/10">
                  Connexion
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button className="w-full bg-primary text-white">Commencer gratuitement</Button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 flex min-h-[calc(100vh-80px)] flex-col items-center justify-center px-4 text-center">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
          <Sparkles className="h-4 w-4 text-accent-light" />
          <span className="text-sm font-medium text-white">Nouvelle version avec IA intégrée</span>
        </div>

        <h1 className="max-w-4xl text-balance text-4xl font-bold tracking-tight text-white md:text-6xl lg:text-7xl">
          La Nouvelle Ère de
          <span className="block text-primary-light">l'Élevage Porcin</span>
        </h1>

        <p className="mt-6 max-w-2xl text-pretty text-lg text-white/80 md:text-xl">
          PorkyFarm combine technologie intelligente et tradition pour améliorer l'efficacité, la durabilité et le
          bien-être de votre élevage. Conçu pour les éleveurs ivoiriens.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link href="/auth/register">
            <Button
              size="lg"
              className="group h-14 gap-2 rounded-full bg-primary px-8 text-lg text-white hover:bg-primary-dark"
            >
              Démarrer gratuitement
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="#features">
            <Button
              size="lg"
              variant="outline"
              className="h-14 rounded-full border-white/30 px-8 text-lg text-white hover:bg-white/10 bg-transparent"
            >
              Découvrir
            </Button>
          </Link>
        </div>

        {/* Feature Pills */}
        <div className="mt-12 flex flex-wrap justify-center gap-3">
          {[
            { icon: Shield, text: "Suivi Sanitaire" },
            { icon: Heart, text: "Bien-être Animal" },
            { icon: TrendingUp, text: "Gestion Financière" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
              <item.icon className="h-4 w-4 text-primary-light" />
              <span className="text-sm font-medium text-white">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2">
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wider text-white/60">Défiler pour explorer</span>
          <div className="h-12 w-6 rounded-full border-2 border-white/30 p-1">
            <div className="h-2 w-2 animate-bounce rounded-full bg-white" />
          </div>
        </div>
      </div>
    </section>
  )
}
