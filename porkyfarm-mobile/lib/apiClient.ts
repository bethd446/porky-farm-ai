/**
 * Client API unifié pour les appels backend (mobile)
 * Gestion centralisée des erreurs, offline, timeouts
 */

import * as Network from 'expo-network'
import { colors } from './designTokens'

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'

export interface ApiError {
  message: string
  code?: string
  status?: number
}

export interface ApiResponse<T> {
  data?: T
  error?: ApiError
}

class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  /**
   * Vérifie si l'appareil est en ligne
   */
  private async isOnline(): Promise<boolean> {
    try {
      const state = await Network.getNetworkStateAsync()
      return state.isConnected === true && state.isInternetReachable !== false
    } catch {
      return false
    }
  }

  /**
   * Effectue une requête HTTP
   */
  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    // Vérifier la connexion
    const online = await this.isOnline()
    if (!online) {
      return {
        error: {
          message: 'Vous êtes hors ligne. Vérifiez votre connexion internet.',
          code: 'OFFLINE',
        },
      }
    }

    try {
      const url = `${this.baseURL}${endpoint}`
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          error: {
            message: errorData.message || `Erreur ${response.status}`,
            code: errorData.code,
            status: response.status,
          },
        }
      }

      const data = await response.json()
      return { data }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur réseau. Vérifiez votre connexion.'
      return {
        error: {
          message: errorMessage,
          code: 'NETWORK_ERROR',
        },
      }
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, body?: Record<string, unknown>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, body?: Record<string, unknown>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

export const apiClient = new ApiClient(API_URL)
