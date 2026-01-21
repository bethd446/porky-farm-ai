/**
 * Wording unifié pour toute l'application
 * Garantit la cohérence du vocabulaire métier
 */

export const Wording = {
  // Navigation
  tabs: {
    home: 'Accueil',
    livestock: 'Mon cheptel',
    add: 'Ajouter',
    reports: 'Rapports',
    assistant: 'Assistant IA',
  },

  // Catégories d'animaux
  categories: {
    sow: 'Truie',
    boar: 'Verrat',
    piglet: 'Porcelet',
    fattening: 'Porc d\'engraissement',
  },

  // Statuts
  status: {
    active: 'Actif',
    inactive: 'Inactif',
    sold: 'Vendu',
    deceased: 'Décédé',
  },

  // Santé
  health: {
    title: 'Santé',
    add: 'Ajouter un cas de santé',
    severity: {
      critical: 'Critique',
      high: 'Haute',
      medium: 'Moyenne',
      low: 'Faible',
    },
    status: {
      ongoing: 'En cours',
      resolved: 'Résolu',
      scheduled: 'Planifié',
      chronic: 'Chronique',
    },
  },

  // Reproduction
  reproduction: {
    title: 'Reproduction',
    add: 'Ajouter une gestation',
    status: {
      pregnant: 'En gestation',
      farrowed: 'Mise-bas',
      weaning: 'Sevrage',
      completed: 'Terminée',
      aborted: 'Avortée',
    },
  },

  // Alimentation
  feeding: {
    title: 'Alimentation',
    addStock: 'Ajouter du stock',
    lowStock: 'Stock faible',
  },

  // Coûts
  costs: {
    title: 'Coûts et Finances',
    add: 'Ajouter une transaction',
    revenue: 'Revenus',
    expenses: 'Dépenses',
    balance: 'Balance',
  },

  // Onboarding
  onboarding: {
    welcome: {
      title: 'Bienvenue sur PorkyFarm',
      subtitle: 'Gérez votre élevage porcin en toute simplicité',
    },
    herdSize: {
      title: 'Taille du cheptel',
      subtitle: 'Combien d\'animaux avez-vous au total ?',
      hint: 'Incluez toutes les truies, verrats, porcelets, porcs d\'engraissement, etc.',
    },
    breeds: {
      title: 'Races élevées',
      subtitle: 'Quelles races élevez-vous ?',
    },
    breedingStructure: {
      title: 'Structure d\'élevage',
      subtitle: 'Répartition de votre cheptel',
    },
    farmSize: {
      title: 'Superficie de la ferme',
      subtitle: 'Quelle est la superficie de votre exploitation ?',
    },
  },

  // Messages d'erreur utilisateur-friendly
  errors: {
    network: 'Vérifiez votre connexion internet et réessayez',
    generic: 'Une erreur est survenue. Veuillez réessayer.',
    notAvailable: 'Cette fonctionnalité sera bientôt disponible',
    tableNotFound: 'Les données ne sont pas encore disponibles',
  },

  // Messages de succès
  success: {
    saved: 'Données sauvegardées avec succès',
    created: 'Créé avec succès',
    updated: 'Mis à jour avec succès',
    deleted: 'Supprimé avec succès',
  },
} as const

