"use client"

import type React from "react"

import { useChat } from "ai/react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Bot, User, Sparkles, Loader2, RefreshCw } from "lucide-react"
import { useEffect, useRef } from "react"

const suggestedQuestions = [
  "Quel est le meilleur régime pour une truie gestante ?",
  "Comment reconnaître les signes de mise-bas imminente ?",
  "Quelle est la durée normale d'allaitement ?",
  "Comment prévenir la diarrhée chez les porcelets ?",
  "Quel calendrier vaccinal pour mon élevage ?",
  "Comment calculer la ration alimentaire ?",
]

export function AIChat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, reload, error } = useChat({
    api: "/api/chat",
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content:
          "Bonjour ! Je suis **PorkyAssistant**, votre conseiller IA spécialisé en élevage porcin. 🐷\n\nJe peux vous aider sur :\n- **Alimentation** : rations, besoins nutritionnels\n- **Reproduction** : gestation, mise-bas, sevrage\n- **Santé** : prévention, vaccinations, traitements\n- **Gestion** : suivi du cheptel, rentabilité\n\nComment puis-je vous aider aujourd'hui ?",
      },
    ],
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleQuestionClick = (question: string) => {
    handleInputChange({ target: { value: question } } as React.ChangeEvent<HTMLInputElement>)
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
            <p className="text-xs text-muted-foreground">Expert en élevage porcin</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => reload()} disabled={isLoading}>
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
              <span className="text-sm text-muted-foreground">Réflexion en cours...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="flex gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/20">
              <Bot className="h-5 w-5 text-destructive" />
            </div>
            <div className="rounded-2xl bg-destructive/10 px-4 py-3 border border-destructive/20">
              <p className="text-sm text-destructive">Une erreur est survenue. Veuillez réessayer.</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {messages.length <= 1 && (
        <div className="border-t border-border px-4 py-3 bg-muted/30">
          <p className="mb-2 text-xs font-medium text-muted-foreground flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-primary" />
            Questions suggérées
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleQuestionClick(q)}
                className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground transition-all hover:bg-primary hover:text-white hover:border-primary"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-border p-4 bg-background">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Posez votre question sur l'élevage porcin..."
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
