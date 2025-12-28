/**
 * Bannière Assistant IA (Web) - Style UX Pilot + Ultra Design
 * Gradient violet avec effet glass, ombres premium, animations
 */

"use client"

import { Card } from "@/components/ui/card"
import { Brain, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { premiumGradients, premiumShadows, premiumGlass, premiumAnimations } from "@/lib/premium-styles"
import { radius, spacing } from "@/lib/design-tokens"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

export function AiAssistantBanner() {
  const router = useRouter()
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Card
      className={cn(
        "relative overflow-hidden cursor-pointer transition-all duration-200",
        "hover:shadow-lg hover:-translate-y-0.5"
      )}
      style={{
        boxShadow: premiumShadows.card.medium,
        borderRadius: radius.lg,
      }}
      onClick={() => router.push("/dashboard/ai-assistant")}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="absolute inset-0"
        style={{
          background: premiumGradients.ai.purple,
        }}
      />
      <div 
        className="relative p-6 flex items-center gap-4"
        style={{
          backdropFilter: "blur(0px)", // Pas de blur pour performance, mais structure prête
        }}
      >
        <div 
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center transition-transform duration-200",
            isHovered && "scale-110"
          )}
          style={{
            ...premiumGlass.light,
            boxShadow: premiumShadows.icon.soft,
          }}
        >
          <Brain className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white mb-1">Assistant IA</h3>
          <p className="text-sm text-white/90">Posez vos questions</p>
        </div>
        <ChevronRight 
          className={cn(
            "h-5 w-5 text-white transition-transform duration-200",
            isHovered && "translate-x-1"
          )} 
        />
      </div>
    </Card>
  )
}

