/**
 * Helper Supabase pour les cas de santé (health_cases)
 * Migration de localStorage vers Supabase
 */

import { supabase } from "./client";
import type { HealthCase } from "@/lib/storage/local-database";

/**
 * Mapper le type local HealthCase vers le format Supabase
 */
function mapHealthCaseToSupabase(
  healthCase: Omit<HealthCase, "id" | "createdAt">,
  userId: string
) {
  // Mapper priority: "low" | "medium" | "high" | "critical" -> "faible" | "modere" | "grave" | "critique"
  const severityMap: Record<
    HealthCase["priority"],
    "faible" | "modere" | "grave" | "critique"
  > = {
    low: "faible",
    medium: "modere",
    high: "grave",
    critical: "critique",
  };

  // Mapper status: "open" | "in_progress" | "resolved" -> "en_cours" | "resolu" | "chronique"
  const statusMap: Record<
    HealthCase["status"],
    "en_cours" | "resolu" | "chronique"
  > = {
    open: "en_cours",
    in_progress: "en_cours",
    resolved: "resolu",
  };

  return {
    user_id: userId,
    pig_id: healthCase.animalId,
    record_type: "maladie" as const,
    title: healthCase.issue,
    description: healthCase.description || healthCase.issue,
    diagnosis: null,
    treatment: healthCase.treatment || null,
    medication: null,
    dosage: null,
    veterinarian: healthCase.veterinarian || null,
    cost: healthCase.cost || null,
    photo_url: healthCase.photo || null,
    severity: severityMap[healthCase.priority],
    status: statusMap[healthCase.status],
    start_date: healthCase.startDate,
    end_date: healthCase.resolvedDate || null,
    next_checkup: null,
  };
}

/**
 * Mapper le format Supabase vers le type local HealthCase
 */
function mapSupabaseToHealthCase(row: any, animalName: string): HealthCase {
  // Mapper severity: "faible" | "modere" | "grave" | "critique" -> "low" | "medium" | "high" | "critical"
  const severityMap: Record<string, HealthCase["priority"]> = {
    faible: "low",
    modere: "medium",
    grave: "high",
    critique: "critical",
  };

  // Mapper status: "en_cours" | "resolu" | "chronique" -> "open" | "in_progress" | "resolved"
  const statusMap: Record<string, HealthCase["status"]> = {
    en_cours: "in_progress",
    resolu: "resolved",
    chronique: "in_progress",
  };

  return {
    id: row.id,
    animalId: row.pig_id,
    animalName: animalName,
    issue: row.title,
    description: row.description || row.title,
    priority: severityMap[row.severity] || "medium",
    status: statusMap[row.status] || "open",
    treatment: row.treatment || undefined,
    veterinarian: row.veterinarian || undefined,
    photo: row.photo_url || undefined,
    cost: row.cost || undefined,
    startDate: row.start_date,
    resolvedDate: row.end_date || undefined,
    createdAt: row.created_at,
  };
}

/**
 * Récupérer tous les cas de santé pour un utilisateur
 */
export async function getHealthCases(userId: string): Promise<HealthCase[]> {
  try {
    if (!userId) {
      console.warn("[Supabase] getHealthCases: userId is missing");
      return [];
    }

    // Vérifier que Supabase est configuré
    const { isSupabaseConfigured } = await import("./client");
    if (!isSupabaseConfigured()) {
      console.warn("[Supabase] getHealthCases: Supabase not configured");
      return [];
    }

    // Vérifier la session utilisateur
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      console.warn("[Supabase] getHealthCases: No active session");
      return [];
    }

    // Essayer d'abord une requête simple pour vérifier si la table existe
    const { data, error } = await supabase
      .from("health_records")
      .select("id")
      .eq("user_id", userId)
      .limit(1);

    // Si erreur, vérifier si c'est parce que la table n'existe pas
    if (error) {
      const errorCode = error.code || "";
      const errorMessage = error.message || "";

      // Si la table n'existe pas (code 42P01) ou permission refusée (code 42501)
      if (
        errorCode === "42P01" ||
        errorMessage.includes("does not exist") ||
        errorCode === "42501" ||
        errorMessage.includes("permission denied")
      ) {
        console.warn(
          "[Supabase] Table health_records may not exist or RLS policies not set. Error:",
          {
            code: errorCode,
            message: errorMessage,
            hint: "Run migrations 001-create-tables.sql and 006-fix-health-records-schema.sql",
          }
        );
        return [];
      }

      // Log détaillé de l'erreur
      console.error("[Supabase] Error fetching health cases:", {
        message: errorMessage,
        details: error.details || "No details",
        hint: error.hint || "No hint",
        code: errorCode,
        userId,
        table: "health_records",
      });
      return [];
    }

    // Si pas d'erreur, faire la vraie requête avec tous les champs
    const { data: fullData, error: fullError } = await supabase
      .from("health_records")
      .select("*")
      .eq("user_id", userId)
      .eq("record_type", "maladie")
      .order("created_at", { ascending: false });

    if (fullError) {
      console.error("[Supabase] Error fetching full health cases:", {
        message: fullError.message || "No message",
        details: fullError.details || "No details",
        hint: fullError.hint || "No hint",
        code: fullError.code || "No code",
        userId,
      });
      return [];
    }

    if (!fullData) {
      console.warn("[Supabase] getHealthCases: No data returned");
      return [];
    }

    // Si pas de données, retourner un tableau vide
    if (fullData.length === 0) {
      return [];
    }

    // Utiliser fullData au lieu de data
    const dataToProcess = fullData;

    if (!data) {
      console.warn("[Supabase] getHealthCases: No data returned");
      return [];
    }

    // Si pas de données, retourner un tableau vide
    if (data.length === 0) {
      return [];
    }

    // Récupérer les noms des animaux pour le mapping
    const animalIds = [
      ...new Set(dataToProcess.map((r) => r.pig_id).filter(Boolean)),
    ];

    if (animalIds.length === 0) {
      // Si aucun animal_id, retourner les cas sans nom d'animal
      return dataToProcess.map((row) =>
        mapSupabaseToHealthCase(row, "Animal inconnu")
      );
    }

    const { data: animals, error: animalsError } = await supabase
      .from("pigs")
      .select("id, name")
      .in("id", animalIds);

    if (animalsError) {
      console.error("[Supabase] Error fetching animals for health cases:", {
        message: animalsError.message,
        details: animalsError.details,
        code: animalsError.code,
      });
    }

    const animalMap = new Map(animals?.map((a) => [a.id, a.name]) || []);

    return dataToProcess.map((row) =>
      mapSupabaseToHealthCase(
        row,
        animalMap.get(row.pig_id) || "Animal inconnu"
      )
    );
  } catch (error) {
    console.error("[Supabase] Exception in getHealthCases:", {
      error,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      userId,
    });
    return [];
  }
}

/**
 * Créer un nouveau cas de santé
 */
export async function createHealthCase(
  healthCase: Omit<HealthCase, "id" | "createdAt">,
  userId: string
): Promise<HealthCase | null> {
  try {
    const supabaseData = mapHealthCaseToSupabase(healthCase, userId);

    const { data, error } = await supabase
      .from("health_records")
      .insert(supabaseData)
      .select()
      .single();

    if (error) {
      console.error("[Supabase] Error creating health case:", error);
      throw error;
    }

    if (!data) return null;

    // Récupérer le nom de l'animal
    const { data: animal } = await supabase
      .from("pigs")
      .select("name")
      .eq("id", healthCase.animalId)
      .single();

    return mapSupabaseToHealthCase(data, animal?.name || healthCase.animalName);
  } catch (error) {
    console.error("[Supabase] Exception in createHealthCase:", error);
    return null;
  }
}

/**
 * Mettre à jour un cas de santé
 */
export async function updateHealthCase(
  id: string,
  updates: Partial<HealthCase>,
  userId: string
): Promise<HealthCase | null> {
  try {
    const updateData: any = {};

    if (updates.priority) {
      const severityMap: Record<HealthCase["priority"], string> = {
        low: "faible",
        medium: "modere",
        high: "grave",
        critical: "critique",
      };
      updateData.severity = severityMap[updates.priority];
    }

    if (updates.status) {
      const statusMap: Record<HealthCase["status"], string> = {
        open: "en_cours",
        in_progress: "en_cours",
        resolved: "resolu",
      };
      updateData.status = statusMap[updates.status];
    }

    if (updates.treatment !== undefined)
      updateData.treatment = updates.treatment;
    if (updates.resolvedDate !== undefined)
      updateData.end_date = updates.resolvedDate;
    if (updates.issue) updateData.title = updates.issue;
    if (updates.description) updateData.description = updates.description;

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("health_records")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      console.error("[Supabase] Error updating health case:", error);
      throw error;
    }

    if (!data) return null;

    // Récupérer le nom de l'animal
    const { data: animal } = await supabase
      .from("pigs")
      .select("name")
      .eq("id", data.pig_id)
      .single();

    return mapSupabaseToHealthCase(data, animal?.name || "Animal inconnu");
  } catch (error) {
    console.error("[Supabase] Exception in updateHealthCase:", error);
    return null;
  }
}

/**
 * Supprimer un cas de santé
 */
export async function deleteHealthCase(
  id: string,
  userId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("health_records")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      console.error("[Supabase] Error deleting health case:", error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error("[Supabase] Exception in deleteHealthCase:", error);
    return false;
  }
}
