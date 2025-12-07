import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "FAQ - PorkyFarm",
  description: "Trouvez les reponses a toutes vos questions sur PorkyFarm, l'application de gestion d'elevage porcin.",
}

const FAQS = [
  {
    question: "Comment demarrer avec PorkyFarm ?",
    answer:
      "Creez votre compte gratuitement, ajoutez vos premiers animaux, et commencez a suivre leur sante et reproduction. Notre guide de demarrage vous accompagne etape par etape.",
  },
  {
    question: "L'application fonctionne-t-elle hors ligne ?",
    answer:
      "Oui, PorkyFarm peut fonctionner en mode hors ligne. Vos donnees seront synchronisees des que vous retrouverez une connexion internet.",
  },
  {
    question: "Puis-je gerer plusieurs fermes ?",
    answer:
      "Oui, avec le plan Entreprise, vous pouvez gerer plusieurs fermes depuis un seul compte et passer facilement de l'une a l'autre.",
  },
  {
    question: "Les donnees sont-elles securisees ?",
    answer:
      "Absolument. Nous utilisons un chiffrement de bout en bout et vos donnees sont stockees sur des serveurs securises avec des sauvegardes quotidiennes.",
  },
  {
    question: "Puis-je exporter mes donnees ?",
    answer: "Oui, vous pouvez exporter toutes vos donnees au format Excel ou PDF a tout moment depuis l'application.",
  },
  {
    question: "Y a-t-il une periode d'essai ?",
    answer: "Le plan Pro offre 30 jours d'essai gratuit sans engagement. Aucune carte bancaire requise pour commencer.",
  },
] as const

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" />
          Retour a l'accueil
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Questions frequentes</h1>
          <p className="text-lg text-muted-foreground">Tout ce que vous devez savoir sur PorkyFarm</p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {FAQS.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="bg-card border border-border rounded-xl px-6 data-[state=open]:shadow-lg transition-shadow"
            >
              <AccordionTrigger className="text-left font-semibold hover:no-underline py-6">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-6">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-12 text-center bg-muted rounded-2xl p-8">
          <h3 className="text-xl font-bold mb-2">Vous ne trouvez pas votre reponse ?</h3>
          <p className="text-muted-foreground mb-4">Notre equipe est la pour vous aider</p>
          <Link href="mailto:contact@porkyfarm.app">
            <Button>Contactez-nous</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
