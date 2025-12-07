import { RegisterForm } from "@/components/auth/register-form"
import Link from "next/link"
import { ArrowLeft, CheckCircle2 } from "lucide-react"

const features = [
  "Suivi complet de votre cheptel",
  "Assistant IA pour des conseils personnalisés",
  "Gestion sanitaire avec photos",
  "Calcul automatique des rations",
  "Alertes et rappels automatiques",
  "Support en français 24/7",
]

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left Side - Image */}
      <div className="relative hidden w-1/2 lg:block">
        <img
          src="/group-of-healthy-pigs-in-clean-modern-farm-ivory-c.jpg"
          alt="Élevage porcin"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/50" />

        {/* Logo */}
        <Link href="/" className="absolute left-8 top-8 flex items-center gap-3 group">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/30 transition-transform group-hover:scale-105">
            <svg viewBox="0 0 24 24" className="h-7 w-7 text-white" fill="currentColor">
              <path d="M12 2C8.5 2 5.5 4.5 5.5 8c0 2.5 1.5 4.5 3.5 5.5v2c0 .5.5 1 1 1h4c.5 0 1-.5 1-1v-2c2-1 3.5-3 3.5-5.5 0-3.5-3-6-6.5-6z" />
              <circle cx="9" cy="7" r="1.5" />
              <circle cx="15" cy="7" r="1.5" />
              <path d="M10 10h4c0 1-1 2-2 2s-2-1-2-2z" />
            </svg>
          </div>
          <span className="text-2xl font-bold text-white">PorkyFarm</span>
        </Link>

        {/* Features card */}
        <div className="absolute bottom-12 left-8 right-8">
          <div className="rounded-3xl bg-white/10 p-8 backdrop-blur-xl border border-white/20">
            <h3 className="text-xl font-bold text-white mb-6">Pourquoi choisir PorkyFarm ?</h3>
            <ul className="space-y-4">
              {features.map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-white/90">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/80">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex w-full flex-col bg-background lg:w-1/2">
        {/* Mobile header */}
        <div className="flex items-center justify-between p-6 lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="currentColor">
                <path d="M12 2C8.5 2 5.5 4.5 5.5 8c0 2.5 1.5 4.5 3.5 5.5v2c0 .5.5 1 1 1h4c.5 0 1-.5 1-1v-2c2-1 3.5-3 3.5-5.5 0-3.5-3-6-6.5-6z" />
                <circle cx="9" cy="7" r="1.5" />
                <circle cx="15" cy="7" r="1.5" />
                <path d="M10 10h4c0 1-1 2-2 2s-2-1-2-2z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-foreground">PorkyFarm</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Link>
        </div>

        {/* Form container */}
        <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-16">
          <div className="mx-auto w-full max-w-md">
            {/* Back link for desktop */}
            <Link
              href="/"
              className="hidden lg:inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à l'accueil
            </Link>

            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground md:text-4xl">Créer un compte</h1>
              <p className="mt-3 text-muted-foreground">
                Commencez à gérer votre élevage intelligemment en quelques minutes
              </p>
            </div>

            <RegisterForm />

            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                Déjà un compte ?{" "}
                <Link href="/auth/login" className="font-semibold text-primary hover:underline">
                  Se connecter
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
