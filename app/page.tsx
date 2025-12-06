import { LandingHero } from "@/components/landing/landing-hero"
import { LandingFeatures } from "@/components/landing/landing-features"
import { LandingStats } from "@/components/landing/landing-stats"
import { LandingTestimonials } from "@/components/landing/landing-testimonials"
import { LandingCTA } from "@/components/landing/landing-cta"
import { LandingFooter } from "@/components/landing/landing-footer"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <LandingHero />
      <LandingStats />
      <LandingFeatures />
      <LandingTestimonials />
      <LandingCTA />
      <LandingFooter />
    </main>
  )
}
