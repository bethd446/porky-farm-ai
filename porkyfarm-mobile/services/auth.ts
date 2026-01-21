/**
 * Service d'Authentification Simplifie - PorkyFarm
 * Anonymous Sign-in + Magic Link (100% GRATUIT)
 */

import { supabase } from './supabase/client'
import * as Linking from 'expo-linking'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { logger } from '../lib/logger'
import { normalizeError } from '../lib/utils/errors'
import type { User } from '@supabase/supabase-js'

const AUTH_STATE_KEY = '@porkyfarm:auth_state'

export interface AuthState {
  isAnonymous: boolean
  email: string | null
  userId: string | null
}

export const authService = {
  /**
   * Demarrage rapide - Connexion anonyme
   * L'utilisateur peut commencer immediatement sans rien entrer
   */
  async signInAnonymously(): Promise<{ user: User | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.auth.signInAnonymously()

      if (error) throw error

      // Sauvegarder l'etat
      await AsyncStorage.setItem(
        AUTH_STATE_KEY,
        JSON.stringify({
          isAnonymous: true,
          email: null,
          userId: data.user?.id,
        })
      )

      return { user: data.user, error: null }
    } catch (error) {
      logger.error('[Auth] signInAnonymously error:', error)
      return { user: null, error: normalizeError(error) }
    }
  },

  /**
   * Lier un email au compte anonyme
   * Transforme un compte anonyme en compte permanent
   */
  async linkEmail(email: string): Promise<{ error: Error | null }> {
    try {
      const redirectUrl = Linking.createURL('auth/callback')

      // Mettre a jour l'utilisateur avec l'email
      const { error } = await supabase.auth.updateUser(
        { email },
        { emailRedirectTo: redirectUrl }
      )

      if (error) throw error

      return { error: null }
    } catch (error) {
      logger.error('[Auth] linkEmail error:', error)
      return { error: normalizeError(error) }
    }
  },

  /**
   * Confirmer le lien email (apres clic sur Magic Link)
   */
  async confirmEmailLink(): Promise<{ error: Error | null }> {
    try {
      // Mettre a jour l'etat local
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user?.email) {
        await AsyncStorage.setItem(
          AUTH_STATE_KEY,
          JSON.stringify({
            isAnonymous: false,
            email: user.email,
            userId: user.id,
          })
        )
      }

      return { error: null }
    } catch (error) {
      logger.error('[Auth] confirmEmailLink error:', error)
      return { error: normalizeError(error) }
    }
  },

  /**
   * Connexion avec Magic Link (utilisateur existant)
   */
  async signInWithMagicLink(email: string): Promise<{ error: Error | null }> {
    try {
      const redirectUrl = Linking.createURL('auth/callback')

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectUrl,
        },
      })

      if (error) throw error

      return { error: null }
    } catch (error) {
      logger.error('[Auth] signInWithMagicLink error:', error)
      return { error: normalizeError(error) }
    }
  },

  /**
   * Inscription avec email/password
   */
  async signUp(email: string, password: string, metadata?: Record<string, unknown>): Promise<{ user: User | null; error: Error | null }> {
    try {
      logger.debug('[Auth] signUp: start', { email })
      const redirectUrl = Linking.createURL('auth/callback')

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: metadata,
        },
      })

      if (error) {
        logger.error('[Auth] signUp error:', error)
        throw error
      }

      if (data.user) {
        logger.info('[Auth] signUp: success', { userId: data.user.id, email: data.user.email })
        await AsyncStorage.setItem(
          AUTH_STATE_KEY,
          JSON.stringify({
            isAnonymous: false,
            email: data.user.email,
            userId: data.user.id,
          })
        )
      } else {
        logger.warn('[Auth] signUp: no user returned')
      }

      return { user: data.user, error: null }
    } catch (error) {
      logger.error('[Auth] signUp error:', error)
      return { user: null, error: normalizeError(error) }
    }
  },

  /**
   * Connexion classique avec email/password (fallback)
   */
  async signInWithPassword(email: string, password: string): Promise<{ user: User | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        await AsyncStorage.setItem(
          AUTH_STATE_KEY,
          JSON.stringify({
            isAnonymous: false,
            email: data.user.email,
            userId: data.user.id,
          })
        )
      }

      return { user: data.user, error: null }
    } catch (error) {
      logger.error('[Auth] signInWithPassword error:', error)
      return { user: null, error: normalizeError(error) }
    }
  },

  /**
   * Verifier si l'utilisateur a un compte lie
   */
  async getAuthState(): Promise<AuthState> {
    try {
      const stored = await AsyncStorage.getItem(AUTH_STATE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }

      // Verifier avec Supabase
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const state: AuthState = {
          isAnonymous: user.is_anonymous ?? !user.email,
          email: user.email ?? null,
          userId: user.id,
        }
        await AsyncStorage.setItem(AUTH_STATE_KEY, JSON.stringify(state))
        return state
      }

      return { isAnonymous: true, email: null, userId: null }
    } catch {
      return { isAnonymous: true, email: null, userId: null }
    }
  },

  /**
   * Recuperer la session actuelle
   */
  async getSession() {
    return supabase.auth.getSession()
  },

  /**
   * Deconnexion
   */
  async signOut(): Promise<{ error: Error | null }> {
    try {
      await AsyncStorage.removeItem(AUTH_STATE_KEY)
      const { error } = await supabase.auth.signOut()
      return { error: error ? normalizeError(error) : null }
    } catch (error) {
      logger.error('[Auth] signOut error:', error)
      return { error: normalizeError(error) }
    }
  },

  /**
   * Ecouter les changements d'auth
   */
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  },
}
