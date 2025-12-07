import { z } from "zod"

// Messages d'erreur en français
const messages = {
  required: "Ce champ est requis",
  email: "Email invalide",
  minLength: (min: number) => `Minimum ${min} caractères`,
  maxLength: (max: number) => `Maximum ${max} caractères`,
  min: (min: number) => `La valeur minimale est ${min}`,
  max: (max: number) => `La valeur maximale est ${max}`,
  positive: "La valeur doit être positive",
  date: "Date invalide",
  phone: "Numéro de téléphone invalide",
}

// Schema Login
export const loginSchema = z.object({
  email: z.string().min(1, messages.required).email(messages.email),
  password: z.string().min(1, messages.required),
})

export type LoginFormData = z.infer<typeof loginSchema>

// Schema Register
export const registerSchema = z.object({
  name: z.string().min(1, messages.required).min(2, messages.minLength(2)).max(100, messages.maxLength(100)),
  email: z.string().min(1, messages.required).email(messages.email),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || /^(\+225|00225)?[0-9]{10}$/.test(val.replace(/\s/g, "")), messages.phone),
  password: z.string().min(1, messages.required).min(8, messages.minLength(8)).max(100, messages.maxLength(100)),
})

export type RegisterFormData = z.infer<typeof registerSchema>

// Schema Animal
export const animalSchema = z.object({
  name: z.string().min(1, messages.required).min(2, messages.minLength(2)).max(100, messages.maxLength(100)),
  tagNumber: z.string().min(1, messages.required).max(50, messages.maxLength(50)),
  category: z.enum(["truie", "verrat", "porcelet", "porc_engraissement"], {
    errorMap: () => ({ message: "Sélectionnez une catégorie" }),
  }),
  breed: z.string().optional(),
  birthDate: z.string().optional(),
  weight: z
    .string()
    .optional()
    .refine((val) => !val || (Number(val) >= 0.1 && Number(val) <= 500), "Le poids doit être entre 0.1 et 500 kg"),
  acquisitionDate: z.string().optional(),
  acquisitionPrice: z
    .string()
    .optional()
    .refine((val) => !val || Number(val) >= 0, messages.positive),
  motherId: z.string().optional(),
  fatherId: z.string().optional(),
  notes: z.string().max(1000, messages.maxLength(1000)).optional(),
})

export type AnimalFormData = z.infer<typeof animalSchema>

// Schema Health Case
export const healthCaseSchema = z.object({
  animal: z.string().min(1, "Sélectionnez un animal"),
  issue: z
    .string()
    .min(1, messages.required)
    .min(10, "Décrivez le problème en au moins 10 caractères")
    .max(500, messages.maxLength(500)),
  priority: z.enum(["Haute", "Moyenne", "Basse"], {
    errorMap: () => ({ message: "Sélectionnez une priorité" }),
  }),
  treatment: z.string().max(500, messages.maxLength(500)).optional(),
})

export type HealthCaseFormData = z.infer<typeof healthCaseSchema>

// Schema Gestation
export const gestationSchema = z.object({
  sow: z.string().min(1, "Sélectionnez ou entrez le nom de la truie"),
  boar: z.string().min(1, "Sélectionnez ou entrez le nom du verrat"),
  breedingDate: z.string().min(1, "La date de saillie est requise"),
  notes: z.string().max(500, messages.maxLength(500)).optional(),
})

export type GestationFormData = z.infer<typeof gestationSchema>

// Schema Feeding Calculator
export const feedingSchema = z.object({
  category: z.enum(["sow-gestating", "sow-lactating", "boar", "piglet", "fattening"]),
  weight: z
    .string()
    .min(1, messages.required)
    .refine((val) => Number(val) >= 1 && Number(val) <= 500, "Poids entre 1 et 500 kg"),
  stage: z.enum(["early", "mid", "late"]),
  count: z
    .string()
    .min(1, messages.required)
    .refine((val) => Number(val) >= 1 && Number(val) <= 1000, "Entre 1 et 1000 animaux"),
})

export type FeedingFormData = z.infer<typeof feedingSchema>

// Schema Settings Password
export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, messages.required),
    newPassword: z.string().min(8, messages.minLength(8)),
    confirmPassword: z.string().min(1, messages.required),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  })

export type PasswordFormData = z.infer<typeof passwordSchema>
