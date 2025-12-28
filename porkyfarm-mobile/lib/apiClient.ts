/**
 * Client API unifié pour toutes les requêtes réseau mobile
 * Gère : timeout, erreurs, offline, retry, logs
 */

import { Platform } from 'react-native'
import * as Network from 'expo-network'

const API_URL = (() => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL
  if (envUrl) {
    if (envUrl.includes('localhost') && Platform.OS === 'ios') {
      return envUrl.replace('localhost', '127.0.0.1')
    }
    return envUrl
  }
  return Platform.OS === 'ios' ? 'http://127.0.0.1:3000' : 'http://localhost:3000'
})()

export interface ApiError {
  message: string
  code?: string
  status?: number
  offline?: boolean
}

export interface ApiResponse<T> {
  data: T | null
  error: ApiError | null
}

interface RequestOptions extends RequestInit {
  timeout?: number
  retries?: number
  retryDelay?: number
}

class ApiClient {
  private baseURL: string
  private defaultTimeout: number = 30000 // 30 secondes
  private defaultRetries: number = 2
  private defaultRetryDelay: number = 1000 // 1 seconde

  constructor(baseURL: string) {
    this.baseURL = baseURL.replace(/\/$/, '') // Enlever le trailing slash
  }

  /**
   * Vérifie si le réseau est disponible
   */
  private async isOnline(): Promise<boolean> {
    try {
      const state = await Network.getNetworkStateAsync()
      return state.isConnected && state.isInternetReachable !== false
    } catch {
      return false
    }
  }

  /**
   * Récupère le token d'authentification Supabase
   */
  private async getAuthToken(): Promise<string | null> {
    try {
      const { supabase } = await import('../services/supabase/client')
      const {
        data: { session },
      } = await supabase.auth.getSession()
      return session?.access_token || null
    } catch {
      return null
    }
  }

  /**
   * Requête générique avec gestion d'erreurs, timeout, retry
   */
  async request<T>(
    path: string,
    options: RequestOptions = {},
  ): Promise<ApiResponse<T>> {
    const {
      timeout = this.defaultTimeout,
      retries = this.defaultRetries,
      retryDelay = this.defaultRetryDelay,
      ...fetchOptions
    } = options

    // Vérifier le réseau
    const online = await this.isOnline()
    if (!online) {
      return {
        data: null,
        error: {
          message: 'Aucune connexion réseau disponible',
          offline: true,
        },
      }
    }

    // Récupérer le token d'auth
    const token = await this.getAuthToken()
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(fetchOptions.headers as HeadersInit),
    }

    const url = `${this.baseURL}${path.startsWith('/') ? path : `/${path}`}`

    // Retry logic
    let lastError: ApiError | null = null

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), timeout)

        const response = await fetch(url, {
          ...fetchOptions,
          headers,
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        // Gérer les erreurs HTTP
        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Erreur inconnue')
          let errorData: any = {}

          try {
            errorData = JSON.parse(errorText)
          } catch {
            errorData = { message: errorText || `Erreur HTTP ${response.status}` }
          }

          // Ne pas retry sur erreurs 4xx (sauf 429)
          if (response.status >= 400 && response.status < 500 && response.status !== 429) {
            return {
              data: null,
              error: {
                message: errorData.message || `Erreur ${response.status}`,
                code: errorData.code,
                status: response.status,
              },
            }
          }

          // Retry sur erreurs 5xx ou 429
          if (attempt < retries) {
            await new Promise((resolve) => setTimeout(resolve, retryDelay * (attempt + 1)))
            continue
          }

          return {
            data: null,
            error: {
              message: errorData.message || `Erreur ${response.status}`,
              code: errorData.code,
              status: response.status,
            },
          }
        }

        // Parser la réponse
        const contentType = response.headers.get('content-type')
        if (contentType?.includes('application/json')) {
          const data = await response.json()
          return { data: data as T, error: null }
        }

        const text = await response.text()
        return { data: text as T, error: null }
      } catch (error: any) {
        // Gérer les erreurs réseau
        if (error.name === 'AbortError') {
          lastError = {
            message: 'La requête a expiré. Vérifiez votre connexion.',
            code: 'TIMEOUT',
          }
        } else if (error.message?.includes('Network request failed') || error.message?.includes('Failed to fetch')) {
          const onlineCheck = await this.isOnline()
          if (!onlineCheck) {
            return {
              data: null,
              error: {
                message: 'Aucune connexion réseau disponible',
                offline: true,
              },
            }
          }

          lastError = {
            message: 'Erreur de connexion. Vérifiez votre réseau.',
            code: 'NETWORK_ERROR',
            offline: true,
          }

          // Retry si on a encore des tentatives
          if (attempt < retries) {
            await new Promise((resolve) => setTimeout(resolve, retryDelay * (attempt + 1)))
            continue
          }
        } else {
          lastError = {
            message: error.message || 'Une erreur inattendue est survenue',
            code: 'UNKNOWN_ERROR',
          }
        }
      }
    }

    return {
      data: null,
      error: lastError || {
        message: 'Erreur inconnue après plusieurs tentatives',
        code: 'MAX_RETRIES_EXCEEDED',
      },
    }
  }

  /**
   * GET request
   */
  async get<T>(path: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(path, { ...options, method: 'GET' })
  }

  /**
   * POST request
   */
  async post<T>(path: string, body?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  /**
   * PUT request
   */
  async put<T>(path: string, body?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  /**
   * DELETE request
   */
  async delete<T>(path: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(path, { ...options, method: 'DELETE' })
  }
}

// Instance singleton
export const apiClient = new ApiClient(API_URL)

