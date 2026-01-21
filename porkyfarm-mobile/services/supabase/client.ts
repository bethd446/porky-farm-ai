import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { logger } from '../../lib/logger'

// Variables d'environnement avec fallback placeholder pour éviter le crash
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY || ''

// Flag pour savoir si Supabase est correctement configuré
export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseKey && supabaseUrl.includes('supabase.co'))
}

// Log d'erreur si variables manquantes
if (!isSupabaseConfigured()) {
  logger.error('[SupabaseClient] ERREUR: Variables Supabase manquantes ou invalides!')
  logger.error('[SupabaseClient] URL:', supabaseUrl ? 'présente' : 'MANQUANTE')
  logger.error('[SupabaseClient] Key:', supabaseKey ? 'présente' : 'MANQUANTE')
  logger.error('[SupabaseClient] Vérifiez eas.json contient les variables env')
}

// Log de diagnostic en développement
if (__DEV__ && isSupabaseConfigured()) {
  try {
    const projectId = new URL(supabaseUrl).hostname.split('.')[0]
    logger.debug('[SupabaseClient] Projet:', projectId)
    logger.debug('[SupabaseClient] Config OK')
  } catch {
    logger.debug('[SupabaseClient] URL présente')
  }
}

// Créer le client Supabase avec placeholder si non configuré (évite le crash)
let supabase: SupabaseClient

if (isSupabaseConfigured()) {
  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  })
} else {
  // Client placeholder pour éviter le crash - toutes les opérations échoueront gracieusement
  supabase = createClient(
    'https://placeholder.supabase.co',
    'placeholder-key-that-will-fail',
    {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    }
  )
}

export { supabase }
export default supabase
