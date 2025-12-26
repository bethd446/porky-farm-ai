/**
 * =====================================================
 * PorkyFarm API Client
 * =====================================================
 *
 * Client unifie pour les apps Web et Mobile (React Native / Expo)
 *
 * MODULES P0 EXPOSES :
 * - /api/animals      : CRUD cheptel (pigs)
 * - /api/health-cases : CRUD cas de sante (veterinary_cases)
 * - /api/gestations   : CRUD reproduction
 * - /api/auth/session : Verification session utilisateur
 * - /api/chat         : Assistant IA (GPT-4o)
 *
 * SECURITE :
 * - Authentification via cookies Supabase (credentials: include)
 * - Isolation stricte par user_id (RLS Supabase)
 * - Validation Zod sur tous les inputs
 * - Rate limiting sur /api/chat (20 req/min)
 *
 * LIMITATIONS ACTUELLES (P1) :
 * - Pas de mode offline / cache local
 * - Pas de notifications push
 * - Pas de synchronisation differee
 * - Module Alimentation: feed_stock et feeding_schedule disponibles
 *
 * USAGE EXPO/REACT NATIVE :
 * \`\`\`typescript
 * import { animalsApi, healthCasesApi, gestationsApi } from '@/lib/api/client'
 *
 * // Recuperer tous les animaux
 * const { data, error } = await animalsApi.getAll()
 *
 * // Creer un animal
 * const { data, error } = await animalsApi.create({
 *   identifier: 'TRUIE-001',
 *   category: 'sow',
 *   breed: 'Large White'
 * })
 * \`\`\`
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ""

interface ApiError {
  error: string
}

interface ApiResponse<T> {
  data?: T
  error?: string
}

// Helper pour les requêtes authentifiées
async function fetchWithAuth<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include", // Important pour les cookies de session
    })

    const data = await response.json()

    if (!response.ok) {
      return { error: data.error || "Une erreur est survenue" }
    }

    return { data: data.data || data }
  } catch (error) {
    return { error: "Erreur de connexion au serveur" }
  }
}

// API Animals
export const animalsApi = {
  getAll: () => fetchWithAuth("/api/animals"),
  getById: (id: string) => fetchWithAuth(`/api/animals/${id}`),
  create: (animal: any) =>
    fetchWithAuth("/api/animals", {
      method: "POST",
      body: JSON.stringify(animal),
    }),
  update: (id: string, updates: any) =>
    fetchWithAuth(`/api/animals/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    }),
  delete: (id: string) =>
    fetchWithAuth(`/api/animals/${id}`, {
      method: "DELETE",
    }),
}

// API Health Cases
export const healthCasesApi = {
  getAll: () => fetchWithAuth("/api/health-cases"),
  getById: (id: string) => fetchWithAuth(`/api/health-cases/${id}`),
  create: (healthCase: any) =>
    fetchWithAuth("/api/health-cases", {
      method: "POST",
      body: JSON.stringify(healthCase),
    }),
  update: (id: string, updates: any) =>
    fetchWithAuth(`/api/health-cases/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    }),
  delete: (id: string) =>
    fetchWithAuth(`/api/health-cases/${id}`, {
      method: "DELETE",
    }),
}

// API Gestations
export const gestationsApi = {
  getAll: () => fetchWithAuth("/api/gestations"),
  getById: (id: string) => fetchWithAuth(`/api/gestations/${id}`),
  create: (gestation: any) =>
    fetchWithAuth("/api/gestations", {
      method: "POST",
      body: JSON.stringify(gestation),
    }),
  update: (id: string, updates: any) =>
    fetchWithAuth(`/api/gestations/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    }),
  delete: (id: string) =>
    fetchWithAuth(`/api/gestations/${id}`, {
      method: "DELETE",
    }),
}

// API Auth
export const authApi = {
  getSession: () => fetchWithAuth("/api/auth/session"),
}

// API Chat
export const chatApi = {
  getResponse: (message: string) =>
    fetchWithAuth("/api/chat", {
      method: "POST",
      body: JSON.stringify({ message }),
    }),
}
