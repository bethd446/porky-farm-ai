"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Baby,
  Calendar,
  Eye,
  Plus,
  Trash2,
  CheckCircle,
  Loader2,
  AlertCircle,
  Info,
} from "lucide-react";
import { useApp } from "@/contexts/app-context";
import {
  FormSelect,
  FormInput,
  FormTextarea,
} from "@/components/common/form-field";
import { gestationSchema } from "@/lib/validations/schemas";
import Link from "next/link";

export function GestationTracker() {
  const router = useRouter();
  const {
    gestations,
    addGestation,
    deleteGestation,
    completeGestation,
    animals,
  } = useApp();
  const [selectedGestation, setSelectedGestation] = useState<
    (typeof gestations)[0] | null
  >(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState("");
  const [completeData, setCompleteData] = useState({
    pigletCount: "",
    pigletsSurvived: "",
  });
  const [completeErrors, setCompleteErrors] = useState<Record<string, string>>(
    {}
  );
  const [newGestation, setNewGestation] = useState({
    sow: "",
    boar: "",
    breedingDate: "",
    notes: "",
  });

  const sows = animals.filter(
    (a) => a.category === "truie" && a.status === "actif"
  );
  const boars = animals.filter(
    (a) => a.category === "verrat" && a.status === "actif"
  );

  const sowOptions = sows.map((s) => ({ value: s.id, label: s.name }));
  const boarOptions = [
    { value: "unknown", label: "Inconnu" },
    ...boars.map((b) => ({ value: b.id, label: b.name })),
  ];

  const canAddGestation = sows.length > 0;

  const updateField = (field: string, value: string) => {
    setNewGestation((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleView = (gest: (typeof gestations)[0]) => {
    setSelectedGestation(gest);
    setIsViewOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteGestation(id);
    setIsViewOpen(false);
  };

  const handleAddGestation = () => {
    setErrors({});
    setErrorMessage("");

    const dataToValidate = {
      sow: newGestation.sow,
      boar: newGestation.boar || "unknown",
      breedingDate: newGestation.breedingDate,
      notes: newGestation.notes,
    };

    const result = gestationSchema.safeParse(dataToValidate);
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
      const sow = animals.find((a) => a.id === newGestation.sow);
      const boar = animals.find((a) => a.id === newGestation.boar);

      if (!sow) {
        setErrors({ sow: "Truie non trouvee" });
        setStatus("error");
        return;
      }

      const addResult = addGestation({
        sowId: newGestation.sow,
        sowName: sow.name,
        boarId: newGestation.boar ? newGestation.boar : undefined,
        boarName: boar ? boar.name : undefined,
        breedingDate: newGestation.breedingDate,
        status: "active",
        notes: newGestation.notes || undefined,
      });

      if (!result) {
        setStatus("error");
        setErrorMessage("Erreur lors de l'enregistrement. Veuillez réessayer.");
        return;
      }

      setStatus("success");

      setTimeout(() => {
        setNewGestation({ sow: "", boar: "", breedingDate: "", notes: "" });
        setIsAddOpen(false);
        setStatus("idle");
      }, 1500);
    } catch (error) {
      console.error("[Gestation] Error:", error);
      setStatus("error");
      // Message générique pour l'utilisateur, détails loggés côté serveur
      setErrorMessage(
        "Une erreur est survenue lors de l'enregistrement. Veuillez réessayer."
      );
    } finally {
      setStatus((prev) => (prev === "loading" ? "error" : prev));
    }
  };

  const handleComplete = async () => {
    setCompleteErrors({});

    if (!selectedGestation) return;

    const pigletCount = Number.parseInt(completeData.pigletCount);
    const pigletsSurvived = Number.parseInt(completeData.pigletsSurvived);

    if (!completeData.pigletCount || isNaN(pigletCount) || pigletCount < 0) {
      setCompleteErrors({
        pigletCount: "Entrez un nombre valide de porcelets",
      });
      return;
    }

    if (
      completeData.pigletsSurvived &&
      (isNaN(pigletsSurvived) || pigletsSurvived < 0)
    ) {
      setCompleteErrors({ pigletsSurvived: "Entrez un nombre valide" });
      return;
    }

    if (pigletsSurvived > pigletCount) {
      setCompleteErrors({
        pigletsSurvived: "Ne peut pas depasser le nombre total",
      });
      return;
    }

    await completeGestation(
      selectedGestation.id,
      pigletCount,
      pigletsSurvived || pigletCount
    );
    setIsCompleteOpen(false);
    setIsViewOpen(false);
    setCompleteData({ pigletCount: "", pigletsSurvived: "" });
  };

  const getGestationProgress = (gest: (typeof gestations)[0]) => {
    const breedingDate = new Date(gest.breedingDate);
    const today = new Date();
    const daysPassed = Math.floor(
      (today.getTime() - breedingDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    return {
      day: Math.max(0, Math.min(114, daysPassed)),
      totalDays: 114,
      percent: Math.round((Math.min(114, daysPassed) / 114) * 100),
      daysRemaining: Math.max(0, 114 - daysPassed),
    };
  };

  const getStatusStyle = (gest: (typeof gestations)[0]) => {
    const { day } = getGestationProgress(gest);
    if (day >= 107) return { status: "Mise-bas bientôt", color: "bg-red-500" };
    if (day >= 84) return { status: "3ème mois", color: "bg-amber-500" };
    if (day >= 28)
      return { status: "Gestation en cours", color: "bg-green-500" };
    return { status: "Début de gestation", color: "bg-blue-500" };
  };

  const activeGestations = gestations.filter((g) => g.status === "active");

  return (
    <>
      <Card className="shadow-soft">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Baby className="h-5 w-5 text-pink-500" />
            Suivi des gestations ({activeGestations.length})
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (canAddGestation) {
                  setIsAddOpen(true);
                  setErrors({});
                  setStatus("idle");
                }
              }}
              disabled={!canAddGestation}
              title={!canAddGestation ? "Ajoutez d'abord une truie" : ""}
            >
              <Plus className="h-4 w-4 mr-1" />
              Enregistrer une saillie
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/dashboard/reproduction")}
            >
              Voir tout
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!canAddGestation && (
            <div className="flex items-start gap-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 p-4 mb-4">
              <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  Aucune truie dans votre élevage
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                  Pour enregistrer une saillie, ajoutez d'abord au moins une
                  truie à votre élevage.
                </p>
                <Link href="/dashboard/livestock/add">
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 bg-transparent border-amber-300"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Ajouter une truie
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {activeGestations.length === 0 ? (
            <div className="text-center py-8">
              <Baby className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-muted-foreground font-medium">
                Aucune gestation en cours
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Enregistrez une saillie pour suivre la gestation et connaître la
                date de mise-bas.
              </p>
              {canAddGestation && (
                <Button
                  variant="outline"
                  className="mt-4 bg-transparent"
                  onClick={() => setIsAddOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Enregistrer une saillie
                </Button>
              )}
            </div>
          ) : (
            activeGestations.map((gest) => {
              const progress = getGestationProgress(gest);
              const statusStyle = getStatusStyle(gest);

              return (
                <div
                  key={gest.id}
                  className="rounded-xl border border-border p-4 transition hover:bg-muted/50"
                >
                  <div className="flex items-start gap-4">
                    <div className="h-14 w-14 rounded-xl bg-pink-100 flex items-center justify-center">
                      <Baby className="h-7 w-7 text-pink-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-foreground">
                            {gest.sowName}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Père: {gest.boarName || "Non renseigné"}
                          </p>
                        </div>
                        <Badge
                          className={`${statusStyle.color} text-white text-xs`}
                        >
                          {statusStyle.status}
                        </Badge>
                      </div>

                      <div className="mt-3">
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Jour {progress.day} / {progress.totalDays}
                          </span>
                          <span className="font-medium text-foreground">
                            {progress.daysRemaining > 0
                              ? `${progress.daysRemaining} jours restants`
                              : "Terme atteint"}
                          </span>
                        </div>
                        <Progress value={progress.percent} className="h-2" />
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Saillie:{" "}
                          {new Date(gest.breedingDate).toLocaleDateString(
                            "fr-FR"
                          )}
                        </span>
                        <span className="flex items-center gap-1">
                          <Baby className="h-3 w-3" />
                          Terme:{" "}
                          {new Date(gest.expectedDueDate).toLocaleDateString(
                            "fr-FR"
                          )}
                        </span>
                      </div>

                      {gest.notes && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          {gest.notes}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleView(gest)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* View Gestation Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Details de la gestation</DialogTitle>
          </DialogHeader>
          {selectedGestation && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-xl bg-pink-100 flex items-center justify-center">
                  <Baby className="h-8 w-8 text-pink-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {selectedGestation.sowName}
                  </h3>
                  <p className="text-muted-foreground">
                    Père: {selectedGestation.boarName || "Non renseigné"}
                  </p>
                </div>
              </div>

              {(() => {
                const progress = getGestationProgress(selectedGestation);
                return (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Progression</span>
                      <span className="font-medium">
                        Jour {progress.day} / {progress.totalDays} (
                        {progress.daysRemaining} jours restants)
                      </span>
                    </div>
                    <Progress value={progress.percent} className="h-3" />
                  </div>
                );
              })()}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground text-sm">
                    Date de saillie
                  </span>
                  <p className="font-medium">
                    {new Date(
                      selectedGestation.breedingDate
                    ).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground text-sm">
                    Mise-bas prévue
                  </span>
                  <p className="font-medium">
                    {new Date(
                      selectedGestation.expectedDueDate
                    ).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {selectedGestation.notes && (
                <div>
                  <span className="text-muted-foreground text-sm">Notes</span>
                  <p className="mt-1 p-3 bg-muted rounded-lg text-sm">
                    {selectedGestation.notes}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="flex gap-2">
            <Button
              variant="default"
              className="gap-2"
              onClick={() => {
                setIsCompleteOpen(true);
                setCompleteErrors({});
              }}
            >
              <CheckCircle className="h-4 w-4" />
              La truie a mis bas
            </Button>
            <Button
              variant="destructive"
              className="gap-2"
              onClick={() =>
                selectedGestation && handleDelete(selectedGestation.id)
              }
            >
              <Trash2 className="h-4 w-4" />
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete Gestation Dialog */}
      <Dialog open={isCompleteOpen} onOpenChange={setIsCompleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enregistrer la mise-bas</DialogTitle>
            <DialogDescription>
              Félicitations ! La truie a mis bas. Combien de porcelets sont nés
              ?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <FormInput
              label="Combien de porcelets sont nés ?"
              name="pigletCount"
              type="number"
              value={completeData.pigletCount}
              onChange={(e) => {
                setCompleteData({
                  ...completeData,
                  pigletCount: e.target.value,
                });
                if (completeErrors.pigletCount)
                  setCompleteErrors({ ...completeErrors, pigletCount: "" });
              }}
              placeholder="Ex: 12"
              error={completeErrors.pigletCount}
              required
            />
            <FormInput
              label="Combien sont vivants ? (optionnel)"
              name="pigletsSurvived"
              type="number"
              value={completeData.pigletsSurvived}
              onChange={(e) => {
                setCompleteData({
                  ...completeData,
                  pigletsSurvived: e.target.value,
                });
                if (completeErrors.pigletsSurvived)
                  setCompleteErrors({ ...completeErrors, pigletsSurvived: "" });
              }}
              placeholder="Ex: 11 (laissez vide si tous sont vivants)"
              error={completeErrors.pigletsSurvived}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCompleteOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleComplete}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Enregistrer la portée
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Gestation Dialog */}
      <Dialog
        open={isAddOpen}
        onOpenChange={(open) => {
          setIsAddOpen(open);
          if (!open) {
            setErrors({});
            setStatus("idle");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enregistrer une saillie</DialogTitle>
            <DialogDescription>
              Une truie a été saillie ? Enregistrez-la pour suivre la gestation
              et connaître la date prévue de mise-bas.
            </DialogDescription>
          </DialogHeader>

          {status === "success" && (
            <div className="flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 p-3 text-sm text-green-800 dark:text-green-200">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>
                Saillie enregistrée ! La mise-bas est prévue dans 114 jours
                (environ 3 mois et 3 semaines).
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

          <div className="space-y-4 py-4">
            <FormSelect
              label="Quelle truie a été saillie ?"
              name="sow"
              options={sowOptions}
              value={newGestation.sow}
              onChange={(v) => updateField("sow", v)}
              required
              placeholder="Choisissez une truie"
              error={errors.sow}
              disabled={status === "loading" || status === "success"}
            />
            <FormSelect
              label="Quel verrat ? (optionnel)"
              name="boar"
              options={boarOptions}
              value={newGestation.boar}
              onChange={(v) => updateField("boar", v)}
              placeholder="Choisissez un verrat si connu"
              error={errors.boar}
              disabled={status === "loading" || status === "success"}
            />
            <FormInput
              label="Quand a eu lieu la saillie ?"
              name="breedingDate"
              type="date"
              value={newGestation.breedingDate}
              onChange={(e) => updateField("breedingDate", e.target.value)}
              required
              error={errors.breedingDate}
              disabled={status === "loading" || status === "success"}
            />
            <FormTextarea
              label="Notes (optionnel)"
              name="notes"
              value={newGestation.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              placeholder="Observations, remarques sur la saillie..."
              error={errors.notes}
              disabled={status === "loading" || status === "success"}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddOpen(false)}
              disabled={status === "loading"}
            >
              Annuler
            </Button>
            <Button
              onClick={handleAddGestation}
              disabled={status === "loading" || status === "success"}
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
                "Enregistrer la saillie"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
