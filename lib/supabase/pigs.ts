/**
 * Helper Supabase pour les animaux (pigs)
 * Migration de localStorage vers Supabase
 */

import { supabase } from "./client";
import type { Animal } from "@/lib/storage/local-database";

/**
 * Mapper le type local Animal vers le format Supabase
 */
function mapAnimalToSupabase(
  animal: Omit<Animal, "id" | "createdAt" | "updatedAt">,
  userId: string
) {
  // Mapper category: "porc" -> "porc_engraissement"
  const categoryMap: Record<Animal["category"], string> = {
    truie: "truie",
    verrat: "verrat",
    porcelet: "porcelet",
    porc: "porc_engraissement",
  };

  // Mapper status: "malade" -> "reforme"
  const statusMap: Record<Animal["status"], string> = {
    actif: "actif",
    vendu: "vendu",
    mort: "mort",
    malade: "reforme",
  };

  return {
    user_id: userId,
    name: animal.name,
    tag_number: animal.identifier || animal.name, // Utiliser identifier comme tag_number
    category: categoryMap[animal.category],
    breed: animal.breed || null,
    birth_date: animal.birthDate || null,
    weight: animal.weight || null,
    status: statusMap[animal.status] || "actif",
    mother_id: animal.motherId || null,
    father_id: animal.fatherId || null,
    acquisition_date: null, // Pas dans le type Animal local, à ajouter si nécessaire
    acquisition_price: null, // Pas dans le type Animal local, à ajouter si nécessaire
    notes: animal.notes || null,
    photo_url: animal.photo || null, // URL de la photo depuis Supabase Storage
  };
}

/**
 * Mapper le format Supabase vers le type local Animal
 */
function mapSupabaseToAnimal(row: any): Animal {
  // Mapper category: "porc_engraissement" -> "porc"
  const categoryMap: Record<string, Animal["category"]> = {
    truie: "truie",
    verrat: "verrat",
    porcelet: "porcelet",
    porc_engraissement: "porc",
  };

  // Mapper status: "reforme" -> "malade"
  const statusMap: Record<string, Animal["status"]> = {
    actif: "actif",
    vendu: "vendu",
    mort: "mort",
    reforme: "malade",
  };

  // Mapper healthStatus basé sur le status
  const getHealthStatus = (status: string): Animal["healthStatus"] => {
    if (status === "reforme" || status === "malade") return "mauvais";
    if (status === "actif") return "bon";
    return "moyen";
  };

  return {
    id: row.id,
    identifier: row.tag_number || row.name,
    name: row.name,
    category: categoryMap[row.category] || "porc",
    breed: row.breed || "Non renseigné",
    birthDate: row.birth_date || new Date().toISOString().split("T")[0],
    weight: row.weight || 0,
    status: statusMap[row.status] || "actif",
    healthStatus: getHealthStatus(row.status),
    motherId: row.mother_id || undefined,
    fatherId: row.father_id || undefined,
    notes: row.notes || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    // Photo: URL depuis Supabase Storage stockée dans photo_url
    photo: row.photo_url || undefined,
  };
}

/**
 * Récupérer tous les animaux pour un utilisateur
 */
export async function getPigs(userId: string): Promise<Animal[]> {
  try {
    const { data, error } = await supabase
      .from("pigs")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Supabase] Error fetching pigs:", error);
      throw error;
    }

    if (!data) return [];

    return data.map(mapSupabaseToAnimal);
  } catch (error) {
    console.error("[Supabase] Exception in getPigs:", error);
    return [];
  }
}

/**
 * Vérifier si un numéro de boucle existe déjà pour un utilisateur
 */
export async function checkTagNumberExists(
  tagNumber: string,
  userId: string,
  excludeId?: string
): Promise<boolean> {
  try {
    let query = supabase
      .from("pigs")
      .select("id")
      .eq("user_id", userId)
      .eq("tag_number", tagNumber);

    if (excludeId) {
      query = query.neq("id", excludeId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[Supabase] Error checking tag number:", error);
      throw error;
    }

    return (data?.length || 0) > 0;
  } catch (error) {
    console.error("[Supabase] Exception in checkTagNumberExists:", error);
    return false;
  }
}

/**
 * Créer un nouvel animal
 */
export async function createPig(
  animal: Omit<Animal, "id" | "createdAt" | "updatedAt">,
  userId: string
): Promise<Animal | null> {
  try {
    // Vérifier l'unicité du tag_number si fourni
    if (animal.identifier && animal.identifier !== animal.name) {
      const exists = await checkTagNumberExists(animal.identifier, userId);
      if (exists) {
        throw new Error("Ce numéro de boucle existe déjà");
      }
    }

    const supabaseData = mapAnimalToSupabase(animal, userId);

    const { data, error } = await supabase
      .from("pigs")
      .insert(supabaseData)
      .select()
      .single();

    if (error) {
      console.error("[Supabase] Error creating pig:", error);
      // Vérifier si c'est une erreur d'unicité (code PostgreSQL 23505 = unique_violation)
      if (
        error.code === "23505" ||
        error.message?.includes("unique") ||
        error.message?.includes("duplicate") ||
        error.message?.includes("unique_user_tag_number")
      ) {
        throw new Error("Ce numéro de boucle existe déjà");
      }
      // Autres erreurs SQL - transformer en message générique
      if (error.code?.startsWith("23")) {
        throw new Error("Erreur de validation des données");
      }
      throw error;
    }

    if (!data) return null;

    return mapSupabaseToAnimal(data);
  } catch (error) {
    console.error("[Supabase] Exception in createPig:", error);
    if (error instanceof Error) {
      throw error; // Re-throw pour que le contexte puisse gérer l'erreur
    }
    return null;
  }
}

/**
 * Mettre à jour un animal
 */
export async function updatePig(
  id: string,
  updates: Partial<Animal>,
  userId: string
): Promise<Animal | null> {
  try {
    const updateData: any = {};

    // Vérifier l'unicité du tag_number si modifié
    if (updates.identifier) {
      const exists = await checkTagNumberExists(updates.identifier, userId, id);
      if (exists) {
        throw new Error("Ce numéro de boucle existe déjà");
      }
      updateData.tag_number = updates.identifier;
    }

    if (updates.name) updateData.name = updates.name;
    if (updates.category) {
      const categoryMap: Record<Animal["category"], string> = {
        truie: "truie",
        verrat: "verrat",
        porcelet: "porcelet",
        porc: "porc_engraissement",
      };
      updateData.category = categoryMap[updates.category];
    }
    if (updates.breed !== undefined) updateData.breed = updates.breed;
    if (updates.birthDate) updateData.birth_date = updates.birthDate;
    if (updates.weight !== undefined) updateData.weight = updates.weight;
    if (updates.status) {
      const statusMap: Record<Animal["status"], string> = {
        actif: "actif",
        vendu: "vendu",
        mort: "mort",
        malade: "reforme",
      };
      updateData.status = statusMap[updates.status];
    }
    if (updates.motherId !== undefined)
      updateData.mother_id = updates.motherId || null;
    if (updates.fatherId !== undefined)
      updateData.father_id = updates.fatherId || null;
    if (updates.notes !== undefined) updateData.notes = updates.notes || null;
    if (updates.photo !== undefined)
      updateData.photo_url = updates.photo || null;

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("pigs")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      console.error("[Supabase] Error updating pig:", error);
      // Vérifier si c'est une erreur d'unicité (code PostgreSQL 23505 = unique_violation)
      if (
        error.code === "23505" ||
        error.message?.includes("unique") ||
        error.message?.includes("duplicate") ||
        error.message?.includes("unique_user_tag_number")
      ) {
        throw new Error("Ce numéro de boucle existe déjà");
      }
      // Autres erreurs SQL - transformer en message générique
      if (error.code?.startsWith("23")) {
        throw new Error("Erreur de validation des données");
      }
      throw error;
    }

    if (!data) return null;

    return mapSupabaseToAnimal(data);
  } catch (error) {
    console.error("[Supabase] Exception in updatePig:", error);
    if (error instanceof Error) {
      throw error; // Re-throw pour que le contexte puisse gérer l'erreur
    }
    return null;
  }
}

/**
 * Supprimer un animal
 */
export async function deletePig(id: string, userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("pigs")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      console.error("[Supabase] Error deleting pig:", error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error("[Supabase] Exception in deletePig:", error);
    return false;
  }
}

/**
 * Marquer un animal comme vendu
 */
export async function sellPig(
  id: string,
  userId: string
): Promise<Animal | null> {
  return updatePig(id, { status: "vendu" }, userId);
}

/**
 * Marquer un animal comme mort
 */
export async function markPigDead(
  id: string,
  userId: string
): Promise<Animal | null> {
  return updatePig(id, { status: "mort" }, userId);
}
