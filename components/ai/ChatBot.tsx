/**
 * Composant ChatBot amélioré utilisant useChat du SDK AI
 * Compatible avec streaming et Vercel AI Gateway
 */

"use client"

import { useChat } from "@ai-sdk/react"
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
  const { animals } = useApp()
  const [input, setInput] = useState("")

  // Construire le contexte d'élevage
  const buildLivestockContext = () => {
    if (!animals || animals.length === 0) return ""

    // Utiliser les valeurs DB (anglais) pour le filtrage
    const activeAnimals = animals.filter((a) => {
      const status = a.status as string
      return status === "active" || status === "pregnant" || status === "nursing"
    })

    return `
Élevage de ${activeAnimals.length} animaux:
- Truies: ${activeAnimals.filter((a) => {
      const cat = a.category as string
      return cat === "sow"
    }).length}
- Verrats: ${activeAnimals.filter((a) => {
      const cat = a.category as string
      return cat === "boar"
    }).length}
- Porcelets: ${activeAnimals.filter((a) => {
      const cat = a.category as string
      return cat === "piglet"
    }).length}
- Porcs d'engraissement: ${activeAnimals.filter((a) => {
      const cat = a.category as string
      return cat === "fattening"
    }).length}
`
  }

  // Utiliser useChat pour le streaming (API v5)
  const { messages, sendMessage, regenerate, status, error } = useChat({
    api: "/api/ai/chat",
    body: {
      livestockContext: buildLivestockContext() || initialContext,
      userRole,
    },
    onError: (err: Error) => {
      console.error("[ChatBot] Error:", err)
    },
  } as any) // Type assertion temporaire pour compatibilité API

  const isLoading = status === "in_progress" || status === "streaming"

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
            onClick={() => regenerate()}
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

        {messages.map((message: any) => {
          // Extraire le contenu du message (peut être string ou array de parts)
          const content =
            typeof message.content === "string"
              ? message.content
              : Array.isArray(message.content)
                ? message.content
                    .map((part: any) =>
                      typeof part === "string" ? part : part.text || JSON.stringify(part)
                    )
                    .join(" ")
                : message.content?.text || JSON.stringify(message.content || "")

          return (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <div className="shrink-0">
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
                <p className="text-sm whitespace-pre-wrap">{content}</p>
              </div>

              {message.role === "user" && (
                <div className="shrink-0">
                  <User className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
            </div>
          )
        })}

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
            {error.message || "Une erreur est survenue. Veuillez réessayer."}
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (input.trim() && !isLoading) {
            sendMessage({ text: input })
            setInput("")
          }
        }}
        className="p-4 border-t flex gap-2"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
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
