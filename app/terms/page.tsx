import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" />
          Retour à l'accueil
        </Link>

        <h1 className="text-4xl font-bold mb-8">Conditions d'utilisation</h1>

        <div className="prose prose-slate max-w-none">
          <p className="text-muted-foreground">Dernière mise à jour: Janvier 2025</p>

          <h2 className="text-2xl font-bold mt-8 mb-4">1. Acceptation des conditions</h2>
          <p>
            En utilisant PorkyFarm, vous acceptez les présentes conditions d'utilisation. Si vous n'acceptez pas ces
            conditions, veuillez ne pas utiliser nos services.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">2. Utilisation du service</h2>
          <p>
            PorkyFarm est destiné à un usage professionnel pour la gestion d'élevages porcins. Vous vous engagez à
            utiliser le service de manière légale et conforme.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">3. Compte utilisateur</h2>
          <p>
            Vous êtes responsable de la confidentialité de votre compte et mot de passe. Toute activité effectuée via
            votre compte est sous votre responsabilité.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">4. Limitation de responsabilité</h2>
          <p>
            PorkyFarm est fourni "tel quel" sans garantie. Nous ne sommes pas responsables des pertes ou dommages
            résultant de l'utilisation de l'application.
          </p>
        </div>
      </div>
    </div>
  )
}
