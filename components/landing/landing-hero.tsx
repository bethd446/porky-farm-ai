"use client"

import type React from "react"
import { useState, useEffect, useCallback, memo } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Menu, X, ArrowRight, Sparkles, Shield, TrendingUp, Heart, ChevronDown } from "lucide-react"

const NavLink = memo(function NavLink({
  href,
  children,
  onClick,
}: {
  href: string
  children: React.ReactNode
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void
}) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="text-sm font-medium text-white/80 transition hover:text-white relative group cursor-pointer"
    >
      {children}
      <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-primary transition-all group-hover:w-full" />
    </a>
  )
})

const FEATURE_PILLS = [
  { icon: Shield, text: "Suivi Sanitaire", color: "from-blue-500 to-blue-600" },
  { icon: Heart, text: "Bien-etre Animal", color: "from-pink-500 to-rose-500" },
  { icon: TrendingUp, text: "Gestion Simplifiee", color: "from-emerald-500 to-green-600" },
] as const

export function LandingHero() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleMobileNavClick = useCallback(() => {
    setMobileMenuOpen(false)
  }, [])

  const handleAnchorClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault()
      const element = document.querySelector(href)
      if (element) {
        element.scrollIntoView({ behavior: "smooth" })
      }
      setMobileMenuOpen(false)
    }
  }, [])

  return (
    <section className="relative min-h-[100dvh] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/modern-pig-farm-aerial-view-green-fields-sunset-iv.jpg"
          alt="Ferme porcine moderne"
          fill
          priority
          quality={85}
          sizes="100vw"
          className="object-cover object-[center_30%]"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkLzYvLy02LjY2OjY2Nj5AOkJCQDpOT05OWlpaWlpaWlpaWlr/2wBDAR"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
      </div>

      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 px-4 py-4 transition-all duration-300 md:px-8 ${
          scrolled ? "bg-black/80 backdrop-blur-xl shadow-lg" : ""
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/30 transition-transform group-hover:scale-105">
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="currentColor" aria-hidden="true">
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
            <NavLink href="#features" onClick={(e) => handleAnchorClick(e, "#features")}>
              Fonctionnalites
            </NavLink>
            <NavLink href="#testimonials" onClick={(e) => handleAnchorClick(e, "#testimonials")}>
              Temoignages
            </NavLink>
            <Link
              href="/pricing"
              className="text-sm font-medium text-white/80 transition hover:text-white relative group"
            >
              Tarifs
              <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-primary transition-all group-hover:w-full" />
            </Link>
            <Link
              href="/support"
              className="text-sm font-medium text-white/80 transition hover:text-white relative group"
            >
              Contact
              <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-primary transition-all group-hover:w-full" />
            </Link>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Link href="/auth/login">
              <Button
                variant="outline"
                className="h-11 border-white/30 bg-white/10 text-white hover:bg-white/20 hover:border-white/50 backdrop-blur-sm"
              >
                Connexion
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button className="h-11 bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/30">
                Commencer gratuitement
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="rounded-xl p-2.5 text-white bg-white/10 backdrop-blur-sm md:hidden hover:bg-white/20 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="absolute left-4 right-4 top-full mt-2 rounded-2xl bg-black/90 backdrop-blur-xl p-6 md:hidden border border-white/10 shadow-2xl animate-in slide-in-from-top-2">
            <div className="flex flex-col gap-2">
              <a
                href="#features"
                onClick={(e) => handleAnchorClick(e, "#features")}
                className="rounded-xl px-4 py-3 text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                Fonctionnalites
              </a>
              <a
                href="#testimonials"
                onClick={(e) => handleAnchorClick(e, "#testimonials")}
                className="rounded-xl px-4 py-3 text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                Temoignages
              </a>
              <Link
                href="/pricing"
                onClick={handleMobileNavClick}
                className="rounded-xl px-4 py-3 text-white hover:bg-white/10 transition-colors"
              >
                Tarifs
              </Link>
              <Link
                href="/support"
                onClick={handleMobileNavClick}
                className="rounded-xl px-4 py-3 text-white hover:bg-white/10 transition-colors"
              >
                Contact
              </Link>
              <hr className="my-2 border-white/10" />
              <Link href="/auth/login" onClick={handleMobileNavClick} className="w-full">
                <Button
                  variant="outline"
                  className="w-full h-12 border-white/30 text-white hover:bg-white/10 bg-transparent"
                >
                  Connexion
                </Button>
              </Link>
              <Link href="/auth/register" onClick={handleMobileNavClick} className="w-full">
                <Button className="w-full h-12 bg-primary text-white shadow-lg">Commencer gratuitement</Button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-center px-4 sm:px-6 pt-20 pb-12 text-center">
        {/* Badge */}
        <div className="mb-6 sm:mb-8 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 sm:px-5 py-2 sm:py-2.5 backdrop-blur-sm border border-white/20">
          <Sparkles className="h-4 w-4 text-accent-light" aria-hidden="true" />
          <span className="text-xs sm:text-sm font-medium text-white">Application de gestion d'elevage porcin</span>
        </div>

        {/* Title */}
        <h1 className="max-w-4xl text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white">
          Gerez votre elevage
          <span className="block mt-2 bg-gradient-to-r from-primary via-primary-light to-accent-light bg-clip-text text-transparent">
            en toute simplicite
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 sm:mt-8 max-w-2xl text-base sm:text-lg md:text-xl text-white/80 leading-relaxed px-2">
          Suivi sanitaire, gestion des reproductions, calcul des rations alimentaires - tout en une seule application
          simple et intuitive.
        </p>

        {/* CTA Button */}
        <div className="mt-8 sm:mt-12 px-4 sm:px-0">
          <Link href="/auth/register">
            <Button
              size="lg"
              className="group h-12 sm:h-14 gap-3 rounded-full bg-primary px-6 sm:px-8 text-base sm:text-lg text-white hover:bg-primary-dark shadow-xl shadow-primary/30"
            >
              Commencer gratuitement
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Button>
          </Link>
        </div>

        {/* Feature Pills */}
        <div className="mt-10 sm:mt-14 flex flex-wrap justify-center gap-3 sm:gap-4 px-2">
          {FEATURE_PILLS.map((item, i) => (
            <div
              key={i}
              className="group flex items-center gap-2 sm:gap-3 rounded-full bg-white/10 px-4 sm:px-5 py-2.5 sm:py-3 backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-colors cursor-default"
            >
              <div
                className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-gradient-to-br ${item.color}`}
              >
                <item.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" aria-hidden="true" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-white">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 z-10 -translate-x-1/2 animate-bounce hidden sm:block">
        <a
          href="#stats"
          onClick={(e) => handleAnchorClick(e, "#stats")}
          className="flex flex-col items-center gap-2 group cursor-pointer"
        >
          <span className="text-xs font-medium uppercase tracking-wider text-white/60 group-hover:text-white/80 transition-colors">
            Defiler pour explorer
          </span>
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/10 backdrop-blur-sm group-hover:bg-white/20 transition-colors">
            <ChevronDown className="h-5 w-5 text-white" aria-hidden="true" />
          </div>
        </a>
      </div>
    </section>
  )
}
