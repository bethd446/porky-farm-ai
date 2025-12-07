import Link from "next/link"
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react"

export function LandingFooter() {
  return (
    <footer className="bg-foreground px-4 py-12 sm:py-16 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 sm:gap-12 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                <svg viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="currentColor">
                  <path d="M12 2C8.5 2 5.5 4.5 5.5 8c0 2.5 1.5 4.5 3.5 5.5v2c0 .5.5 1 1 1h4c.5 0 1-.5 1-1v-2c2-1 3.5-3 3.5-5.5 0-3.5-3-6-6.5-6z" />
                  <circle cx="9" cy="7" r="1.5" />
                  <circle cx="15" cy="7" r="1.5" />
                  <path d="M10 10h4c0 1-1 2-2 2s-2-1-2-2z" />
                </svg>
              </div>
              <span className="text-xl font-bold">PorkyFarm</span>
            </Link>
            <p className="mt-4 text-sm text-white/60">
              La solution intelligente pour la gestion de votre élevage porcin en Côte d'Ivoire.
            </p>
            <div className="mt-6 flex gap-4">
              {[
                { Icon: Facebook, href: "https://facebook.com/porkyfarm" },
                { Icon: Twitter, href: "https://twitter.com/porkyfarm" },
                { Icon: Instagram, href: "https://instagram.com/porkyfarm" },
                { Icon: Youtube, href: "https://youtube.com/porkyfarm" },
              ].map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-primary"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-4 font-semibold">Produit</h4>
            <ul className="space-y-3 text-sm text-white/60">
              <li>
                <Link href="/#features" className="hover:text-white transition-colors">
                  Fonctionnalités
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors">
                  Tarifs
                </Link>
              </li>
              <li>
                <Link href="/#testimonials" className="hover:text-white transition-colors">
                  Témoignages
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold">Ressources</h4>
            <ul className="space-y-3 text-sm text-white/60">
              <li>
                <Link href="/guide" className="hover:text-white transition-colors">
                  Guide d'utilisation
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/webinars" className="hover:text-white transition-colors">
                  Webinaires
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-white transition-colors">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 font-semibold">Contact</h4>
            <ul className="space-y-3 text-sm text-white/60">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                Abidjan, Côte d'Ivoire
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <a href="tel:+2250700000000" className="hover:text-white transition-colors">
                  +225 07 00 00 00 00
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <a href="mailto:contact@porkyfarm.app" className="hover:text-white transition-colors">
                  contact@porkyfarm.app
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 sm:mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 md:flex-row">
          <p className="text-sm text-white/40">© 2025 PorkyFarm. Tous droits réservés.</p>
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
