/**
 * Client Vercel AI Gateway pour PorkyFarm
 * Encapsule la configuration et les modèles IA
 */

import { createOpenAI } from "@ai-sdk/openai"

// Configuration Vercel AI Gateway
const AI_GATEWAY_BASE_URL = "https://ai-gateway.vercel.sh/v1"
const AI_GATEWAY_API_KEY = process.env.VERCEL_AI_GATEWAY_API_KEY

if (!AI_GATEWAY_API_KEY) {
  console.warn(
    "[AI Client] VERCEL_AI_GATEWAY_API_KEY non configurée. L'IA utilisera OpenAI directement."
  )
}

/**
 * Client OpenAI configuré pour Vercel AI Gateway
 * Fallback vers OpenAI direct si la clé Gateway n'est pas configurée
 */
export const aiClient = createOpenAI({
  apiKey: AI_GATEWAY_API_KEY || process.env.OPENAI_API_KEY,
  baseURL: AI_GATEWAY_API_KEY ? AI_GATEWAY_BASE_URL : undefined,
})

/**
 * Modèles IA disponibles via Vercel AI Gateway
 */
export const models = {
  /**
   * Chat texte principal (assistant IA)
   * GPT-4o-mini pour coûts optimisés, GPT-4o pour meilleure qualité
   */
  chat: {
    primary: (client = aiClient) => client("openai/gpt-4o-mini"),
    premium: (client = aiClient) => client("openai/gpt-4o"),
  },

  /**
   * Vision IA (analyse d'images)
   * GPT-4o avec vision pour analyse photos santé animale
   */
  vision: {
    primary: (client = aiClient) => client("openai/gpt-4o"),
  },

  /**
   * Analyse structurée (recommandations, rapports)
   * Claude 3.5 Sonnet pour meilleure structuration JSON
   */
  analysis: {
    primary: (client = aiClient) => {
      // Fallback vers GPT-4o si Claude n'est pas disponible via Gateway
      try {
        return client("anthropic/claude-3-5-sonnet")
      } catch {
        return client("openai/gpt-4o")
      }
    },
    fallback: (client = aiClient) => client("openai/gpt-4o"),
  },

  /**
   * Embeddings (recherche sémantique, future feature)
   */
  embeddings: {
    primary: (client = aiClient) => client("openai/text-embedding-3-small"),
  },
} as const

/**
 * Vérifie si Vercel AI Gateway est configuré
 */
export function isAIGatewayConfigured(): boolean {
  return !!AI_GATEWAY_API_KEY
}

/**
 * Obtient le modèle approprié selon le type de requête
 */
export function getModelForRequest(
  type: "chat" | "vision" | "analysis",
  usePremium: boolean = false
) {
  switch (type) {
    case "chat":
      return usePremium ? models.chat.premium() : models.chat.primary()
    case "vision":
      return models.vision.primary()
    case "analysis":
      return models.analysis.primary()
    default:
      return models.chat.primary()
  }
}

