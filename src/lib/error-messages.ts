/**
 * Messages d'erreur en français pour l'application
 */

export const ERROR_MESSAGES = {
  // Authentification
  AUTH_REQUIRED: 'Vous devez être connecté pour effectuer cette action',
  AUTH_FAILED: 'Échec de l\'authentification. Vérifiez vos identifiants.',
  SESSION_EXPIRED: 'Votre session a expiré. Veuillez vous reconnecter.',
  PASSWORD_COMPROMISED: 'Ce mot de passe a été compromis dans une fuite de données. Veuillez en choisir un autre.',
  PASSWORD_WEAK: 'Le mot de passe ne respecte pas les critères de sécurité requis.',

  // Porcs
  PIG_LOAD_ERROR: 'Erreur lors du chargement des porcs',
  PIG_ADD_ERROR: 'Erreur lors de l\'ajout du porc',
  PIG_UPDATE_ERROR: 'Erreur lors de la mise à jour du porc',
  PIG_DELETE_ERROR: 'Erreur lors de la suppression du porc',
  PIG_NOT_FOUND: 'Porc introuvable',
  PIG_VALIDATION_ERROR: 'Les données du porc sont invalides',

  // Formulations
  FORMULATION_GENERATE_ERROR: 'Erreur lors de la génération de la formulation',
  FORMULATION_SAVE_ERROR: 'Erreur lors de la sauvegarde de la formulation',
  FORMULATION_LIMIT_REACHED: 'Limite de formulations atteinte. Passez en Premium pour continuer.',
  FORMULATION_VALIDATION_ERROR: 'Les paramètres de formulation sont invalides',

  // API
  API_ERROR: 'Erreur lors de la communication avec le serveur',
  API_TIMEOUT: 'La requête a pris trop de temps. Veuillez réessayer.',
  API_RATE_LIMIT: 'Trop de requêtes. Veuillez patienter quelques instants.',

  // Fichiers
  FILE_TOO_LARGE: 'Le fichier est trop volumineux. Taille maximale: 5MB',
  FILE_INVALID_TYPE: 'Type de fichier non supporté. Utilisez JPG, PNG ou WebP',
  FILE_UPLOAD_ERROR: 'Erreur lors du téléchargement du fichier',

  // Général
  NETWORK_ERROR: 'Erreur de connexion. Vérifiez votre connexion internet.',
  UNKNOWN_ERROR: 'Une erreur inattendue s\'est produite',
  VALIDATION_ERROR: 'Veuillez corriger les erreurs dans le formulaire',
  REQUIRED_FIELD: 'Ce champ est obligatoire',
} as const;

/**
 * Obtient un message d'erreur formaté
 */
export function getErrorMessage(key: keyof typeof ERROR_MESSAGES, fallback?: string): string {
  return ERROR_MESSAGES[key] || fallback || ERROR_MESSAGES.UNKNOWN_ERROR;
}

/**
 * Formate un message d'erreur avec des détails
 */
export function formatError(message: string, details?: string): string {
  if (details) {
    return `${message}: ${details}`;
  }
  return message;
}

