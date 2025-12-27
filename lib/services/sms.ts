/**
 * Service SMS utilisant Twilio API
 * Backend uniquement - jamais exposé côté client
 */

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
const TWILIO_FROM_NUMBER = process.env.TWILIO_FROM_NUMBER

export interface SmsResult {
  success: boolean
  messageId?: string
  error?: string
}

/**
 * Envoie un SMS d'alerte via Twilio
 * @param to Numéro de téléphone destinataire (format E.164, ex: +2250123456789)
 * @param message Message à envoyer
 * @returns Résultat de l'envoi
 */
export async function sendAlertSms(to: string, message: string): Promise<SmsResult> {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM_NUMBER) {
    console.warn('[SMS Service] Twilio non configuré')
    return {
      success: false,
      error: 'Service SMS non configuré. Veuillez ajouter les variables TWILIO_*',
    }
  }

  if (!to || !message) {
    return {
      success: false,
      error: 'Numéro de téléphone et message requis',
    }
  }

  // Valider le format du numéro (E.164)
  if (!to.startsWith('+')) {
    return {
      success: false,
      error: 'Le numéro doit être au format E.164 (ex: +2250123456789)',
    }
  }

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`

    const formData = new URLSearchParams()
    formData.append('From', TWILIO_FROM_NUMBER)
    formData.append('To', to)
    formData.append('Body', message)

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('[SMS Service] Twilio error:', errorData)
      return {
        success: false,
        error: errorData.message || `Erreur Twilio: ${response.status}`,
      }
    }

    const data = await response.json()

    return {
      success: true,
      messageId: data.sid,
    }
  } catch (err) {
    console.error('[SMS Service] Error:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Erreur inconnue lors de l\'envoi SMS',
    }
  }
}

/**
 * Vérifie si le service SMS est configuré
 */
export function isSmsConfigured(): boolean {
  return !!(TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_FROM_NUMBER)
}

/**
 * Formate un numéro de téléphone pour Twilio (E.164)
 * @param phone Numéro de téléphone (format flexible)
 * @returns Numéro formaté E.164 ou null si invalide
 */
export function formatPhoneNumber(phone: string): string | null {
  // Nettoyer le numéro
  let cleaned = phone.replace(/\s+/g, '').replace(/-/g, '')

  // Si commence par +, garder tel quel
  if (cleaned.startsWith('+')) {
    return cleaned
  }

  // Si commence par 00, remplacer par +
  if (cleaned.startsWith('00')) {
    cleaned = '+' + cleaned.substring(2)
    return cleaned
  }

  // Si numéro ivoirien (commence par 0), ajouter +225
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    return '+225' + cleaned.substring(1)
  }

  // Si numéro ivoirien sans 0 (9 chiffres), ajouter +225
  if (/^\d{9}$/.test(cleaned)) {
    return '+225' + cleaned
  }

  // Si déjà au format international sans +
  if (cleaned.startsWith('225') && cleaned.length === 12) {
    return '+' + cleaned
  }

  return null
}

