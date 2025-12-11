import { LandingHero } from "@/components/landing/landing-hero"
import { LandingStats } from "@/components/landing/landing-stats"
import dynamic from "next/dynamic"

const LandingFeatures = dynamic(
  () => import("@/components/landing/landing-features").then((mod) => ({ default: mod.LandingFeatures })),
  {
    loading: () => <div className="min-h-[600px] bg-background" />,
  },
)

const LandingTestimonials = dynamic(
  () => import("@/components/landing/landing-testimonials").then((mod) => ({ default: mod.LandingTestimonials })),
  {
    loading: () => <div className="min-h-[400px] bg-muted" />,
  },
)

const LandingCTA = dynamic(
  () => import("@/components/landing/landing-cta").then((mod) => ({ default: mod.LandingCTA })),
  {
    loading: () => <div className="min-h-[400px] bg-primary/10" />,
  },
)

const LandingFooter = dynamic(
  () => import("@/components/landing/landing-footer").then((mod) => ({ default: mod.LandingFooter })),
  {
    loading: () => <div className="min-h-[300px] bg-foreground" />,
  },
)

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Critical above-fold components loaded immediately */}
      <LandingHero />
      <LandingStats />
      {/* Below-fold components lazy loaded */}
      <LandingFeatures />
      <LandingTestimonials />
      <LandingCTA />
      <LandingFooter />
    </main>
  )
}
