import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" />
          Retour à l'accueil
        </Link>

        <h1 className="text-4xl font-bold mb-8">Politique de cookies</h1>

        <div className="prose prose-slate max-w-none">
          <p className="text-muted-foreground">Dernière mise à jour: Janvier 2025</p>

          <h2 className="text-2xl font-bold mt-8 mb-4">Qu'est-ce qu'un cookie ?</h2>
          <p>
            Les cookies sont de petits fichiers texte stockés sur votre appareil pour améliorer votre expérience de
            navigation.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">Cookies que nous utilisons</h2>
          <ul>
            <li>
              <strong>Cookies essentiels</strong> : Nécessaires au fonctionnement de l'application (authentification,
              sessions)
            </li>
            <li>
              <strong>Cookies analytiques</strong> : Pour comprendre comment vous utilisez l'application et l'améliorer
            </li>
            <li>
              <strong>Cookies de préférence</strong> : Pour mémoriser vos préférences (langue, thème)
            </li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">Gestion des cookies</h2>
          <p>
            Vous pouvez gérer ou désactiver les cookies dans les paramètres de votre navigateur. Notez que certaines
            fonctionnalités peuvent ne plus fonctionner correctement.
          </p>
        </div>
      </div>
    </div>
  )
}
