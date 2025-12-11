/**
 * Helper Supabase Storage pour les photos d'animaux
 */

import { supabase } from "./client";

const BUCKET_NAME = "pig-photos";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

/**
 * Upload une photo d'animal vers Supabase Storage
 * @param file - Le fichier image à uploader
 * @param userId - L'ID de l'utilisateur
 * @param pigId - L'ID de l'animal (optionnel, pour mise à jour)
 * @returns L'URL publique de la photo ou null en cas d'erreur
 */
export async function uploadPigPhoto(
  file: File,
  userId: string,
  pigId?: string
): Promise<string | null> {
  try {
    // Vérifier la taille du fichier
    if (file.size > MAX_FILE_SIZE) {
      throw new Error("Le fichier est trop volumineux (max 5MB)");
    }

    // Vérifier le type MIME
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      throw new Error(
        "Type de fichier non autorisé. Utilisez JPEG, PNG ou WebP"
      );
    }

    // Générer un nom de fichier unique
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split(".").pop() || "jpg";
    const fileName = `${userId}/${pigId || "new"}-${timestamp}-${randomString}.${extension}`;

    // Upload vers Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("[Storage] Error uploading photo:", error);
      throw error;
    }

    if (!data) {
      return null;
    }

    // Récupérer l'URL publique
    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path);

    return publicUrl;
  } catch (error) {
    console.error("[Storage] Exception in uploadPigPhoto:", error);
    if (error instanceof Error) {
      throw error;
    }
    return null;
  }
}

/**
 * Supprime une photo d'animal de Supabase Storage
 * @param photoUrl - L'URL de la photo à supprimer
 * @returns true si la suppression a réussi
 */
export async function deletePigPhoto(photoUrl: string): Promise<boolean> {
  try {
    // Extraire le chemin du fichier depuis l'URL
    const url = new URL(photoUrl);
    const pathParts = url.pathname.split("/");
    const filePath = pathParts
      .slice(pathParts.indexOf(BUCKET_NAME) + 1)
      .join("/");

    if (!filePath) {
      console.error("[Storage] Impossible d'extraire le chemin du fichier");
      return false;
    }

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      console.error("[Storage] Error deleting photo:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[Storage] Exception in deletePigPhoto:", error);
    return false;
  }
}

/**
 * Convertit un fichier base64 en File pour l'upload
 * @param base64String - La chaîne base64
 * @param fileName - Le nom du fichier
 * @returns Un objet File
 */
export function base64ToFile(
  base64String: string,
  fileName: string = "photo.jpg"
): File {
  // Extraire le type MIME et les données
  const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error("Format base64 invalide");
  }

  const mimeType = matches[1];
  const base64Data = matches[2];

  // Convertir base64 en blob
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: mimeType });

  // Créer un File depuis le Blob
  return new File([blob], fileName, { type: mimeType });
}
