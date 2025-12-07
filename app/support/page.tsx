import Link from "next/link"
import { ArrowLeft, Mail, Phone, MessageCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function SupportPage() {
  const contacts = [
    {
      icon: Mail,
      title: "Email",
      value: "contact@porkyfarm.app",
      href: "mailto:contact@porkyfarm.app",
      description: "Réponse sous 24h",
    },
    {
      icon: Phone,
      title: "Téléphone",
      value: "+225 07 00 00 00 00",
      href: "tel:+2250700000000",
      description: "Lun-Ven: 8h-18h",
    },
    {
      icon: MessageCircle,
      title: "Chat en direct",
      value: "Disponible dans l'app",
      href: "/dashboard",
      description: "Support instantané",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" />
          Retour à l'accueil
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Support & Assistance</h1>
          <p className="text-lg text-muted-foreground">Nous sommes là pour vous aider</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-12">
          {contacts.map((contact, i) => (
            <Card key={i} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <contact.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{contact.title}</CardTitle>
                <CardDescription>{contact.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={contact.href}>
                  <Button variant="outline" className="w-full bg-transparent">
                    {contact.value}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
