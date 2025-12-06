import { LoginForm } from "@/components/auth/login-form"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left Side - Image */}
      <div className="relative hidden w-1/2 lg:block">
        <img src="/modern-pig-farm-building-sunrise-ivory-coast-beaut.jpg" alt="Ferme porcine" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        <div className="absolute bottom-12 left-12 right-12">
          <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-xl">
            <blockquote className="text-lg text-white">
              "PorkyFarm m'a permis de réduire mes pertes de porcelets de 30%. L'application est simple et vraiment
              adaptée à nos besoins."
            </blockquote>
            <div className="mt-4 flex items-center gap-3">
              <img src="/african-farmer-portrait.jpg" alt="Témoignage" className="h-12 w-12 rounded-full object-cover" />
              <div>
                <div className="font-medium text-white">Kouassi Amani</div>
                <div className="text-sm text-white/60">Éleveur à Yamoussoukro</div>
              </div>
            </div>
          </div>
        </div>

        <Link href="/" className="absolute left-12 top-12 flex items-center gap-2">
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
      </div>

      {/* Right Side - Form */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <Link href="/" className="mb-8 flex items-center gap-2 lg:hidden">
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

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Bon retour !</h1>
            <p className="mt-2 text-muted-foreground">Connectez-vous pour accéder à votre tableau de bord</p>
          </div>

          <LoginForm />

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Pas encore de compte ?{" "}
            <Link href="/auth/register" className="font-medium text-primary hover:underline">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
