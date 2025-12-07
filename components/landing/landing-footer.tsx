"use client"

import type React from "react"

import Link from "next/link"
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, ArrowUpRight, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

export function LandingFooter() {
  const [email, setEmail] = useState("")
  const [subscribed, setSubscribed] = useState(false)

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setSubscribed(true)
      setEmail("")
      setTimeout(() => setSubscribed(false), 3000)
    }
  }

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("/#")) {
      e.preventDefault()
      const element = document.querySelector(href.substring(1))
      if (element) {
        element.scrollIntoView({ behavior: "smooth" })
      }
    }
  }

  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative bg-foreground text-white overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
      </div>

      {/* Newsletter Section */}
      <div className="relative border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold">Restez informé</h3>
              <p className="mt-1 text-white/60 text-sm">
                Recevez nos conseils d'élevage et les mises à jour de PorkyFarm
              </p>
            </div>
            <form onSubmit={handleNewsletterSubmit} className="flex w-full max-w-md gap-2">
              <Input
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-primary"
                required
              />
              <Button
                type="submit"
                className="h-12 px-6 bg-primary hover:bg-primary-dark transition-all hover:scale-105 active:scale-95"
                disabled={subscribed}
              >
                {subscribed ? "Inscrit !" : "S'inscrire"}
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid gap-10 sm:gap-12 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/30 transition-transform group-hover:scale-105">
                <svg viewBox="0 0 24 24" className="h-7 w-7 text-white" fill="currentColor">
                  <path d="M12 2C8.5 2 5.5 4.5 5.5 8c0 2.5 1.5 4.5 3.5 5.5v2c0 .5.5 1 1 1h4c.5 0 1-.5 1-1v-2c2-1 3.5-3 3.5-5.5 0-3.5-3-6-6.5-6z" />
                  <circle cx="9" cy="7" r="1.5" />
                  <circle cx="15" cy="7" r="1.5" />
                  <path d="M10 10h4c0 1-1 2-2 2s-2-1-2-2z" />
                </svg>
              </div>
              <span className="text-2xl font-bold">PorkyFarm</span>
            </Link>
            <p className="mt-4 text-sm text-white/60 max-w-xs leading-relaxed">
              La solution intelligente pour la gestion de votre élevage porcin. Conçue en Côte d'Ivoire, pour l'Afrique.
            </p>
            <div className="mt-6 flex gap-3">
              {[
                { Icon: Facebook, href: "https://facebook.com/porkyfarm", label: "Facebook" },
                { Icon: Twitter, href: "https://twitter.com/porkyfarm", label: "Twitter" },
                { Icon: Instagram, href: "https://instagram.com/porkyfarm", label: "Instagram" },
                { Icon: Youtube, href: "https://youtube.com/porkyfarm", label: "YouTube" },
              ].map(({ Icon, href, label }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-all hover:bg-primary hover:scale-110 active:scale-95"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Produit */}
          <div>
            <h4 className="mb-4 font-semibold text-white">Produit</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="/#features"
                  onClick={(e) => handleAnchorClick(e, "/#features")}
                  className="text-white/60 hover:text-white transition-colors inline-flex items-center gap-1 group cursor-pointer"
                >
                  Fonctionnalités
                  <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                </a>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-white/60 hover:text-white transition-colors inline-flex items-center gap-1 group"
                >
                  Tarifs
                  <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                </Link>
              </li>
              <li>
                <a
                  href="/#testimonials"
                  onClick={(e) => handleAnchorClick(e, "/#testimonials")}
                  className="text-white/60 hover:text-white transition-colors inline-flex items-center gap-1 group cursor-pointer"
                >
                  Témoignages
                  <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                </a>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-white/60 hover:text-white transition-colors inline-flex items-center gap-1 group"
                >
                  FAQ
                  <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Ressources */}
          <div>
            <h4 className="mb-4 font-semibold text-white">Ressources</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/guide"
                  className="text-white/60 hover:text-white transition-colors inline-flex items-center gap-1 group"
                >
                  Guide d'utilisation
                  <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-white/60 hover:text-white transition-colors inline-flex items-center gap-1 group"
                >
                  Blog
                  <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                </Link>
              </li>
              <li>
                <Link
                  href="/webinars"
                  className="text-white/60 hover:text-white transition-colors inline-flex items-center gap-1 group"
                >
                  Webinaires
                  <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                </Link>
              </li>
              <li>
                <Link
                  href="/support"
                  className="text-white/60 hover:text-white transition-colors inline-flex items-center gap-1 group"
                >
                  Support
                  <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 font-semibold text-white">Contact</h4>
            <ul className="space-y-3 text-sm text-white/60">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>Abidjan, Côte d'Ivoire</span>
              </li>
              <li>
                <a href="tel:+2250700000000" className="flex items-center gap-2 hover:text-white transition-colors">
                  <Phone className="h-4 w-4 flex-shrink-0" />
                  +225 07 00 00 00 00
                </a>
              </li>
              <li>
                <a
                  href="mailto:support@porkyfarm.app"
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  support@porkyfarm.app
                </a>
              </li>
            </ul>
            {/* CTA Button */}
            <Link href="/auth/register" className="mt-6 block">
              <Button className="w-full h-11 bg-primary hover:bg-primary-dark transition-all hover:scale-105 active:scale-95">
                Commencer gratuitement
              </Button>
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 md:flex-row">
          <p className="text-sm text-white/40 flex items-center gap-1">
            © {currentYear} PorkyFarm. Fait avec <Heart className="h-3 w-3 text-red-500 fill-red-500" /> en Côte
            d'Ivoire
          </p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm text-white/40">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Confidentialité
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Conditions
            </Link>
            <Link href="/cookies" className="hover:text-white transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
