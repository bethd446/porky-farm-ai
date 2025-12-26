import { z } from "zod"

// ============================================
// SCHEMAS DE VALIDATION ZOD
// ============================================

// Schema UUID (pour les IDs)
export const uuidSchema = z.string().uuid({ message: "ID invalide" })

// ============================================
// ANIMALS (Cheptel)
// ============================================

export const createAnimalSchema = z.object({
  identifier: z
    .string()
    .min(1, "L'identifiant est obligatoire")
    .max(50, "L'identifiant ne doit pas depasser 50 caracteres"),
  name: z.string().min(1, "Le nom est obligatoire").max(100, "Le nom ne doit pas depasser 100 caracteres"),
  category: z.enum(["sow", "boar", "piglet", "fattening"], {
    errorMap: () => ({ message: "Categorie invalide" }),
  }),
  breed: z.string().max(50, "La race ne doit pas depasser 50 caracteres").optional().nullable(),
  birth_date: z.string().optional().nullable(),
  weight: z.number().min(0, "Le poids doit etre positif").max(500, "Poids invalide").optional().nullable(),
  status: z.enum(["active", "sold", "deceased"]).optional().default("active"),
  health_status: z.enum(["healthy", "sick", "quarantine"]).optional().default("healthy"),
  photo: z.string().url("URL de photo invalide").optional().nullable(),
  mother_id: z.string().uuid("ID de la mere invalide").optional().nullable(),
  father_id: z.string().uuid("ID du pere invalide").optional().nullable(),
  notes: z.string().max(1000, "Les notes ne doivent pas depasser 1000 caracteres").optional().nullable(),
})

export const updateAnimalSchema = createAnimalSchema.partial()

// ============================================
// HEALTH CASES (Cas de sante)
// ============================================

export const createHealthCaseSchema = z.object({
  animal_id: z.string().uuid("ID de l'animal invalide"),
  animal_name: z.string().max(100, "Nom de l'animal trop long").optional().nullable(),
  issue: z.string().min(1, "Le probleme est obligatoire").max(200, "Description du probleme trop longue"),
  description: z
    .string()
    .min(1, "La description est obligatoire")
    .max(2000, "La description ne doit pas depasser 2000 caracteres"),
  priority: z.enum(["high", "medium", "low"]).optional().default("medium"),
  status: z.enum(["active", "resolved", "monitoring"]).optional().default("active"),
  treatment: z.string().max(2000, "Le traitement ne doit pas depasser 2000 caracteres").optional().nullable(),
  veterinarian: z.string().max(100, "Nom du veterinaire trop long").optional().nullable(),
  photo: z.string().url("URL de photo invalide").optional().nullable(),
  cost: z.number().min(0, "Le cout doit etre positif").optional().nullable(),
  start_date: z.string().optional().nullable(),
})

export const updateHealthCaseSchema = createHealthCaseSchema.partial()

// ============================================
// GESTATIONS (Reproduction)
// ============================================

export const createGestationSchema = z.object({
  sow_id: z.string().uuid("ID de la truie invalide"),
  sow_name: z.string().min(1, "Le nom de la truie est obligatoire").max(100, "Nom de la truie trop long"),
  boar_id: z.string().uuid("ID du verrat invalide").optional().nullable(),
  boar_name: z.string().max(100, "Nom du verrat trop long").optional().nullable(),
  breeding_date: z.string().min(1, "La date de saillie est obligatoire"),
  notes: z.string().max(1000, "Les notes ne doivent pas depasser 1000 caracteres").optional().nullable(),
})

export const updateGestationSchema = z.object({
  sow_id: z.string().uuid("ID de la truie invalide").optional(),
  sow_name: z.string().max(100, "Nom de la truie trop long").optional(),
  boar_id: z.string().uuid("ID du verrat invalide").optional().nullable(),
  boar_name: z.string().max(100, "Nom du verrat trop long").optional().nullable(),
  breeding_date: z.string().optional(),
  expected_due_date: z.string().optional(),
  actual_due_date: z.string().optional().nullable(),
  status: z.enum(["active", "completed", "failed"]).optional(),
  piglet_count: z.number().int().min(0).max(30).optional().nullable(),
  piglets_survived: z.number().int().min(0).max(30).optional().nullable(),
  notes: z.string().max(1000, "Les notes ne doivent pas depasser 1000 caracteres").optional().nullable(),
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
// TYPES EXPORTES
// ============================================

export type CreateAnimalInput = z.infer<typeof createAnimalSchema>
export type UpdateAnimalInput = z.infer<typeof updateAnimalSchema>
export type CreateHealthCaseInput = z.infer<typeof createHealthCaseSchema>
export type UpdateHealthCaseInput = z.infer<typeof updateHealthCaseSchema>
export type CreateGestationInput = z.infer<typeof createGestationSchema>
export type UpdateGestationInput = z.infer<typeof updateGestationSchema>
export type ChatRequestInput = z.infer<typeof chatRequestSchema>
