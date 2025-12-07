import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function FAQPage() {
  const faqs = [
    {
      question: "Comment démarrer avec PorkyFarm ?",
      answer:
        "Créez votre compte gratuitement, ajoutez vos premiers animaux, et commencez à suivre leur santé et reproduction. Notre guide de démarrage vous accompagne étape par étape.",
    },
    {
      question: "L'application fonctionne-t-elle hors ligne ?",
      answer:
        "Oui, PorkyFarm peut fonctionner en mode hors ligne. Vos données seront synchronisées dès que vous retrouverez une connexion internet.",
    },
    {
      question: "Puis-je gérer plusieurs fermes ?",
      answer:
        "Oui, avec le plan Entreprise, vous pouvez gérer plusieurs fermes depuis un seul compte et passer facilement de l'une à l'autre.",
    },
    {
      question: "Les données sont-elles sécurisées ?",
      answer:
        "Absolument. Nous utilisons un chiffrement de bout en bout et vos données sont stockées sur des serveurs sécurisés avec des sauvegardes quotidiennes.",
    },
    {
      question: "Puis-je exporter mes données ?",
      answer: "Oui, vous pouvez exporter toutes vos données au format Excel ou PDF à tout moment depuis l'application.",
    },
    {
      question: "Y a-t-il une période d'essai ?",
      answer:
        "Le plan Pro offre 30 jours d'essai gratuit sans engagement. Aucune carte bancaire requise pour commencer.",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" />
          Retour à l'accueil
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Questions fréquentes</h1>
          <p className="text-lg text-muted-foreground">Tout ce que vous devez savoir sur PorkyFarm</p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, i) => (
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
          <h3 className="text-xl font-bold mb-2">Vous ne trouvez pas votre réponse ?</h3>
          <p className="text-muted-foreground mb-4">Notre équipe est là pour vous aider</p>
          <Link href="mailto:contact@porkyfarm.app">
            <Button>Contactez-nous</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
