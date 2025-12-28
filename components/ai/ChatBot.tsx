/**
 * Composant ChatBot amélioré utilisant useChat du SDK AI
 * Compatible avec streaming et Vercel AI Gateway
 */

"use client"

import { useChat } from "ai/react"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Bot, User, Loader2, RefreshCw } from "lucide-react"
import { useApp } from "@/contexts/app-context"

interface ChatBotProps {
  initialContext?: string
  userRole?: "farmer" | "veterinarian" | "admin"
}

export function ChatBot({ initialContext, userRole = "farmer" }: ChatBotProps) {
  const { animals, stats } = useApp()
  const [error, setError] = useState<string | null>(null)

  // Construire le contexte d'élevage
  const buildLivestockContext = () => {
    if (!animals || animals.length === 0) return ""

    const activeAnimals = animals.filter(
      (a) => a.status === "active" || a.status === "pregnant" || a.status === "nursing"
    )

    return `
Élevage de ${activeAnimals.length} animaux:
- Truies: ${activeAnimals.filter((a) => a.category === "sow").length}
- Verrats: ${activeAnimals.filter((a) => a.category === "boar").length}
- Porcelets: ${activeAnimals.filter((a) => a.category === "piglet").length}
- Porcs d'engraissement: ${activeAnimals.filter((a) => a.category === "fattening").length}
`
  }

  // Utiliser useChat pour le streaming
  const { messages, input, handleInputChange, handleSubmit, isLoading, reload } =
    useChat({
      api: "/api/ai/chat", // Nouveau endpoint via AI Gateway
      body: {
        livestockContext: buildLivestockContext() || initialContext,
        userRole,
      },
      onError: (err) => {
        console.error("[ChatBot] Error:", err)
        setError("Une erreur est survenue. Veuillez réessayer.")
      },
      onFinish: () => {
        setError(null)
      },
    })

  return (
    <Card className="flex flex-col h-[600px]">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">PorkyAssistant</h3>
        </div>
        {messages.length > 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={reload}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Bonjour ! Je suis PorkyAssistant.</p>
            <p className="text-sm mt-2">
              Posez-moi vos questions sur l'élevage porcin.
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {message.role === "assistant" && (
              <div className="flex-shrink-0">
                <Bot className="h-6 w-6 text-primary" />
              </div>
            )}

            <div
              className={`rounded-lg px-4 py-2 max-w-[80%] ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>

            {message.role === "user" && (
              <div className="flex-shrink-0">
                <User className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <Bot className="h-6 w-6 text-primary" />
            <div className="bg-muted rounded-lg px-4 py-2">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">
            {error}
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="p-4 border-t flex gap-2"
      >
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder="Posez votre question..."
          disabled={isLoading}
          className="flex-1"
        />
        <Button type="submit" disabled={isLoading || !input.trim()}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </Card>
  )
}

