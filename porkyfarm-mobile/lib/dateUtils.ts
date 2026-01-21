/**
 * Utilitaires centralisés pour la gestion des dates
 * Évite les problèmes de timezone et assure un format cohérent
 */

/**
 * Retourne la date du jour au format ISO (YYYY-MM-DD)
 * Utilise le timezone local pour éviter les décalages
 */
export function getTodayISO(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Convertit une Date en format ISO (YYYY-MM-DD)
 * @param date - Date à convertir
 */
export function toISODateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Retourne le timestamp ISO complet pour les champs updated_at/created_at
 */
export function getNowISO(): string {
  return new Date().toISOString()
}

/**
 * Parse une date depuis différents formats et retourne au format ISO
 * @param input - Date en string (YYYY-MM-DD, DD/MM/YYYY, ou DDMMYYYY)
 */
export function parseDateInput(input: string): string {
  // Si déjà au format ISO YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    return input
  }

  // Format DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(input)) {
    const [day, month, year] = input.split('/')
    return `${year}-${month}-${day}`
  }

  // Format DDMMYYYY (sans séparateur)
  if (/^\d{8}$/.test(input)) {
    const day = input.substring(0, 2)
    const month = input.substring(2, 4)
    const year = input.substring(4, 8)
    return `${year}-${month}-${day}`
  }

  // Sinon, retourner tel quel
  return input
}

/**
 * Formate une date ISO pour l'affichage en français
 * @param isoDate - Date au format YYYY-MM-DD ou ISO complet
 */
export function formatDateForDisplay(isoDate: string | null | undefined): string {
  if (!isoDate) return 'N/A'

  try {
    const date = new Date(isoDate)
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return 'Date invalide'
  }
}

/**
 * Formate une date ISO pour l'affichage court (JJ/MM/AAAA)
 */
export function formatDateShort(isoDate: string | null | undefined): string {
  if (!isoDate) return 'N/A'

  try {
    const date = new Date(isoDate)
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch {
    return 'N/A'
  }
}

/**
 * Calcule le nombre de jours entre deux dates
 */
export function daysBetween(startDate: string, endDate: string): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = end.getTime() - start.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Ajoute des jours à une date
 */
export function addDays(date: string, days: number): string {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return toISODateString(d)
}

/**
 * Retourne le début du mois courant
 */
export function getStartOfMonth(): string {
  const now = new Date()
  return toISODateString(new Date(now.getFullYear(), now.getMonth(), 1))
}

/**
 * Retourne le début de la semaine courante (lundi)
 */
export function getStartOfWeek(): string {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  return toISODateString(new Date(now.setDate(diff)))
}

/**
 * Retourne le début de l'année courante
 */
export function getStartOfYear(): string {
  const now = new Date()
  return toISODateString(new Date(now.getFullYear(), 0, 1))
}

/**
 * Formate une date ISO pour l'affichage avec heure
 */
export function formatDateTimeForDisplay(isoDate: string | null | undefined, locale = 'fr-FR'): string {
  if (!isoDate) return 'N/A'

  try {
    const date = new Date(isoDate)
    return date.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return 'Date invalide'
  }
}

/**
 * Formate une date pour la base de données (alias de toISODateString)
 * Gère les strings et les objets Date
 */
export function formatDateForDB(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) {
    throw new Error(`Invalid date: ${date}`)
  }
  return toISODateString(d)
}

/**
 * Version safe de formatDateForDB qui retourne null si la date est invalide
 * Utilisé dans les formulaires où la date peut être null/undefined
 */
export function safeDateForDB(date: Date | string | null | undefined): string | null {
  if (!date) return null
  try {
    if (date instanceof Date) {
      return toISODateString(date)
    }
    // Si c'est déjà une string au format ISO, la retourner
    if (typeof date === 'string') {
      if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return date
      }
      const d = new Date(date)
      if (!isNaN(d.getTime())) {
        return toISODateString(d)
      }
    }
    return null
  } catch {
    return null
  }
}

/**
 * Calcule l'âge en mois depuis une date de naissance
 */
export function getAgeInMonths(birthDate: string | null | undefined): number {
  if (!birthDate) return 0

  try {
    const birth = new Date(birthDate)
    if (isNaN(birth.getTime())) return 0

    const now = new Date()
    return Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 30))
  } catch {
    return 0
  }
}

/**
 * Formate l'âge de manière lisible
 */
export function formatAge(birthDate: string | null | undefined): string {
  if (!birthDate) return 'N/A'

  const months = getAgeInMonths(birthDate)

  if (months < 1) return 'Nouveau-né'
  if (months < 12) return `${months} mois`

  const years = Math.floor(months / 12)
  const remainingMonths = months % 12

  if (remainingMonths > 0) {
    return `${years}a ${remainingMonths}m`
  }
  return `${years} an${years > 1 ? 's' : ''}`
}

/**
 * Vérifie si une date est valide
 */
export function isValidDate(dateString: string | null | undefined): boolean {
  if (!dateString) return false
  const date = new Date(dateString)
  return !isNaN(date.getTime())
}
