import { z } from "zod"

// ============================================
// SCHEMAS DE VALIDATION ZOD
// Alignés sur les colonnes Supabase (snake_case, valeurs en français)
// ============================================

// Schema UUID (pour les IDs)
export const uuidSchema = z.string().uuid({ message: "ID invalide" })

// ============================================
// ANIMALS (Cheptel) - Table: pigs
// ============================================

// Catégories Supabase: "truie" | "verrat" | "porcelet" | "porc_engraissement"
export const pigCategorySchema = z.enum(["truie", "verrat", "porcelet", "porc_engraissement"], {
  errorMap: () => ({ message: "Catégorie invalide (truie, verrat, porcelet, porc_engraissement)" }),
})

// Status Supabase: "actif" | "vendu" | "mort" | "reforme"
export const pigStatusSchema = z.enum(["actif", "vendu", "mort", "reforme"], {
  errorMap: () => ({ message: "Statut invalide (actif, vendu, mort, reforme)" }),
})

export const createAnimalSchema = z.object({
  tag_number: z
    .string()
    .min(1, "L'identifiant est obligatoire")
    .max(50, "L'identifiant ne doit pas dépasser 50 caractères"),
  name: z.string().min(1, "Le nom est obligatoire").max(100, "Le nom ne doit pas dépasser 100 caractères"),
  category: pigCategorySchema,
  breed: z.string().max(50, "La race ne doit pas dépasser 50 caractères").optional().nullable(),
  birth_date: z.string().optional().nullable(),
  weight: z.number().min(0, "Le poids doit être positif").max(500, "Poids invalide").optional().nullable(),
  status: pigStatusSchema.optional().default("actif"),
  mother_id: z.string().uuid("ID de la mère invalide").optional().nullable(),
  father_id: z.string().uuid("ID du père invalide").optional().nullable(),
  acquisition_date: z.string().optional().nullable(),
  acquisition_price: z.number().min(0, "Le prix doit être positif").optional().nullable(),
  notes: z.string().max(1000, "Les notes ne doivent pas dépasser 1000 caractères").optional().nullable(),
})

export const updateAnimalSchema = createAnimalSchema.partial()

// ============================================
// HEALTH CASES (Cas de santé) - Table: health_records
// ============================================

// Type de record Supabase: "maladie" | "vaccination" | "traitement" | "observation"
export const healthRecordTypeSchema = z.enum(["maladie", "vaccination", "traitement", "observation"], {
  errorMap: () => ({ message: "Type invalide (maladie, vaccination, traitement, observation)" }),
})

// Sévérité Supabase: "faible" | "modere" | "grave" | "critique"
export const healthSeveritySchema = z.enum(["faible", "modere", "grave", "critique"], {
  errorMap: () => ({ message: "Sévérité invalide (faible, modere, grave, critique)" }),
})

// Status santé Supabase: "en_cours" | "resolu" | "chronique"
export const healthStatusSchema = z.enum(["en_cours", "resolu", "chronique"], {
  errorMap: () => ({ message: "Statut invalide (en_cours, resolu, chronique)" }),
})

export const createHealthCaseSchema = z.object({
  pig_id: z.string().uuid("ID de l'animal invalide"),
  record_type: healthRecordTypeSchema.optional().default("maladie"),
  title: z.string().min(1, "Le titre est obligatoire").max(200, "Titre trop long"),
  description: z
    .string()
    .max(2000, "La description ne doit pas dépasser 2000 caractères")
    .optional()
    .nullable(),
  diagnosis: z.string().max(500, "Le diagnostic ne doit pas dépasser 500 caractères").optional().nullable(),
  treatment: z.string().max(2000, "Le traitement ne doit pas dépasser 2000 caractères").optional().nullable(),
  medication: z.string().max(200, "Le médicament ne doit pas dépasser 200 caractères").optional().nullable(),
  dosage: z.string().max(100, "Le dosage ne doit pas dépasser 100 caractères").optional().nullable(),
  veterinarian: z.string().max(100, "Nom du vétérinaire trop long").optional().nullable(),
  cost: z.number().min(0, "Le coût doit être positif").optional().nullable(),
  photo_url: z.string().url("URL de photo invalide").optional().nullable(),
  severity: healthSeveritySchema.optional().default("modere"),
  status: healthStatusSchema.optional().default("en_cours"),
  start_date: z.string().min(1, "La date de début est obligatoire"),
  end_date: z.string().optional().nullable(),
  next_checkup: z.string().optional().nullable(),
})

export const updateHealthCaseSchema = createHealthCaseSchema.partial()

// ============================================
// GESTATIONS (Reproduction) - Table: gestations
// ============================================

// Status gestation Supabase: "en_cours" | "terminee" | "avortee"
export const gestationStatusSchema = z.enum(["en_cours", "terminee", "avortee"], {
  errorMap: () => ({ message: "Statut invalide (en_cours, terminee, avortee)" }),
})

export const createGestationSchema = z.object({
  sow_id: z.string().uuid("ID de la truie invalide"),
  boar_id: z.string().uuid("ID du verrat invalide").optional().nullable(),
  mating_date: z.string().min(1, "La date de saillie est obligatoire"),
  expected_farrowing_date: z.string().min(1, "La date prévue de mise-bas est obligatoire"),
  notes: z.string().max(1000, "Les notes ne doivent pas dépasser 1000 caractères").optional().nullable(),
})

export const updateGestationSchema = z.object({
  sow_id: z.string().uuid("ID de la truie invalide").optional(),
  boar_id: z.string().uuid("ID du verrat invalide").optional().nullable(),
  mating_date: z.string().optional(),
  expected_farrowing_date: z.string().optional(),
  actual_farrowing_date: z.string().optional().nullable(),
  status: gestationStatusSchema.optional(),
  piglets_born: z.number().int().min(0).max(30).optional().nullable(),
  piglets_alive: z.number().int().min(0).max(30).optional().nullable(),
  piglets_dead: z.number().int().min(0).max(30).optional().nullable(),
  notes: z.string().max(1000, "Les notes ne doivent pas dépasser 1000 caractères").optional().nullable(),
})

// ============================================
// CHAT (Assistant IA)
// ============================================

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().max(10000, "Message trop long"),
  image: z.string().optional(),
})

export const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1, "Au moins un message requis").max(50, "Trop de messages"),
  livestockContext: z.string().max(5000, "Contexte trop long").optional(),
  hasImage: z.boolean().optional(),
})

// ============================================
// HELPER POUR FORMATER LES ERREURS ZOD
// ============================================

export function formatZodErrors(error: z.ZodError): string {
  const errors = error.errors.map((e) => {
    const path = e.path.join(".")
    return path ? `${path}: ${e.message}` : e.message
  })
  return errors.join(", ")
}

// ============================================
// TYPES EXPORTES - Schémas
// ============================================

export type CreateAnimalInput = z.infer<typeof createAnimalSchema>
export type UpdateAnimalInput = z.infer<typeof updateAnimalSchema>
export type CreateHealthCaseInput = z.infer<typeof createHealthCaseSchema>
export type UpdateHealthCaseInput = z.infer<typeof updateHealthCaseSchema>
export type CreateGestationInput = z.infer<typeof createGestationSchema>
export type UpdateGestationInput = z.infer<typeof updateGestationSchema>
export type ChatRequestInput = z.infer<typeof chatRequestSchema>

// ============================================
// TYPES EXPORTES - Enums alignés sur Supabase
// ============================================

// Catégories d'animaux (pigs.category)
export type PigCategory = z.infer<typeof pigCategorySchema>
export const PIG_CATEGORIES: readonly PigCategory[] = ["truie", "verrat", "porcelet", "porc_engraissement"]

// Statuts d'animaux (pigs.status)
export type PigStatus = z.infer<typeof pigStatusSchema>
export const PIG_STATUSES: readonly PigStatus[] = ["actif", "vendu", "mort", "reforme"]

// Types de dossiers santé (health_records.record_type)
export type HealthRecordType = z.infer<typeof healthRecordTypeSchema>
export const HEALTH_RECORD_TYPES: readonly HealthRecordType[] = ["maladie", "vaccination", "traitement", "observation"]

// Sévérité santé (health_records.severity)
export type HealthSeverity = z.infer<typeof healthSeveritySchema>
export const HEALTH_SEVERITIES: readonly HealthSeverity[] = ["faible", "modere", "grave", "critique"]

// Statuts santé (health_records.status)
export type HealthStatus = z.infer<typeof healthStatusSchema>
export const HEALTH_STATUSES: readonly HealthStatus[] = ["en_cours", "resolu", "chronique"]

// Statuts gestation (gestations.status)
export type GestationStatus = z.infer<typeof gestationStatusSchema>
export const GESTATION_STATUSES: readonly GestationStatus[] = ["en_cours", "terminee", "avortee"]

// ============================================
// LABELS FRANÇAIS POUR L'UI
// ============================================

export const PIG_CATEGORY_LABELS: Record<PigCategory, string> = {
  truie: "Truie",
  verrat: "Verrat",
  porcelet: "Porcelet",
  porc_engraissement: "Porc d'engraissement",
}

export const PIG_STATUS_LABELS: Record<PigStatus, string> = {
  actif: "Actif",
  vendu: "Vendu",
  mort: "Mort",
  reforme: "Réformé",
}

export const HEALTH_RECORD_TYPE_LABELS: Record<HealthRecordType, string> = {
  maladie: "Maladie",
  vaccination: "Vaccination",
  traitement: "Traitement",
  observation: "Observation",
}

export const HEALTH_SEVERITY_LABELS: Record<HealthSeverity, string> = {
  faible: "Faible",
  modere: "Modéré",
  grave: "Grave",
  critique: "Critique",
}

export const HEALTH_STATUS_LABELS: Record<HealthStatus, string> = {
  en_cours: "En cours",
  resolu: "Résolu",
  chronique: "Chronique",
}

export const GESTATION_STATUS_LABELS: Record<GestationStatus, string> = {
  en_cours: "En cours",
  terminee: "Terminée",
  avortee: "Avortée",
}
