"use client";

import type React from "react";
import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Camera,
  Clock,
  X,
  Plus,
  Loader2,
  CheckCircle,
  AlertCircle,
  Stethoscope,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useApp } from "@/contexts/app-context";
import {
  FormInput,
  FormTextarea,
  FormSelect,
} from "@/components/common/form-field";
import { healthCaseSchema } from "@/lib/validations/schemas";

const priorityOptions = [
  { value: "Basse", label: "Pas urgent - Je surveille" },
  { value: "Moyenne", label: "À traiter - Besoin de soins" },
  { value: "Haute", label: "Urgent - Besoin d'intervention rapide" },
];

export function HealthCases() {
  const { healthCases, addHealthCase, updateHealthCase, animals, isLoading } =
    useApp();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [symptomDialogOpen, setSymptomDialogOpen] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState("");

  const [newCase, setNewCase] = useState({
    animal: "",
    issue: "",
    priority: "Moyenne" as "Basse" | "Moyenne" | "Haute",
    treatment: "",
    photo: null as string | null,
  });

  const [symptomData, setSymptomData] = useState({
    animal: "",
    symptom: "",
    photo: null as string | null,
  });
  const [symptomStatus, setSymptomStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [symptomErrors, setSymptomErrors] = useState<Record<string, string>>(
    {}
  );

  const newCasePhotoRef = useRef<HTMLInputElement>(null);
  const symptomPhotoRef = useRef<HTMLInputElement>(null);

  const updateField = (field: string, value: string) => {
    setNewCase((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleNewCasePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          photo: "Image trop volumineuse (max 5Mo)",
        }));
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewCase((prev) => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSymptomPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setSymptomErrors((prev) => ({
          ...prev,
          photo: "Image trop volumineuse (max 5Mo)",
        }));
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSymptomData((prev) => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCase = () => {
    setErrors({});
    setErrorMessage("");

    const result = healthCaseSchema.safeParse(newCase);
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
      const selectedAnimal = animals.find((a) => a.id === newCase.animal);

      if (!selectedAnimal) {
        setErrors({ animal: "Animal non trouve" });
        setStatus("error");
        return;
      }

      addHealthCase({
        animalId: newCase.animal,
        animalName: selectedAnimal.name || "Animal inconnu",
        issue: newCase.issue,
        description: newCase.issue,
        priority: newCase.priority.toLowerCase() as "low" | "medium" | "high",
        status: "open",
        treatment: newCase.treatment || undefined,
        photo: newCase.photo || undefined,
        startDate: new Date().toISOString().split("T")[0],
      });

      if (!result) {
        setStatus("error");
        setErrorMessage("Erreur lors de l'enregistrement. Veuillez réessayer.");
        return;
      }

      setStatus("success");

      setTimeout(() => {
        setNewCase({
          animal: "",
          issue: "",
          priority: "Moyenne",
          treatment: "",
          photo: null,
        });
        setDialogOpen(false);
        setStatus("idle");
      }, 1500);
    } catch (error) {
      console.error("[Health Case] Error:", error);
      setStatus("error");
      // Message générique pour l'utilisateur, détails loggés côté serveur
      setErrorMessage(
        "Une erreur est survenue lors de l'enregistrement. Veuillez réessayer."
      );
    } finally {
      setStatus((prev) => (prev === "loading" ? "error" : prev));
    }
  };

  const handleCaptureSymptom = () => {
    setSymptomErrors({});

    if (!symptomData.animal) {
      setSymptomErrors({ animal: "Selectionnez un animal" });
      return;
    }

    if (!symptomData.symptom || symptomData.symptom.length < 5) {
      setSymptomErrors({
        symptom: "Decrivez le symptome (minimum 5 caracteres)",
      });
      return;
    }

    setSymptomStatus("loading");

    // animals may be undefined if used before assignment; add a safeguard
    const selectedAnimal = Array.isArray(animals)
      ? animals.find((a) => a.id === symptomData.animal)
      : undefined;

    if (!selectedAnimal) {
      setSymptomErrors({ animal: "Animal non trouve" });
      setSymptomStatus("error");
      return;
    }

    // Create a health case from the symptom
    addHealthCase({
      animalId: symptomData.animal,
      animalName: selectedAnimal.name || "Animal inconnu",
      issue: symptomData.symptom,
      description: `Symptome capture: ${symptomData.symptom}`,
      priority: "medium",
      status: "open",
      photo: symptomData.photo || undefined,
      startDate: new Date().toISOString().split("T")[0],
    })
      .then((result) => {
        if (!result) {
          setSymptomStatus("error");
          setSymptomErrors({
            general: "Erreur lors de l'enregistrement. Veuillez réessayer.",
          });
          return;
        }
        setSymptomStatus("success");

        setTimeout(() => {
          setSymptomData({ animal: "", symptom: "", photo: null });
          setSymptomDialogOpen(false);
          setSymptomStatus("idle");
        }, 1500);
      })
      .catch((error) => {
        console.error("[Symptom Capture] Error:", error);
        setSymptomStatus("error");
        setSymptomErrors({
          general:
            "Une erreur est survenue lors de l'enregistrement. Veuillez réessayer.",
        });
      });
  };

  const handleResolveCase = async (caseId: string) => {
    try {
      setStatus("loading");
      const result = await updateHealthCase(caseId, {
        status: "resolved",
        resolvedDate: new Date().toISOString().split("T")[0],
      });

      if (!result) {
        setStatus("error");
        setErrorMessage(
          "Erreur lors de la résolution du cas. Veuillez réessayer."
        );
        return;
      }

      setStatus("success");
      // Le contexte se rafraîchit automatiquement via refreshData dans updateHealthCase
      // On peut fermer le message de succès après 2 secondes
      setTimeout(() => {
        setStatus("idle");
        setErrorMessage("");
      }, 2000);
    } catch (error) {
      console.error("[Health Case] Error resolving case:", error);
      setStatus("error");
      setErrorMessage(
        "Une erreur est survenue lors de la résolution du cas. Vérifiez votre connexion et réessayez."
      );
    }
  };

  type Animal = {
    id: string;
    name: string;
    identifier: string;
    status: string;
    [key: string]: any; // allows other props
  };

  // Accept 'animals' as a prop or get from context/store. Here, we assume it is a prop.
  // Remove the dummy array and use the actual list.
  const animalOptions = animals
    .filter((a: Animal) => a.status === "actif" || a.status === "malade")
    .map((animal: Animal) => ({
      value: animal.id,
      label: `${animal.name} (${animal.identifier})`,
    }));

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-amber-500";
      default:
        return "bg-blue-500";
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "critical":
        return "Critique";
      case "high":
        return "Haute";
      case "medium":
        return "Moyenne";
      default:
        return "Basse";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "bg-green-500";
      case "in_progress":
        return "bg-blue-500";
      default:
        return "bg-amber-500";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "resolved":
        return "Résolu";
      case "in_progress":
        return "En cours de traitement";
      default:
        return "À traiter";
    }
  };

  // Fix: add types for 'healthCases' and 'isLoading' and for variable 'c'
  // (Assume healthCases and isLoading are coming from props or state, so no definition here)
  const activeCases = (healthCases || []).filter(
    (c: { status: string }) => c.status !== "resolved"
  );

  if (typeof isLoading !== "undefined" && isLoading) {
    return (
      <Card className="shadow-soft">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">
            Chargement des cas...
          </span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-soft">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-base font-medium">
          Cas sanitaires actifs ({activeCases.length})
        </CardTitle>
        <div className="flex gap-2">
          <Dialog
            open={symptomDialogOpen}
            onOpenChange={(open) => {
              setSymptomDialogOpen(open);
              if (!open) {
                setSymptomErrors({});
                setSymptomStatus("idle");
              }
            }}
          >
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-1 bg-transparent"
              >
                <Camera className="h-4 w-4" />
                Noter un problème rapidement
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Capturer un symptome</DialogTitle>
                <DialogDescription>
                  Prenez une photo et decrivez rapidement le symptome observe.
                </DialogDescription>
              </DialogHeader>

              {symptomStatus === "success" && (
                <div className="flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 p-3 text-sm text-green-800 dark:text-green-200">
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  <span>
                    Problème noté ! Un cas de santé a été créé et apparaît dans
                    votre liste.
                  </span>
                </div>
              )}

              {symptomStatus === "error" && symptomErrors.general && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 p-3 text-sm text-red-800 dark:text-red-200">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{symptomErrors.general}</span>
                </div>
              )}

              <div className="space-y-4 py-4">
                <FormSelect
                  label="Animal concerne"
                  name="animal"
                  options={animalOptions}
                  value={symptomData.animal}
                  onChange={(v) => {
                    setSymptomData((prev) => ({ ...prev, animal: v }));
                    if (symptomErrors.animal)
                      setSymptomErrors((prev) => ({ ...prev, animal: "" }));
                  }}
                  error={symptomErrors.animal}
                  required
                  placeholder="Selectionner un animal"
                  disabled={
                    symptomStatus === "loading" || symptomStatus === "success"
                  }
                />

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Photo du problème (optionnel)
                  </label>
                  <div className="flex gap-2">
                    <input
                      ref={symptomPhotoRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={handleSymptomPhoto}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="gap-2 bg-transparent flex-1"
                      onClick={() => symptomPhotoRef.current?.click()}
                      disabled={
                        symptomStatus === "loading" ||
                        symptomStatus === "success"
                      }
                    >
                      <Camera className="h-4 w-4" />
                      {symptomData.photo
                        ? "Changer la photo"
                        : "Prendre une photo"}
                    </Button>
                  </div>
                  {symptomData.photo && (
                    <div className="relative mt-2">
                      <img
                        src={symptomData.photo || "/placeholder.svg"}
                        alt="Apercu du symptome"
                        className="h-32 w-full rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setSymptomData({ ...symptomData, photo: null })
                        }
                        className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  {symptomErrors.photo && (
                    <p className="text-xs text-destructive">
                      {symptomErrors.photo}
                    </p>
                  )}
                </div>

                <FormTextarea
                  label="Description du symptome"
                  name="symptom"
                  placeholder="Ex: Boiterie, refus de manger, toux..."
                  value={symptomData.symptom}
                  onChange={(e) => {
                    setSymptomData((prev) => ({
                      ...prev,
                      symptom: e.target.value,
                    }));
                    if (symptomErrors.symptom)
                      setSymptomErrors((prev) => ({ ...prev, symptom: "" }));
                  }}
                  error={symptomErrors.symptom}
                  required
                  disabled={
                    symptomStatus === "loading" || symptomStatus === "success"
                  }
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSymptomDialogOpen(false)}
                  disabled={symptomStatus === "loading"}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleCaptureSymptom}
                  disabled={
                    symptomStatus === "loading" || symptomStatus === "success"
                  }
                >
                  {symptomStatus === "loading" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : symptomStatus === "success" ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Enregistre !
                    </>
                  ) : (
                    <>
                      <Stethoscope className="mr-2 h-4 w-4" />
                      Enregistrer le problème
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog
            open={dialogOpen}
            onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) {
                setErrors({});
                setErrorMessage("");
                setStatus("idle");
              }
            }}
          >
            <DialogTrigger asChild>
              <Button variant="default" size="sm" className="gap-1">
                <Plus className="h-4 w-4" />
                Signaler un problème
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Signaler un probleme de sante</DialogTitle>
                <DialogDescription>
                  Enregistrez un nouveau cas sanitaire pour un animal de votre
                  cheptel.
                </DialogDescription>
              </DialogHeader>

              {status === "success" && (
                <div className="flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 p-3 text-sm text-green-800 dark:text-green-200">
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  <span>
                    Problème enregistré ! Vous pouvez suivre l'évolution dans la
                    liste ci-dessous.
                  </span>
                </div>
              )}

              {status === "error" && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 p-3 text-sm text-red-800 dark:text-red-200">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>
                    {errorMessage ||
                      "Une erreur est survenue. Vérifiez votre connexion et réessayez."}
                  </span>
                </div>
              )}

              {animalOptions.length === 0 && (
                <div className="flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 p-3 text-sm text-amber-800 dark:text-amber-200">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Aucun porc dans votre élevage</p>
                    <p className="text-xs mt-1">
                      Ajoutez d'abord des porcs avant de signaler un problème de
                      santé.
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-4 py-4">
                <FormSelect
                  label="Animal concerne"
                  name="animal"
                  options={animalOptions}
                  value={newCase.animal}
                  onChange={(v) => updateField("animal", v)}
                  error={errors.animal}
                  required
                  placeholder={
                    animalOptions.length === 0
                      ? "Aucun animal disponible"
                      : "Selectionner un animal"
                  }
                  disabled={
                    status === "loading" ||
                    status === "success" ||
                    animalOptions.length === 0
                  }
                />

                <FormTextarea
                  label="Quel est le problème ?"
                  name="issue"
                  placeholder="Ex: Boite de la patte arrière droite, ne mange plus depuis 2 jours, a de la fièvre..."
                  value={newCase.issue}
                  onChange={(e) => updateField("issue", e.target.value)}
                  error={errors.issue}
                  required
                  disabled={status === "loading" || status === "success"}
                />
                <p className="text-xs text-muted-foreground -mt-2">
                  Décrivez ce que vous observez. Plus vous êtes précis, mieux on
                  pourra vous aider.
                </p>

                <FormSelect
                  label="C'est urgent ?"
                  name="priority"
                  options={priorityOptions}
                  value={newCase.priority}
                  onChange={(v) => updateField("priority", v)}
                  error={errors.priority}
                  required
                  disabled={status === "loading" || status === "success"}
                />

                <FormInput
                  label="Traitement déjà donné (optionnel)"
                  name="treatment"
                  placeholder="Ex: Antibiotique donné ce matin, vermifuge..."
                  value={newCase.treatment}
                  onChange={(e) => updateField("treatment", e.target.value)}
                  error={errors.treatment}
                  disabled={status === "loading" || status === "success"}
                />

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Photo (optionnel)
                  </label>
                  <div className="flex gap-2">
                    <input
                      ref={newCasePhotoRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={handleNewCasePhoto}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="gap-2 bg-transparent"
                      onClick={() => newCasePhotoRef.current?.click()}
                      disabled={status === "loading" || status === "success"}
                    >
                      <Camera className="h-4 w-4" />
                      {newCase.photo ? "Changer la photo" : "Prendre une photo"}
                    </Button>
                    {newCase.photo && (
                      <div className="relative h-16 w-16">
                        <img
                          src={newCase.photo || "/placeholder.svg"}
                          alt="Apercu"
                          className="h-full w-full rounded-lg object-cover"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setNewCase({ ...newCase, photo: null })
                          }
                          className="absolute -right-1 -top-1 rounded-full bg-red-500 p-0.5 text-white"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                  {errors.photo && (
                    <p className="text-xs text-destructive">{errors.photo}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={status === "loading"}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleAddCase}
                  disabled={
                    status === "loading" ||
                    status === "success" ||
                    animalOptions.length === 0
                  }
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enregistrement en cours...
                    </>
                  ) : status === "success" ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Enregistré !
                    </>
                  ) : (
                    "Enregistrer le problème"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Success/Error messages for resolve action */}
        {status === "success" && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 p-3 text-sm text-green-800 dark:text-green-200">
            <CheckCircle className="h-4 w-4 shrink-0" />
            <span>Cas résolu avec succès !</span>
          </div>
        )}
        {status === "error" && errorMessage && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 p-3 text-sm text-red-800 dark:text-red-200">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {activeCases.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
            <p className="text-muted-foreground font-medium">
              Aucun problème de santé en cours
            </p>
            <p className="text-sm text-muted-foreground">
              Tous vos animaux sont en bonne sante !
            </p>
          </div>
        ) : (
          activeCases.map((caseItem: any) => (
            <div
              key={caseItem.id}
              className="flex gap-4 rounded-xl border border-border p-4 transition hover:bg-muted/50"
            >
              <div className="relative">
                <img
                  src={
                    caseItem.photo ||
                    "/placeholder.svg?height=80&width=80&query=sick pig"
                  }
                  alt={caseItem.animalName}
                  className="h-20 w-20 rounded-xl object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-foreground">
                      {caseItem.animalName}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {caseItem.issue}
                    </p>
                  </div>
                  <Badge
                    className={`${getPriorityColor(caseItem.priority)} text-white`}
                  >
                    {getPriorityLabel(caseItem.priority)}
                  </Badge>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="gap-1">
                    <Clock className="h-3 w-3" />
                    {caseItem.startDate}
                  </Badge>
                  <Badge
                    className={`${getStatusColor(caseItem.status)} text-white`}
                  >
                    {getStatusLabel(caseItem.status)}
                  </Badge>
                </div>
                {caseItem.treatment && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Traitement: {caseItem.treatment}
                  </p>
                )}
                <div className="mt-2 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleResolveCase(caseItem.id)}
                    disabled={status === "loading"}
                  >
                    {status === "loading" ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        En cours...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Problème résolu
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export default HealthCases;
