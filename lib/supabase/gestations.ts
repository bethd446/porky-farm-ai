/**
 * Helper Supabase pour les gestations
 * Migration de localStorage vers Supabase
 */

import { supabase } from "./client";
import type { Gestation } from "@/lib/storage/local-database";

/**
 * Mapper le type local Gestation vers le format Supabase
 */
function mapGestationToSupabase(
  gestation: Omit<Gestation, "id" | "createdAt" | "expectedDueDate">,
  userId: string
) {
  // Calculer la date prévue (114 jours après la saillie)
  const breedingDate = new Date(gestation.breedingDate);
  const expectedDueDate = new Date(breedingDate);
  expectedDueDate.setDate(expectedDueDate.getDate() + 114);

  // Mapper status: "active" | "completed" | "failed" -> "en_cours" | "terminee" | "avortee"
  const statusMap: Record<
    Gestation["status"],
    "en_cours" | "terminee" | "avortee"
  > = {
    active: "en_cours",
    completed: "terminee",
    failed: "avortee",
  };

  return {
    user_id: userId,
    sow_id: gestation.sowId,
    boar_id: gestation.boarId || null,
    mating_date: gestation.breedingDate,
    expected_farrowing_date: expectedDueDate.toISOString().split("T")[0],
    actual_farrowing_date: gestation.actualDueDate || null,
    status: statusMap[gestation.status] || "en_cours",
    piglets_born: gestation.pigletCount || null,
    piglets_alive: gestation.pigletsSurvived || null,
    piglets_dead:
      gestation.pigletCount && gestation.pigletsSurvived
        ? gestation.pigletCount - gestation.pigletsSurvived
        : null,
    notes: gestation.notes || null,
  };
}

/**
 * Mapper le format Supabase vers le type local Gestation
 */
function mapSupabaseToGestation(
  row: any,
  sowName: string,
  boarName?: string
): Gestation {
  // Mapper status: "en_cours" | "terminee" | "avortee" -> "active" | "completed" | "failed"
  const statusMap: Record<string, Gestation["status"]> = {
    en_cours: "active",
    terminee: "completed",
    avortee: "failed",
  };

  return {
    id: row.id,
    sowId: row.sow_id,
    sowName: sowName,
    boarId: row.boar_id || undefined,
    boarName: boarName || undefined,
    breedingDate: row.mating_date,
    expectedDueDate: row.expected_farrowing_date,
    actualDueDate: row.actual_farrowing_date || undefined,
    status: statusMap[row.status] || "active",
    pigletCount: row.piglets_born || undefined,
    pigletsSurvived: row.piglets_alive || undefined,
    notes: row.notes || undefined,
    createdAt: row.created_at,
  };
}

/**
 * Récupérer toutes les gestations pour un utilisateur
 */
export async function getGestations(userId: string): Promise<Gestation[]> {
  try {
    if (!userId) {
      console.warn("[Supabase] getGestations: userId is missing");
      return [];
    }

    // Vérifier que Supabase est configuré
    const { isSupabaseConfigured } = await import("./client");
    if (!isSupabaseConfigured()) {
      console.warn("[Supabase] getGestations: Supabase not configured");
      return [];
    }

    // Vérifier la session utilisateur
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      console.warn("[Supabase] getGestations: No active session");
      return [];
    }

    // Essayer d'abord une requête simple pour vérifier si la table existe
    const { data, error } = await supabase
      .from("gestations")
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
          "[Supabase] Table gestations may not exist or RLS policies not set. Error:",
          {
            code: errorCode,
            message: errorMessage,
            hint: "Run migrations 001-create-tables.sql and 007-fix-gestations-schema.sql",
          }
        );
        return [];
      }

      // Log détaillé de l'erreur
      console.error("[Supabase] Error fetching gestations:", {
        message: errorMessage,
        details: error.details || "No details",
        hint: error.hint || "No hint",
        code: errorCode,
        userId,
        table: "gestations",
      });
      return [];
    }

    // Si pas d'erreur, faire la vraie requête avec tous les champs
    const { data: fullData, error: fullError } = await supabase
      .from("gestations")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (fullError) {
      console.error("[Supabase] Error fetching full gestations:", {
        message: fullError.message || "No message",
        details: fullError.details || "No details",
        hint: fullError.hint || "No hint",
        code: fullError.code || "No code",
        userId,
      });
      return [];
    }

    if (!fullData) {
      console.warn("[Supabase] getGestations: No data returned");
      return [];
    }

    // Si pas de données, retourner un tableau vide
    if (fullData.length === 0) {
      return [];
    }

    // Utiliser fullData au lieu de data
    const dataToProcess = fullData;

    if (!data) {
      console.warn("[Supabase] getGestations: No data returned");
      return [];
    }

    // Si pas de données, retourner un tableau vide
    if (data.length === 0) {
      return [];
    }

    // Récupérer les noms des animaux
    const sowIds = [
      ...new Set(dataToProcess.map((g) => g.sow_id).filter(Boolean)),
    ];
    const boarIds = [
      ...new Set(dataToProcess.map((g) => g.boar_id).filter(Boolean)),
    ];

    let sowMap = new Map<string, string>();
    let boarMap = new Map<string, string>();

    if (sowIds.length > 0) {
      const { data: sows, error: sowsError } = await supabase
        .from("pigs")
        .select("id, name")
        .in("id", sowIds);

      if (sowsError) {
        console.error("[Supabase] Error fetching sows for gestations:", {
          message: sowsError.message,
          details: sowsError.details,
          code: sowsError.code,
        });
      } else {
        sowMap = new Map(sows?.map((s) => [s.id, s.name]) || []);
      }
    }

    if (boarIds.length > 0) {
      const { data: boars, error: boarsError } = await supabase
        .from("pigs")
        .select("id, name")
        .in("id", boarIds);

      if (boarsError) {
        console.error("[Supabase] Error fetching boars for gestations:", {
          message: boarsError.message,
          details: boarsError.details,
          code: boarsError.code,
        });
      } else {
        boarMap = new Map(boars?.map((b) => [b.id, b.name]) || []);
      }
    }

    return dataToProcess.map((row) =>
      mapSupabaseToGestation(
        row,
        sowMap.get(row.sow_id) || "Truie inconnue",
        row.boar_id ? boarMap.get(row.boar_id) : undefined
      )
    );
  } catch (error) {
    console.error("[Supabase] Exception in getGestations:", {
      error,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      userId,
    });
    return [];
  }
}

/**
 * Créer une nouvelle gestation
 */
export async function createGestation(
  gestation: Omit<Gestation, "id" | "createdAt" | "expectedDueDate">,
  userId: string
): Promise<Gestation | null> {
  try {
    const supabaseData = mapGestationToSupabase(gestation, userId);

    const { data, error } = await supabase
      .from("gestations")
      .insert(supabaseData)
      .select()
      .single();

    if (error) {
      console.error("[Supabase] Error creating gestation:", error);
      throw error;
    }

    if (!data) return null;

    // Récupérer les noms des animaux
    const { data: sow } = await supabase
      .from("pigs")
      .select("name")
      .eq("id", gestation.sowId)
      .single();

    let boarName: string | undefined;
    if (gestation.boarId) {
      const { data: boar } = await supabase
        .from("pigs")
        .select("name")
        .eq("id", gestation.boarId)
        .single();
      boarName = boar?.name;
    }

    return mapSupabaseToGestation(
      data,
      sow?.name || gestation.sowName,
      boarName
    );
  } catch (error) {
    console.error("[Supabase] Exception in createGestation:", error);
    return null;
  }
}

/**
 * Mettre à jour une gestation
 */
export async function updateGestation(
  id: string,
  updates: Partial<Gestation>,
  userId: string
): Promise<Gestation | null> {
  try {
    const updateData: any = {};

    if (updates.status) {
      const statusMap: Record<Gestation["status"], string> = {
        active: "en_cours",
        completed: "terminee",
        failed: "avortee",
      };
      updateData.status = statusMap[updates.status];
    }

    if (updates.actualDueDate)
      updateData.actual_farrowing_date = updates.actualDueDate;
    if (updates.pigletCount !== undefined)
      updateData.piglets_born = updates.pigletCount;
    if (updates.pigletsSurvived !== undefined) {
      updateData.piglets_alive = updates.pigletsSurvived;
      if (updates.pigletCount !== undefined) {
        updateData.piglets_dead = updates.pigletCount - updates.pigletsSurvived;
      }
    }
    if (updates.notes !== undefined) updateData.notes = updates.notes;

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("gestations")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      console.error("[Supabase] Error updating gestation:", error);
      throw error;
    }

    if (!data) return null;

    // Récupérer les noms des animaux
    const { data: sow } = await supabase
      .from("pigs")
      .select("name")
      .eq("id", data.sow_id)
      .single();

    let boarName: string | undefined;
    if (data.boar_id) {
      const { data: boar } = await supabase
        .from("pigs")
        .select("name")
        .eq("id", data.boar_id)
        .single();
      boarName = boar?.name;
    }

    return mapSupabaseToGestation(
      data,
      sow?.name || "Truie inconnue",
      boarName
    );
  } catch (error) {
    console.error("[Supabase] Exception in updateGestation:", error);
    return null;
  }
}

/**
 * Supprimer une gestation
 */
export async function deleteGestation(
  id: string,
  userId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("gestations")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      console.error("[Supabase] Error deleting gestation:", error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error("[Supabase] Exception in deleteGestation:", error);
    return false;
  }
}
