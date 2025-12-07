import { LoginForm } from "@/components/auth/login-form"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left Side - Image */}
      <div className="relative hidden w-1/2 lg:block">
        <img
          src="/modern-pig-farm-building-sunrise-ivory-coast-beaut.jpg"
          alt="Ferme porcine"
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

        {/* Testimonial card */}
        <div className="absolute bottom-12 left-8 right-8">
          <div className="rounded-3xl bg-white/10 p-8 backdrop-blur-xl border border-white/20">
            <div className="flex items-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="h-5 w-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <blockquote className="text-lg text-white leading-relaxed">
              "PorkyFarm m'a permis de réduire mes pertes de porcelets de 30%. L'application est simple et vraiment
              adaptée à nos besoins d'éleveurs ivoiriens."
            </blockquote>
            <div className="mt-6 flex items-center gap-4">
              <img
                src="/african-farmer-portrait.jpg"
                alt="Témoignage"
                className="h-14 w-14 rounded-full object-cover border-2 border-white/30"
              />
              <div>
                <div className="font-semibold text-white">Kouassi Amani</div>
                <div className="text-sm text-white/60">Éleveur à Yamoussoukro</div>
              </div>
            </div>
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
              <h1 className="text-3xl font-bold text-foreground md:text-4xl">Bon retour !</h1>
              <p className="mt-3 text-muted-foreground">Connectez-vous pour accéder à votre tableau de bord</p>
            </div>

            <LoginForm />

            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                Pas encore de compte ?{" "}
                <Link href="/auth/register" className="font-semibold text-primary hover:underline">
                  Créer un compte gratuitement
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
