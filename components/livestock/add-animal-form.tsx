"use client";

import type React from "react";
import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Camera,
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useApp } from "@/contexts/app-context";
import { useAuthContext } from "@/contexts/auth-context";
import { FormInput, FormSelect } from "@/components/common/form-field";
import { animalSchema, type AnimalFormData } from "@/lib/validations/schemas";
import * as PigsSupabase from "@/lib/supabase/pigs";
import * as Storage from "@/lib/supabase/storage";

const categoryOptions = [
  { value: "truie", label: "Truie" },
  { value: "verrat", label: "Verrat" },
  { value: "porcelet", label: "Porcelet" },
  { value: "porc", label: "Porc d'engraissement" },
];

const breedOptions = [
  { value: "Large White", label: "Large White" },
  { value: "Landrace", label: "Landrace" },
  { value: "Duroc", label: "Duroc" },
  { value: "Piétrain", label: "Piétrain" },
  { value: "Croisé", label: "Croisé" },
  { value: "Race locale", label: "Race locale" },
];

export function AddAnimalForm() {
  const router = useRouter();
  const { addAnimal, animals } = useApp();
  const { user } = useAuthContext();
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [checkingTagNumber, setCheckingTagNumber] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const tagNumberCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [formData, setFormData] = useState<AnimalFormData>({
    name: "",
    tagNumber: "",
    category: "truie",
    breed: "",
    birthDate: "",
    weight: "",
    acquisitionDate: "",
    acquisitionPrice: "",
    motherId: "",
    fatherId: "",
    notes: "",
  });

  const updateField = (field: keyof AnimalFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Vérifier l'unicité du numéro de boucle en temps réel
  const checkTagNumberUniqueness = useCallback(
    async (tagNumber: string) => {
      if (!tagNumber || !user?.id) return;

      // Ne pas vérifier si c'est le même que le nom (fallback)
      if (tagNumber === formData.name) return;

      setCheckingTagNumber(true);
      try {
        const exists = await PigsSupabase.checkTagNumberExists(
          tagNumber,
          user.id
        );
        if (exists) {
          setErrors((prev) => ({
            ...prev,
            tagNumber: "Ce numéro de boucle existe déjà",
          }));
        } else {
          // Retirer l'erreur si elle existait
          setErrors((prev) => {
            if (prev.tagNumber?.includes("boucle")) {
              const newErrors = { ...prev };
              delete newErrors.tagNumber;
              return newErrors;
            }
            return prev;
          });
        }
      } catch (error) {
        console.error("[AddAnimal] Error checking tag number:", error);
        // Ne pas bloquer l'utilisateur en cas d'erreur de vérification
      } finally {
        setCheckingTagNumber(false);
      }
    },
    [user?.id, formData.name]
  );

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier la taille (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          photo: "Le fichier est trop volumineux (max 5MB)",
        }));
        return;
      }

      // Vérifier le type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          photo: "Type de fichier non autorisé. Utilisez JPEG, PNG ou WebP",
        }));
        return;
      }

      // Stocker le fichier pour l'upload
      setPhotoFile(file);

      // Afficher un aperçu
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.photo;
      return newErrors;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setErrorMessage("");

    const result = animalSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as string;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setStatus("loading");

    try {
      // Upload de la photo si un fichier a été sélectionné
      let photoUrl: string | undefined = undefined;
      if (photoFile && user?.id) {
        setUploadingPhoto(true);
        try {
          const uploadedUrl = await Storage.uploadPigPhoto(photoFile, user.id);
          if (!uploadedUrl) {
            throw new Error("Échec de l'upload de la photo");
          }
          photoUrl = uploadedUrl;
        } catch (error) {
          console.error("[AddAnimal] Error uploading photo:", error);
          setErrors((prev) => ({
            ...prev,
            photo:
              error instanceof Error
                ? error.message
                : "Erreur lors de l'upload de la photo",
          }));
          setStatus("error");
          setUploadingPhoto(false);
          return;
        } finally {
          setUploadingPhoto(false);
        }
      } else if (photo && !photoFile) {
        // Si c'est une ancienne photo base64 (migration), on la garde temporairement
        photoUrl = photo || undefined;
      }

      const newAnimal = await addAnimal({
        name: formData.name,
        identifier: formData.tagNumber || formData.name,
        category: formData.category as "truie" | "verrat" | "porcelet" | "porc",
        breed: formData.breed || "Non renseigné",
        birthDate: formData.birthDate || new Date().toISOString().split("T")[0],
        weight: formData.weight ? Number.parseFloat(formData.weight) : 0,
        status: "actif",
        healthStatus: "bon",
        photo: photoUrl,
        motherId:
          formData.motherId && formData.motherId !== "none"
            ? formData.motherId
            : undefined,
        fatherId:
          formData.fatherId && formData.fatherId !== "none"
            ? formData.fatherId
            : undefined,
        notes: formData.notes || undefined,
      });

      if (newAnimal) {
        setStatus("success");
        setTimeout(() => {
          router.push("/dashboard/livestock");
        }, 1500);
      } else {
        throw new Error("Échec de l'enregistrement");
      }
    } catch (error) {
      console.error("[AddAnimal] Error:", error);
      setStatus("error");

      // Gérer les erreurs spécifiques (ex: unicité du tag_number)
      if (error instanceof Error) {
        if (error.message.includes("boucle")) {
          setErrors({ tagNumber: error.message });
          setErrorMessage("");
        } else {
          setErrorMessage(
            error.message ||
              "Une erreur est survenue lors de l'enregistrement. Vérifiez votre connexion et réessayez."
          );
        }
      } else {
        setErrorMessage(
          "Une erreur est survenue lors de l'enregistrement. Vérifiez votre connexion et réessayez."
        );
      }
    } finally {
      if (status === "loading") {
        // Si toujours en loading après le try/catch, passer en error
        setStatus("error");
      }
    }
  };

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
        <h2 className="text-xl font-semibold text-foreground">
          Porc ajouté avec succès !
        </h2>
        <p className="text-muted-foreground mt-2">
          Votre animal a été enregistré dans votre élevage.
        </p>
        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/livestock")}
          >
            Voir tous mes porcs
          </Button>
          <Button
            onClick={() => {
              setStatus("idle");
              setFormData({
                name: "",
                tagNumber: "",
                category: "truie",
                breed: "",
                birthDate: "",
                weight: "",
                acquisitionDate: "",
                acquisitionPrice: "",
                motherId: "",
                fatherId: "",
                notes: "",
              });
              setPhoto(null);
              setPhotoFile(null);
            }}
          >
            Ajouter un autre porc
          </Button>
        </div>
      </div>
    );
  }

  const sows = animals.filter((a) => a.category === "truie");
  const boars = animals.filter((a) => a.category === "verrat");

  const parentOptions = (list: typeof animals) => [
    { value: "none", label: "Non renseigné" },
    ...list.map((a) => ({ value: a.id, label: a.name || a.identifier })),
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {status === "error" && errorMessage && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 p-3 text-sm text-red-800 dark:text-red-200">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Photo Upload */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-base">
              Photo du porc (optionnel)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <div
                className="relative flex h-48 w-full items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/50 overflow-hidden cursor-pointer hover:bg-muted/70 transition"
                onClick={() => fileInputRef.current?.click()}
              >
                {photo ? (
                  <>
                    <img
                      src={photo || "/placeholder.svg"}
                      alt="Aperçu"
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removePhoto();
                      }}
                      className="absolute top-2 right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Upload className="h-10 w-10" />
                    <span className="text-sm">
                      Cliquez ou glissez une image
                    </span>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handlePhotoUpload}
              />

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2 bg-transparent"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4" />
                  Télécharger
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2 bg-transparent"
                  onClick={() => cameraInputRef.current?.click()}
                >
                  <Camera className="h-4 w-4" />
                  Prendre photo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Info */}
        <Card className="shadow-soft lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">
              Informations sur le porc
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput
                label="Nom du porc"
                name="name"
                placeholder="Ex: Truie #32, Verrat Alpha..."
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                error={errors.name}
                required
                disabled={status === "loading"}
              />
              <div className="space-y-2">
                <FormInput
                  label="Numéro de boucle (optionnel)"
                  name="tagNumber"
                  placeholder="Ex: CI-2024-0032"
                  value={formData.tagNumber}
                  onChange={(e) => {
                    updateField("tagNumber", e.target.value);
                    // Vérifier l'unicité après un délai (debounce)
                    if (tagNumberCheckTimeoutRef.current) {
                      clearTimeout(tagNumberCheckTimeoutRef.current);
                    }
                    tagNumberCheckTimeoutRef.current = setTimeout(() => {
                      if (e.target.value) {
                        checkTagNumberUniqueness(e.target.value);
                      }
                    }, 500);
                  }}
                  onBlur={(e) => {
                    if (tagNumberCheckTimeoutRef.current) {
                      clearTimeout(tagNumberCheckTimeoutRef.current);
                    }
                    if (e.target.value) {
                      checkTagNumberUniqueness(e.target.value);
                    }
                  }}
                  error={errors.tagNumber}
                  disabled={status === "loading" || checkingTagNumber}
                />
                <p className="text-xs text-muted-foreground">
                  Numéro officiel d'identification si disponible. Doit être
                  unique.
                  {checkingTagNumber && (
                    <span className="ml-2 text-blue-600">Vérification...</span>
                  )}
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormSelect
                label="Type de porc"
                name="category"
                options={categoryOptions}
                value={formData.category}
                onChange={(v) => updateField("category", v)}
                error={errors.category}
                required
                disabled={status === "loading"}
              />
              <FormSelect
                label="Race (optionnel)"
                name="breed"
                options={breedOptions}
                value={formData.breed || ""}
                onChange={(v) => updateField("breed", v)}
                error={errors.breed}
                placeholder="Choisissez une race"
                disabled={status === "loading"}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput
                label="Date de naissance"
                name="birthDate"
                type="date"
                value={formData.birthDate || ""}
                onChange={(e) => updateField("birthDate", e.target.value)}
                error={errors.birthDate}
                disabled={status === "loading"}
              />
              <div className="space-y-2">
                <FormInput
                  label="Poids actuel (kg)"
                  name="weight"
                  type="number"
                  placeholder="Ex: 185"
                  value={formData.weight || ""}
                  onChange={(e) => updateField("weight", e.target.value)}
                  error={errors.weight}
                  disabled={status === "loading"}
                />
                <p className="text-xs text-muted-foreground">(optionnel)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Acquisition & Genealogy */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-base">Acquisition</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormInput
              label="Date d'acquisition"
              name="acquisitionDate"
              type="date"
              value={formData.acquisitionDate || ""}
              onChange={(e) => updateField("acquisitionDate", e.target.value)}
              error={errors.acquisitionDate}
              disabled={status === "loading"}
            />
            <FormInput
              label="Prix d'achat (FCFA)"
              name="acquisitionPrice"
              type="number"
              placeholder="Ex: 150000"
              value={formData.acquisitionPrice || ""}
              onChange={(e) => updateField("acquisitionPrice", e.target.value)}
              error={errors.acquisitionPrice}
              disabled={status === "loading"}
            />
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-base">Parents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormSelect
              label="Mère"
              name="motherId"
              options={parentOptions(sows)}
              value={formData.motherId || "none"}
              onChange={(v) => updateField("motherId", v)}
              error={errors.motherId}
              placeholder="Sélectionner la mère"
              disabled={status === "loading"}
            />
            <FormSelect
              label="Père"
              name="fatherId"
              options={parentOptions(boars)}
              value={formData.fatherId || "none"}
              onChange={(v) => updateField("fatherId", v)}
              error={errors.fatherId}
              placeholder="Sélectionner le père"
              disabled={status === "loading"}
            />
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-base">Notes additionnelles</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Ajoutez des observations ou informations supplémentaires..."
            className="min-h-24"
            value={formData.notes || ""}
            onChange={(e) => updateField("notes", e.target.value)}
            disabled={status === "loading"}
          />
          {errors.notes && (
            <p className="text-xs text-destructive mt-1">{errors.notes}</p>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={status === "loading"}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          className="w-full sm:w-auto"
          disabled={status === "loading" || uploadingPhoto}
        >
          {uploadingPhoto ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Upload de la photo...
            </>
          ) : status === "loading" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enregistrement en cours...
            </>
          ) : (
            "Enregistrer le porc"
          )}
        </Button>
      </div>
    </form>
  );
}
