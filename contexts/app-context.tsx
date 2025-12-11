"use client";

import type React from "react";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  getDatabase,
  type Animal,
  type HealthCase,
  type Gestation,
  type Vaccination,
  type Activity,
  type FeedingRecord,
} from "@/lib/storage/local-database";
import * as HealthCasesSupabase from "@/lib/supabase/health-cases";
import * as GestationsSupabase from "@/lib/supabase/gestations";
import * as PigsSupabase from "@/lib/supabase/pigs";
import { useAuthContext } from "./auth-context";

interface AppContextType {
  // Animals
  animals: Animal[];
  addAnimal: (
    animal: Omit<Animal, "id" | "createdAt" | "updatedAt">
  ) => Promise<Animal>;
  updateAnimal: (
    id: string,
    updates: Partial<Animal>
  ) => Promise<Animal | null>;
  deleteAnimal: (id: string) => Promise<boolean>;
  sellAnimal: (id: string) => Promise<Animal | null>;
  markAnimalDead: (id: string) => Promise<Animal | null>;
  getAnimalById: (id: string) => Animal | undefined;
  getAnimalsByCategory: (category: Animal["category"]) => Animal[];

  // Health
  healthCases: HealthCase[];
  addHealthCase: (
    healthCase: Omit<HealthCase, "id" | "createdAt">
  ) => Promise<HealthCase>;
  updateHealthCase: (
    id: string,
    updates: Partial<HealthCase>
  ) => Promise<HealthCase | null>;
  deleteHealthCase: (id: string) => Promise<boolean>;

  // Gestations
  gestations: Gestation[];
  addGestation: (
    gestation: Omit<Gestation, "id" | "createdAt" | "expectedDueDate">
  ) => Promise<Gestation>;
  updateGestation: (
    id: string,
    updates: Partial<Gestation>
  ) => Promise<Gestation | null>;
  completeGestation: (
    id: string,
    pigletCount: number,
    pigletsSurvived: number
  ) => Promise<Gestation | null>;
  deleteGestation: (id: string) => Promise<boolean>;

  // Vaccinations
  vaccinations: Vaccination[];
  addVaccination: (
    vaccination: Omit<Vaccination, "id" | "createdAt" | "status">
  ) => Vaccination;
  completeVaccination: (
    id: string,
    completedCount: number
  ) => Vaccination | null;

  // Feeding
  feedingRecords: FeedingRecord[];
  addFeedingRecord: (
    record: Omit<FeedingRecord, "id" | "createdAt">
  ) => FeedingRecord;

  // Activities & Alerts
  activities: Activity[];
  alerts: {
    type: string;
    title: string;
    description: string;
    priority: string;
    link: string;
  }[];

  // Stats
  stats: {
    totalAnimals: number;
    truies: number;
    verrats: number;
    porcelets: number;
    porcs: number;
    gestationsActives: number;
    cassSanteActifs: number;
    coutAlimentationMois: number;
    alertesCount: number;
  };

  // Utility
  refreshData: () => void;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuthContext();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [healthCases, setHealthCases] = useState<HealthCase[]>([]);
  const [gestations, setGestations] = useState<Gestation[]>([]);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [feedingRecords, setFeedingRecords] = useState<FeedingRecord[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [alerts, setAlerts] = useState<
    {
      type: string;
      title: string;
      description: string;
      priority: string;
      link: string;
    }[]
  >([]);
  const [stats, setStats] = useState({
    totalAnimals: 0,
    truies: 0,
    verrats: 0,
    porcelets: 0,
    porcs: 0,
    gestationsActives: 0,
    cassSanteActifs: 0,
    coutAlimentationMois: 0,
    alertesCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const refreshData = useCallback(async () => {
    const db = getDatabase();
    setVaccinations(db.getVaccinations());
    setFeedingRecords(db.getFeedingRecords());
    setActivities(db.getActivities(20));
    setAlerts(db.getAlerts());

    let currentAnimals: Animal[] = [];
    let currentHealthCases: HealthCase[] = [];
    let currentGestations: Gestation[] = [];

    // Charger depuis Supabase si utilisateur connecté
    if (user?.id) {
      try {
        const [animalsData, healthCasesData, gestationsData] =
          await Promise.all([
            PigsSupabase.getPigs(user.id),
            HealthCasesSupabase.getHealthCases(user.id),
            GestationsSupabase.getGestations(user.id),
          ]);
        currentAnimals = animalsData;
        currentHealthCases = healthCasesData;
        currentGestations = gestationsData;
        setAnimals(animalsData);
        setHealthCases(healthCasesData);
        setGestations(gestationsData);
      } catch (error) {
        console.error("[AppContext] Error loading from Supabase:", error);
        // Fallback sur localStorage en cas d'erreur (mode démo uniquement)
        currentAnimals = db.getAnimals();
        currentHealthCases = db.getHealthCases();
        currentGestations = db.getGestations();
        setAnimals(currentAnimals);
        setHealthCases(currentHealthCases);
        setGestations(currentGestations);
      }
    } else {
      // Fallback localStorage si pas connecté (mode démo uniquement)
      currentAnimals = db.getAnimals();
      currentHealthCases = db.getHealthCases();
      currentGestations = db.getGestations();
      setAnimals(currentAnimals);
      setHealthCases(currentHealthCases);
      setGestations(currentGestations);
    }

    // Recalculer les stats depuis les données réelles (Supabase ou localStorage)
    // Toutes les stats proviennent maintenant de Supabase (ou localStorage en fallback)
    const totalAnimalsCount = currentAnimals.filter(
      (a) => a.status === "actif"
    ).length;
    const truiesCount = currentAnimals.filter(
      (a) => a.category === "truie" && a.status === "actif"
    ).length;
    const verratsCount = currentAnimals.filter(
      (a) => a.category === "verrat" && a.status === "actif"
    ).length;
    const porceletsCount = currentAnimals.filter(
      (a) => a.category === "porcelet" && a.status === "actif"
    ).length;
    const porcsCount = currentAnimals.filter(
      (a) => a.category === "porc" && a.status === "actif"
    ).length;
    const gestationsActivesCount = currentGestations.filter(
      (g) => g.status === "active"
    ).length;
    const cassSanteActifsCount = currentHealthCases.filter(
      (h) => h.status !== "resolved"
    ).length;

    setStats({
      totalAnimals: totalAnimalsCount,
      truies: truiesCount,
      verrats: verratsCount,
      porcelets: porceletsCount,
      porcs: porcsCount,
      gestationsActives: gestationsActivesCount,
      cassSanteActifs: cassSanteActifsCount,
      // Coût alimentation: toujours depuis localStorage pour l'instant (pas encore migré)
      coutAlimentationMois: db.getDashboardStats().coutAlimentationMois,
      // Alertes: depuis localStorage pour l'instant
      alertesCount: db.getAlerts().length,
    });
  }, [user?.id]);

  useEffect(() => {
    refreshData();
    setIsLoading(false);
  }, [refreshData, user?.id]);

  // Animal methods - Migration Supabase
  const addAnimal = useCallback(
    async (animal: Omit<Animal, "id" | "createdAt" | "updatedAt">) => {
      if (user?.id) {
        try {
          const newAnimal = await PigsSupabase.createPig(animal, user.id);
          if (newAnimal) {
            await refreshData();
            return newAnimal;
          }
        } catch (error) {
          console.error("[AppContext] Error adding animal to Supabase:", error);
          // Si erreur d'unicité, re-throw pour que le formulaire puisse l'afficher
          if (error instanceof Error && error.message.includes("boucle")) {
            throw error;
          }
        }
      }
      // Fallback localStorage (mode démo uniquement)
      const db = getDatabase();
      const newAnimal = db.addAnimal(animal);
      refreshData();
      return newAnimal;
    },
    [refreshData, user?.id]
  );

  const updateAnimal = useCallback(
    async (id: string, updates: Partial<Animal>) => {
      if (user?.id) {
        try {
          const updated = await PigsSupabase.updatePig(id, updates, user.id);
          if (updated) {
            await refreshData();
            return updated;
          }
        } catch (error) {
          console.error(
            "[AppContext] Error updating animal in Supabase:",
            error
          );
          // Si erreur d'unicité, re-throw pour que le formulaire puisse l'afficher
          if (error instanceof Error && error.message.includes("boucle")) {
            throw error;
          }
        }
      }
      // Fallback localStorage (mode démo uniquement)
      const db = getDatabase();
      const updated = db.updateAnimal(id, updates);
      refreshData();
      return updated;
    },
    [refreshData, user?.id]
  );

  const deleteAnimal = useCallback(
    async (id: string) => {
      if (user?.id) {
        try {
          const result = await PigsSupabase.deletePig(id, user.id);
          if (result) {
            await refreshData();
            return result;
          }
        } catch (error) {
          console.error(
            "[AppContext] Error deleting animal from Supabase:",
            error
          );
        }
      }
      // Fallback localStorage (mode démo uniquement)
      const db = getDatabase();
      const result = db.deleteAnimal(id);
      refreshData();
      return result;
    },
    [refreshData, user?.id]
  );

  const sellAnimal = useCallback(
    async (id: string) => {
      if (user?.id) {
        try {
          const result = await PigsSupabase.sellPig(id, user.id);
          if (result) {
            await refreshData();
            return result;
          }
        } catch (error) {
          console.error(
            "[AppContext] Error selling animal in Supabase:",
            error
          );
        }
      }
      // Fallback localStorage (mode démo uniquement)
      const db = getDatabase();
      const result = db.sellAnimal(id);
      refreshData();
      return result;
    },
    [refreshData, user?.id]
  );

  const markAnimalDead = useCallback(
    async (id: string) => {
      if (user?.id) {
        try {
          const result = await PigsSupabase.markPigDead(id, user.id);
          if (result) {
            await refreshData();
            return result;
          }
        } catch (error) {
          console.error(
            "[AppContext] Error marking animal dead in Supabase:",
            error
          );
        }
      }
      // Fallback localStorage (mode démo uniquement)
      const db = getDatabase();
      const result = db.markAnimalDead(id);
      refreshData();
      return result;
    },
    [refreshData, user?.id]
  );

  const getAnimalById = useCallback(
    (id: string) => {
      // Chercher dans les animaux chargés depuis Supabase/localStorage
      return animals.find((a) => a.id === id);
    },
    [animals]
  );

  const getAnimalsByCategory = useCallback(
    (category: Animal["category"]) => {
      // Filtrer les animaux chargés depuis Supabase/localStorage
      return animals.filter((a) => a.category === category);
    },
    [animals]
  );

  // Health methods - Migration Supabase
  const addHealthCase = useCallback(
    async (healthCase: Omit<HealthCase, "id" | "createdAt">) => {
      if (user?.id) {
        try {
          const newCase = await HealthCasesSupabase.createHealthCase(
            healthCase,
            user.id
          );
          if (newCase) {
            await refreshData();
            return newCase;
          }
        } catch (error) {
          console.error(
            "[AppContext] Error adding health case to Supabase:",
            error
          );
        }
      }
      // Fallback localStorage
      const db = getDatabase();
      const newCase = db.addHealthCase(healthCase);
      refreshData();
      return newCase;
    },
    [refreshData, user?.id]
  );

  const updateHealthCase = useCallback(
    async (id: string, updates: Partial<HealthCase>) => {
      if (user?.id) {
        try {
          const updated = await HealthCasesSupabase.updateHealthCase(
            id,
            updates,
            user.id
          );
          if (updated) {
            await refreshData();
            return updated;
          }
        } catch (error) {
          console.error(
            "[AppContext] Error updating health case in Supabase:",
            error
          );
        }
      }
      // Fallback localStorage
      const db = getDatabase();
      const updated = db.updateHealthCase(id, updates);
      refreshData();
      return updated;
    },
    [refreshData, user?.id]
  );

  const deleteHealthCase = useCallback(
    async (id: string) => {
      if (user?.id) {
        try {
          const result = await HealthCasesSupabase.deleteHealthCase(
            id,
            user.id
          );
          if (result) {
            await refreshData();
            return result;
          }
        } catch (error) {
          console.error(
            "[AppContext] Error deleting health case from Supabase:",
            error
          );
        }
      }
      // Fallback localStorage
      const db = getDatabase();
      const result = db.deleteHealthCase(id);
      refreshData();
      return result;
    },
    [refreshData, user?.id]
  );

  // Gestation methods - Migration Supabase
  const addGestation = useCallback(
    async (
      gestation: Omit<Gestation, "id" | "createdAt" | "expectedDueDate">
    ) => {
      if (user?.id) {
        try {
          const newGestation = await GestationsSupabase.createGestation(
            gestation,
            user.id
          );
          if (newGestation) {
            await refreshData();
            return newGestation;
          }
        } catch (error) {
          console.error(
            "[AppContext] Error adding gestation to Supabase:",
            error
          );
        }
      }
      // Fallback localStorage
      const db = getDatabase();
      const newGestation = db.addGestation(gestation);
      refreshData();
      return newGestation;
    },
    [refreshData, user?.id]
  );

  const updateGestation = useCallback(
    async (id: string, updates: Partial<Gestation>) => {
      if (user?.id) {
        try {
          const updated = await GestationsSupabase.updateGestation(
            id,
            updates,
            user.id
          );
          if (updated) {
            await refreshData();
            return updated;
          }
        } catch (error) {
          console.error(
            "[AppContext] Error updating gestation in Supabase:",
            error
          );
        }
      }
      // Fallback localStorage
      const db = getDatabase();
      const updated = db.updateGestation(id, updates);
      refreshData();
      return updated;
    },
    [refreshData, user?.id]
  );

  const completeGestation = useCallback(
    async (id: string, pigletCount: number, pigletsSurvived: number) => {
      if (user?.id) {
        try {
          const result = await GestationsSupabase.updateGestation(
            id,
            {
              status: "completed",
              actualDueDate: new Date().toISOString().split("T")[0],
              pigletCount,
              pigletsSurvived,
            },
            user.id
          );
          if (result) {
            await refreshData();
            return result;
          }
        } catch (error) {
          console.error(
            "[AppContext] Error completing gestation in Supabase:",
            error
          );
        }
      }
      // Fallback localStorage
      const db = getDatabase();
      const result = db.completeGestation(id, pigletCount, pigletsSurvived);
      refreshData();
      return result;
    },
    [refreshData, user?.id]
  );

  const deleteGestation = useCallback(
    async (id: string) => {
      if (user?.id) {
        try {
          const result = await GestationsSupabase.deleteGestation(id, user.id);
          if (result) {
            await refreshData();
            return result;
          }
        } catch (error) {
          console.error(
            "[AppContext] Error deleting gestation from Supabase:",
            error
          );
        }
      }
      // Fallback localStorage
      const db = getDatabase();
      const result = db.deleteGestation(id);
      refreshData();
      return result;
    },
    [refreshData, user?.id]
  );

  // Vaccination methods
  const addVaccination = useCallback(
    (vaccination: Omit<Vaccination, "id" | "createdAt">) => {
      const db = getDatabase();
      const newVaccination = db.addVaccination(vaccination);
      refreshData();
      return newVaccination;
    },
    [refreshData]
  );

  const completeVaccination = useCallback(
    (id: string, completedCount: number) => {
      const db = getDatabase();
      const result = db.completeVaccination(id, completedCount);
      refreshData();
      return result;
    },
    [refreshData]
  );

  // Feeding methods
  const addFeedingRecord = useCallback(
    (record: Omit<FeedingRecord, "id" | "createdAt">) => {
      const db = getDatabase();
      const newRecord = db.addFeedingRecord(record);
      refreshData();
      return newRecord;
    },
    [refreshData]
  );

  return (
    <AppContext.Provider
      value={{
        animals,
        addAnimal,
        updateAnimal,
        deleteAnimal,
        sellAnimal,
        markAnimalDead,
        getAnimalById,
        getAnimalsByCategory,
        healthCases,
        addHealthCase,
        updateHealthCase,
        deleteHealthCase,
        gestations,
        addGestation,
        updateGestation,
        completeGestation,
        deleteGestation,
        vaccinations,
        addVaccination: addVaccination as (
          vaccination: Omit<Vaccination, "id" | "createdAt" | "status">
        ) => Vaccination,
        completeVaccination,
        feedingRecords,
        addFeedingRecord,
        activities,
        alerts,
        stats,
        refreshData,
        isLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
