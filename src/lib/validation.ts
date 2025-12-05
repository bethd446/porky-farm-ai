import { z } from 'zod';
import { PIG_BREEDS, PIG_CATEGORIES } from './constants';

/**
 * Schema de validation pour l'ajout/modification d'un porc
 */
export const pigSchema = z.object({
  tag_number: z
    .string()
    .min(1, 'Le numéro d\'identification est requis')
    .max(50, 'Le numéro d\'identification ne peut pas dépasser 50 caractères')
    .regex(/^[A-Za-z0-9\-_]+$/, 'Le numéro d\'identification ne peut contenir que des lettres, chiffres, tirets et underscores'),
  sex: z.enum(['male', 'female'], {
    required_error: 'Le sexe est requis',
  }),
  breed: z
    .string()
    .nullable()
    .refine((val) => !val || PIG_BREEDS.includes(val as any), {
      message: 'Race invalide',
    })
    .optional(),
  birth_date: z
    .string()
    .nullable()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: 'Date de naissance invalide',
    })
    .optional(),
  status: z.enum(['active', 'sold', 'deceased', 'breeding'], {
    required_error: 'Le statut est requis',
  }),
  notes: z
    .string()
    .max(1000, 'Les notes ne peuvent pas dépasser 1000 caractères')
    .nullable()
    .optional(),
  initial_weight: z
    .string()
    .optional()
    .refine((val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) > 0 && parseFloat(val) <= 500), {
      message: 'Le poids doit être un nombre entre 0 et 500 kg',
    }),
});

/**
 * Schema de validation pour le formulaire de formulation
 */
export const formulationSchema = z.object({
  name: z
    .string()
    .max(100, 'Le nom ne peut pas dépasser 100 caractères')
    .optional(),
  pigCategory: z.enum(['piglet', 'grower', 'finisher', 'sow', 'boar'], {
    required_error: 'La catégorie de porc est requise',
  }),
  targetWeight: z
    .string()
    .min(1, 'Le poids cible est requis')
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0 && parseFloat(val) <= 500, {
      message: 'Le poids cible doit être un nombre entre 0 et 500 kg',
    }),
  budget: z
    .string()
    .optional()
    .refine((val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) > 0 && parseFloat(val) <= 10000), {
      message: 'Le budget doit être un nombre entre 0 et 10000 FCFA/kg',
    }),
  availableIngredients: z
    .string()
    .max(500, 'La liste d\'ingrédients ne peut pas dépasser 500 caractères')
    .optional(),
});

/**
 * Schema de validation pour la recherche
 */
export const searchSchema = z.object({
  search: z
    .string()
    .max(100, 'La recherche ne peut pas dépasser 100 caractères')
    .optional(),
});

/**
 * Fonction utilitaire pour sanitizer les entrées utilisateur
 * Supprime les balises HTML et les caractères dangereux
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/<[^>]*>/g, '') // Supprime les balises HTML
    .replace(/[<>]/g, '') // Supprime les chevrons restants
    .trim();
}

/**
 * Fonction utilitaire pour sanitizer les notes/descriptions
 */
export function sanitizeText(text: string | null | undefined): string | null {
  if (!text) return null;
  return sanitizeInput(text);
}

