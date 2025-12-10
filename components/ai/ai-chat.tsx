"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Bot, User, Sparkles, Loader2, RefreshCw, MessageCircle, Heart, Utensils, Baby } from "lucide-react"
import { useApp } from "@/contexts/app-context"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

const questionCategories = [
  {
    icon: Utensils,
    label: "Alimentation",
    questions: [
      "Quelle ration pour une truie gestante ?",
      "Comment calculer les besoins alimentaires ?",
      "Quel complement pour les porcelets ?",
    ],
  },
  {
    icon: Heart,
    label: "Sante",
    questions: [
      "Comment prevenir la diarrhee chez les porcelets ?",
      "Quel calendrier vaccinal pour mon elevage ?",
      "Symptomes de la PPA a surveiller ?",
    ],
  },
  {
    icon: Baby,
    label: "Reproduction",
    questions: [
      "Signes de mise-bas imminente ?",
      "Duree normale d'allaitement ?",
      "Comment ameliorer le taux de fecondite ?",
    ],
  },
]

export function AIChat() {
  const { animals, stats } = useApp()

  const getWelcomeMessage = (): Message => ({
    id: "welcome",
    role: "assistant",
    content: `Bonjour ! Je suis **PorkyAssistant**, votre conseiller IA specialise en elevage porcin.

${stats.total > 0 ? `Je vois que vous avez **${stats.total} animaux** dans votre cheptel (${stats.truies} truies, ${stats.verrats} verrats, ${stats.porcelets} porcelets).` : "Commencez par ajouter vos premiers animaux pour que je puisse vous donner des conseils personnalises."}

**Demandez-moi conseil sur :**
- L'alimentation et les rations
- La sante et les vaccinations
- La reproduction et le sevrage

Selectionnez une question ci-dessous ou posez la votre !`,
  })

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMessages([getWelcomeMessage()])
  }, [stats.total])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const buildLivestockContext = () => {
    if (animals.length === 0) return ""

    let context = `\n\nContexte du cheptel de l'utilisateur:\n`
    context += `- Total: ${animals.length} animaux\n`
    context += `- Truies: ${stats.truies}\n`
    context += `- Verrats: ${stats.verrats}\n`
    context += `- Porcelets: ${stats.porcelets}\n`
    context += `- Porcs d'engraissement: ${stats.porcs}\n`

    const healthyCount = animals.filter((a) => a.healthStatus === "bon").length
    const sickCount = animals.filter((a) => a.healthStatus === "malade" || a.healthStatus === "critique").length
    if (healthyCount > 0 || sickCount > 0) {
      context += `- En bonne sante: ${healthyCount}, Necessitant attention: ${sickCount}\n`
    }

    return context
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setError(null)
    setSelectedCategory(null)

    try {
      const livestockContext = buildLivestockContext()

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          livestockContext,
        }),
      })

      if (!response.ok) {
        throw new Error("Erreur de communication avec l'assistant")
      }

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.content || data.message || "Desole, je n'ai pas pu generer une reponse.",
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      setError("Une erreur est survenue. Veuillez reessayer.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuestionClick = (question: string) => {
    setInput(question)
    setSelectedCategory(null)
  }

  const handleReset = () => {
    setMessages([getWelcomeMessage()])
    setError(null)
    setSelectedCategory(null)
  }

  return (
    <Card className="flex h-[calc(100vh-200px)] flex-col shadow-soft overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-primary/10 to-transparent px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">PorkyAssistant</h3>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? `${stats.total} animaux dans votre cheptel` : "Expert en elevage porcin"}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={handleReset} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}>
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                message.role === "user" ? "bg-primary" : "bg-gradient-to-br from-primary to-primary-dark"
              }`}
            >
              {message.role === "user" ? (
                <User className="h-5 w-5 text-white" />
              ) : (
                <Bot className="h-5 w-5 text-white" />
              )}
            </div>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === "user" ? "bg-primary text-white" : "bg-muted text-foreground border border-border"
              }`}
            >
              <div
                className="whitespace-pre-wrap text-sm prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{
                  __html: message.content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br/>"),
                }}
              />
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-dark">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-3 border border-border">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Reflexion en cours...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="flex gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/20">
              <Bot className="h-5 w-5 text-destructive" />
            </div>
            <div className="rounded-2xl bg-destructive/10 px-4 py-3 border border-destructive/20">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {messages.length <= 1 && (
        <div className="border-t border-border px-4 py-3 bg-muted/30">
          <p className="mb-3 text-xs font-medium text-muted-foreground flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-primary" />
            Choisissez un sujet ou posez votre question
          </p>

          {/* Category buttons */}
          <div className="flex gap-2 mb-3">
            {questionCategories.map((cat, i) => (
              <button
                key={i}
                onClick={() => setSelectedCategory(selectedCategory === i ? null : i)}
                className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                  selectedCategory === i
                    ? "bg-primary text-white"
                    : "border border-border bg-background text-muted-foreground hover:bg-muted"
                }`}
              >
                <cat.icon className="h-3.5 w-3.5" />
                {cat.label}
              </button>
            ))}
          </div>

          {/* Questions for selected category */}
          {selectedCategory !== null && (
            <div className="flex flex-col gap-1.5 animate-in slide-in-from-top-2">
              {questionCategories[selectedCategory].questions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleQuestionClick(q)}
                  className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-left text-foreground transition-all hover:bg-primary hover:text-white hover:border-primary"
                >
                  <MessageCircle className="h-4 w-4 shrink-0" />
                  {q}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Input */}
      <div className="border-t border-border p-4 bg-background">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Posez votre question sur l'elevage porcin..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button
            type="submit"
            className="bg-primary text-white hover:bg-primary-dark"
            disabled={!input.trim() || isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </Card>
  )
}
