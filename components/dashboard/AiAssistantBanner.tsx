/**
 * Bannière Assistant IA (Web) - Style UX Pilot
 * Gradient violet avec icône et texte
 */

"use client"

import { Card } from "@/components/ui/card"
import { Brain, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { colors } from "@/lib/design-tokens"

export function AiAssistantBanner() {
  const router = useRouter()

  return (
    <Card
      className="relative overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => router.push("/dashboard/ai-assistant")}
    >
      <div
        className="absolute inset-0 bg-gradient-to-r from-purple-500 via-purple-400 to-purple-300"
        style={{
          background: "linear-gradient(135deg, #8b5cf6 0%, #a78bfa 50%, #c4b5fd 100%)",
        }}
      />
      <div className="relative p-6 flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
          <Brain className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white mb-1">Assistant IA</h3>
          <p className="text-sm text-white/90">Posez vos questions</p>
        </div>
        <ChevronRight className="h-5 w-5 text-white" />
      </div>
    </Card>
  )
}

