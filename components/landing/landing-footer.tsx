import Link from "next/link"
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react"

export function LandingFooter() {
  return (
    <footer className="bg-foreground px-4 py-16 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
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
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-primary"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="mb-4 font-semibold">Produit</h4>
            <ul className="space-y-3 text-sm text-white/60">
              <li>
                <Link href="#" className="hover:text-white">
                  Fonctionnalités
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white">
                  Tarifs
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white">
                  Témoignages
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold">Ressources</h4>
            <ul className="space-y-3 text-sm text-white/60">
              <li>
                <Link href="#" className="hover:text-white">
                  Guide d'utilisation
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white">
                  Webinaires
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white">
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
                <MapPin className="h-4 w-4" />
                Abidjan, Côte d'Ivoire
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                +225 07 00 00 00 00
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                contact@porkyfarm.ci
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 md:flex-row">
          <p className="text-sm text-white/40">© 2025 PorkyFarm. Tous droits réservés.</p>
          <div className="flex gap-6 text-sm text-white/40">
            <Link href="#" className="hover:text-white">
              Confidentialité
            </Link>
            <Link href="#" className="hover:text-white">
              Conditions
            </Link>
            <Link href="#" className="hover:text-white">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
