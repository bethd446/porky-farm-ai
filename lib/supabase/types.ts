export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          farm_name: string | null
          phone: string | null
          location: string | null
          is_admin: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          farm_name?: string | null
          phone?: string | null
          location?: string | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          farm_name?: string | null
          phone?: string | null
          location?: string | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      pigs: {
        Row: {
          id: string
          user_id: string
          name: string
          tag_number: string
          category: "truie" | "verrat" | "porcelet" | "porc_engraissement"
          breed: string | null
          birth_date: string | null
          weight: number | null
          status: "actif" | "vendu" | "mort" | "reforme"
          mother_id: string | null
          father_id: string | null
          acquisition_date: string | null
          acquisition_price: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          tag_number: string
          category: "truie" | "verrat" | "porcelet" | "porc_engraissement"
          breed?: string | null
          birth_date?: string | null
          weight?: number | null
          status?: "actif" | "vendu" | "mort" | "reforme"
          mother_id?: string | null
          father_id?: string | null
          acquisition_date?: string | null
          acquisition_price?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          tag_number?: string
          category?: "truie" | "verrat" | "porcelet" | "porc_engraissement"
          breed?: string | null
          birth_date?: string | null
          weight?: number | null
          status?: "actif" | "vendu" | "mort" | "reforme"
          mother_id?: string | null
          father_id?: string | null
          acquisition_date?: string | null
          acquisition_price?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      gestations: {
        Row: {
          id: string
          user_id: string
          sow_id: string
          boar_id: string | null
          mating_date: string
          expected_farrowing_date: string
          actual_farrowing_date: string | null
          status: "en_cours" | "terminee" | "avortee"
          piglets_born: number | null
          piglets_alive: number | null
          piglets_dead: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          sow_id: string
          boar_id?: string | null
          mating_date: string
          expected_farrowing_date: string
          actual_farrowing_date?: string | null
          status?: "en_cours" | "terminee" | "avortee"
          piglets_born?: number | null
          piglets_alive?: number | null
          piglets_dead?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          sow_id?: string
          boar_id?: string | null
          mating_date?: string
          expected_farrowing_date?: string
          actual_farrowing_date?: string | null
          status?: "en_cours" | "terminee" | "avortee"
          piglets_born?: number | null
          piglets_alive?: number | null
          piglets_dead?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      health_records: {
        Row: {
          id: string
          user_id: string
          pig_id: string
          record_type: "maladie" | "vaccination" | "traitement" | "observation"
          title: string
          description: string | null
          diagnosis: string | null
          treatment: string | null
          medication: string | null
          dosage: string | null
          veterinarian: string | null
          cost: number | null
          photo_url: string | null
          severity: "faible" | "modere" | "grave" | "critique"
          status: "en_cours" | "resolu" | "chronique"
          start_date: string
          end_date: string | null
          next_checkup: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          pig_id: string
          record_type: "maladie" | "vaccination" | "traitement" | "observation"
          title: string
          description?: string | null
          diagnosis?: string | null
          treatment?: string | null
          medication?: string | null
          dosage?: string | null
          veterinarian?: string | null
          cost?: number | null
          photo_url?: string | null
          severity?: "faible" | "modere" | "grave" | "critique"
          status?: "en_cours" | "resolu" | "chronique"
          start_date: string
          end_date?: string | null
          next_checkup?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          pig_id?: string
          record_type?: "maladie" | "vaccination" | "traitement" | "observation"
          title?: string
          description?: string | null
          diagnosis?: string | null
          treatment?: string | null
          medication?: string | null
          dosage?: string | null
          veterinarian?: string | null
          cost?: number | null
          photo_url?: string | null
          severity?: "faible" | "modere" | "grave" | "critique"
          status?: "en_cours" | "resolu" | "chronique"
          start_date?: string
          end_date?: string | null
          next_checkup?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      feed_formulations: {
        Row: {
          id: string
          user_id: string
          name: string
          target_category: "truie" | "verrat" | "porcelet" | "porc_engraissement"
          ingredients: Json
          nutritional_values: Json
          cost_per_kg: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          target_category: "truie" | "verrat" | "porcelet" | "porc_engraissement"
          ingredients: Json
          nutritional_values: Json
          cost_per_kg?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          target_category?: "truie" | "verrat" | "porcelet" | "porc_engraissement"
          ingredients?: Json
          nutritional_values?: Json
          cost_per_kg?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          user_id: string
          pig_id: string | null
          event_type:
            | "pesee"
            | "vaccination"
            | "traitement"
            | "saillie"
            | "mise_bas"
            | "sevrage"
            | "vente"
            | "deces"
            | "autre"
          title: string
          description: string | null
          event_date: string
          value: number | null
          unit: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          pig_id?: string | null
          event_type:
            | "pesee"
            | "vaccination"
            | "traitement"
            | "saillie"
            | "mise_bas"
            | "sevrage"
            | "vente"
            | "deces"
            | "autre"
          title: string
          description?: string | null
          event_date: string
          value?: number | null
          unit?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          pig_id?: string | null
          event_type?:
            | "pesee"
            | "vaccination"
            | "traitement"
            | "saillie"
            | "mise_bas"
            | "sevrage"
            | "vente"
            | "deces"
            | "autre"
          title?: string
          description?: string | null
          event_date?: string
          value?: number | null
          unit?: string | null
          created_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          pig_id: string | null
          transaction_type: "achat" | "vente" | "depense" | "revenu"
          category: string
          amount: number
          description: string | null
          transaction_date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          pig_id?: string | null
          transaction_type: "achat" | "vente" | "depense" | "revenu"
          category: string
          amount: number
          description?: string | null
          transaction_date: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          pig_id?: string | null
          transaction_type?: "achat" | "vente" | "depense" | "revenu"
          category?: string
          amount?: number
          description?: string | null
          transaction_date?: string
          created_at?: string
        }
      }
      pig_photos: {
        Row: {
          id: string
          pig_id: string
          user_id: string
          photo_url: string
          caption: string | null
          created_at: string
        }
        Insert: {
          id?: string
          pig_id: string
          user_id: string
          photo_url: string
          caption?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          pig_id?: string
          user_id?: string
          photo_url?: string
          caption?: string | null
          created_at?: string
        }
      }
      ai_insights: {
        Row: {
          id: string
          user_id: string
          insight_type: string
          title: string
          content: string
          priority: "faible" | "moyen" | "eleve"
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          insight_type: string
          title: string
          content: string
          priority?: "faible" | "moyen" | "eleve"
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          insight_type?: string
          title?: string
          content?: string
          priority?: "faible" | "moyen" | "eleve"
          is_read?: boolean
          created_at?: string
        }
      }
      breeding_records: {
        Row: {
          id: string
          user_id: string
          sow_id: string
          boar_id: string
          breeding_date: string
          breeding_type: "naturelle" | "insemination"
          success: boolean | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          sow_id: string
          boar_id: string
          breeding_date: string
          breeding_type?: "naturelle" | "insemination"
          success?: boolean | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          sow_id?: string
          boar_id?: string
          breeding_date?: string
          breeding_type?: "naturelle" | "insemination"
          success?: boolean | null
          notes?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"]
export type InsertTables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Insert"]
export type UpdateTables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Update"]

// Convenience types
export type Profile = Tables<"profiles">
export type Pig = Tables<"pigs">
export type Gestation = Tables<"gestations">
export type HealthRecord = Tables<"health_records">
export type FeedFormulation = Tables<"feed_formulations">
export type Event = Tables<"events">
export type Transaction = Tables<"transactions">
export type PigPhoto = Tables<"pig_photos">
export type AIInsight = Tables<"ai_insights">
export type BreedingRecord = Tables<"breeding_records">
