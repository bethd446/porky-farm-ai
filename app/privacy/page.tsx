import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" />
          Retour à l'accueil
        </Link>

        <h1 className="text-4xl font-bold mb-8">Politique de confidentialité</h1>

        <div className="prose prose-slate max-w-none">
          <p className="text-muted-foreground">Dernière mise à jour: Janvier 2025</p>

          <h2 className="text-2xl font-bold mt-8 mb-4">1. Collecte des données</h2>
          <p>
            PorkyFarm collecte uniquement les données nécessaires au fonctionnement de l'application : informations de
            compte, données d'élevage, et statistiques d'utilisation.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">2. Utilisation des données</h2>
          <p>Vos données sont utilisées pour vous fournir nos services et améliorer votre expérience utilisateur.</p>

          <h2 className="text-2xl font-bold mt-8 mb-4">3. Protection des données</h2>
          <p>
            Nous utilisons des mesures de sécurité avancées pour protéger vos données : chiffrement, serveurs sécurisés,
            et sauvegardes quotidiennes.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">4. Vos droits</h2>
          <p>
            Vous avez le droit d'accéder, modifier ou supprimer vos données à tout moment depuis votre compte ou en nous
            contactant.
          </p>
        </div>
      </div>
    </div>
  )
}
