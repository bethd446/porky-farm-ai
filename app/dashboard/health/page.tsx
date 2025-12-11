"use client";

import { HealthOverview } from "@/components/health/health-overview";
import { HealthCases } from "@/components/health/health-cases";
import { HealthVaccinations } from "@/components/health/health-vaccinations";
import { useState } from "react";

export default function HealthPage() {
  // Les boutons sont maintenant gérés directement dans le composant HealthCases
  // via les modals DialogTrigger intégrés
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Santé & Vétérinaire
          </h1>
          <p className="text-muted-foreground">
            Suivi sanitaire complet de votre élevage
          </p>
        </div>
      </div>

      <HealthOverview />

      <div className="grid gap-6 lg:grid-cols-2">
        <HealthCases />
        <HealthVaccinations />
      </div>
    </div>
  );
}
