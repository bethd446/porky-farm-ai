/**
 * Utilitaires de formatage pour l'application
 */

/**
 * Formate un montant en devise (FCFA)
 * @param value - Montant à formater
 * @returns Montant formaté avec suffixe (K, M)
 * @example
 * formatCurrency(2400000) // "2.4M"
 * formatCurrency(850000) // "850K"
 * formatCurrency(500) // "500"
 */
export function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}K`;
  }
  return value.toString();
}

/**
 * Formate un nombre avec séparateurs de milliers
 * @param value - Nombre à formater
 * @param locale - Locale à utiliser (défaut: 'fr-FR')
 * @returns Nombre formaté
 * @example
 * formatNumber(1234567) // "1 234 567"
 */
export function formatNumber(value: number, locale: string = 'fr-FR'): string {
  return value.toLocaleString(locale);
}

/**
 * Formate un montant avec séparateurs de milliers (format complet)
 * @param value - Montant à formater
 * @param locale - Locale à utiliser (défaut: 'fr-FR')
 * @returns Montant formaté avec séparateurs
 * @example
 * formatCurrencyFull(1234567) // "1 234 567"
 */
export function formatCurrencyFull(value: number, locale: string = 'fr-FR'): string {
  return new Intl.NumberFormat(locale).format(value);
}

/**
 * Formate un pourcentage
 * @param value - Valeur à formater (0-100)
 * @param decimals - Nombre de décimales (défaut: 1)
 * @returns Pourcentage formaté
 * @example
 * formatPercentage(12.5) // "12.5%"
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

