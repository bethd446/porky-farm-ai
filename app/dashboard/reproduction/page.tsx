"use client";

import { ReproductionStats } from "@/components/reproduction/reproduction-stats";
import { GestationTracker } from "@/components/reproduction/gestation-tracker";
import { BreedingCalendar } from "@/components/reproduction/breeding-calendar";

export default function ReproductionPage() {
  // Les boutons sont maintenant gérés directement dans le composant GestationTracker
  // via les modals DialogTrigger intégrés
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Reproduction & Gestation
          </h1>
          <p className="text-muted-foreground">
            Suivi complet du cycle reproductif
          </p>
        </div>
      </div>

      <ReproductionStats />
      <GestationTracker />
      <BreedingCalendar />
    </div>
  );
}
