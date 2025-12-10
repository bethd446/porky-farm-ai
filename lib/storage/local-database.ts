// Système de base de données locale pour PorkyFarm
// Simule une vraie BDD avec localStorage pour persistence

export interface Animal {
  id: string
  identifier: string
  name: string
  category: "truie" | "verrat" | "porcelet" | "porc"
  breed: string
  birthDate: string
  weight: number
  status: "actif" | "vendu" | "mort" | "malade"
  healthStatus: "bon" | "moyen" | "mauvais"
  photo?: string
  motherId?: string
  fatherId?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface HealthCase {
  id: string
  animalId: string
  animalName: string
  issue: string
  description: string
  priority: "low" | "medium" | "high" | "critical"
  status: "open" | "in_progress" | "resolved"
  treatment?: string
  veterinarian?: string
  photo?: string
  cost?: number
  startDate: string
  resolvedDate?: string
  createdAt: string
}

export interface Gestation {
  id: string
  sowId: string
  sowName: string
  boarId?: string
  boarName?: string
  breedingDate: string
  expectedDueDate: string
  actualDueDate?: string
  status: "active" | "completed" | "failed"
  pigletCount?: number
  pigletsSurvived?: number
  notes?: string
  createdAt: string
}

export interface Vaccination {
  id: string
  animalId: string
  animalName: string
  vaccineName: string
  date: string
  nextDueDate?: string
  veterinarian?: string
  notes?: string
  createdAt: string
}

export interface Activity {
  id: string
  type: "animal_added" | "animal_sold" | "health_case" | "gestation" | "vaccination" | "feeding" | "death"
  title: string
  description: string
  entityId?: string
  entityType?: string
  createdAt: string
}

export interface FeedingRecord {
  id: string
  date: string
  category: string
  animalCount: number
  totalKg: number
  costPerKg: number
  totalCost: number
  notes?: string
  createdAt: string
}

interface Database {
  animals: Animal[]
  healthCases: HealthCase[]
  gestations: Gestation[]
  vaccinations: Vaccination[]
  activities: Activity[]
  feedingRecords: FeedingRecord[]
}

const DB_KEY = "porkyfarm_db"

// Données de démonstration
const defaultData: Database = {
  animals: [
    {
      id: "1",
      identifier: "TR-001",
      name: "Bella",
      category: "truie",
      breed: "Large White",
      birthDate: "2022-03-15",
      weight: 180,
      status: "actif",
      healthStatus: "bon",
      photo: "/white-sow-pig.jpg",
      notes: "Excellente reproductrice",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "2",
      identifier: "TR-002",
      name: "Rosa",
      category: "truie",
      breed: "Landrace",
      birthDate: "2022-06-20",
      weight: 165,
      status: "actif",
      healthStatus: "bon",
      photo: "/landrace-sow-pig.jpg",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "3",
      identifier: "TR-003",
      name: "Luna",
      category: "truie",
      breed: "Duroc",
      birthDate: "2023-01-10",
      weight: 150,
      status: "malade",
      healthStatus: "moyen",
      photo: "/duroc-sow-pig.jpg",
      createdAt: "2024-02-01T00:00:00Z",
      updatedAt: "2024-02-01T00:00:00Z",
    },
    {
      id: "4",
      identifier: "VR-001",
      name: "Thor",
      category: "verrat",
      breed: "Piétrain",
      birthDate: "2021-08-05",
      weight: 250,
      status: "actif",
      healthStatus: "bon",
      photo: "/pietrain-boar-pig.jpg",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "5",
      identifier: "VR-002",
      name: "Max",
      category: "verrat",
      breed: "Large White",
      birthDate: "2022-02-14",
      weight: 230,
      status: "actif",
      healthStatus: "bon",
      photo: "/large-white-boar-pig.jpg",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "6",
      identifier: "PC-001",
      name: "Petit 1",
      category: "porcelet",
      breed: "Croisé",
      birthDate: "2024-10-01",
      weight: 8,
      status: "actif",
      healthStatus: "bon",
      motherId: "1",
      fatherId: "4",
      photo: "/piglet-baby-pig.jpg",
      createdAt: "2024-10-01T00:00:00Z",
      updatedAt: "2024-10-01T00:00:00Z",
    },
    {
      id: "7",
      identifier: "PC-002",
      name: "Petit 2",
      category: "porcelet",
      breed: "Croisé",
      birthDate: "2024-10-01",
      weight: 7,
      status: "actif",
      healthStatus: "bon",
      motherId: "1",
      fatherId: "4",
      photo: "/small-piglet.jpg",
      createdAt: "2024-10-01T00:00:00Z",
      updatedAt: "2024-10-01T00:00:00Z",
    },
    {
      id: "8",
      identifier: "PO-001",
      name: "Gros",
      category: "porc",
      breed: "Large White",
      birthDate: "2024-03-15",
      weight: 95,
      status: "actif",
      healthStatus: "bon",
      photo: "/fattening-pig.jpg",
      createdAt: "2024-03-15T00:00:00Z",
      updatedAt: "2024-03-15T00:00:00Z",
    },
  ],
  healthCases: [
    {
      id: "1",
      animalId: "3",
      animalName: "Luna",
      issue: "Boiterie",
      description: "Boiterie patte arrière droite, possible entorse",
      priority: "medium",
      status: "in_progress",
      treatment: "Anti-inflammatoires + repos",
      veterinarian: "Dr. Kouassi",
      cost: 25000,
      startDate: "2024-12-01",
      createdAt: "2024-12-01T00:00:00Z",
    },
    {
      id: "2",
      animalId: "6",
      animalName: "Petit 1",
      issue: "Diarrhée",
      description: "Diarrhée légère depuis 2 jours",
      priority: "low",
      status: "resolved",
      treatment: "Réhydratation + probiotiques",
      startDate: "2024-11-25",
      resolvedDate: "2024-11-28",
      createdAt: "2024-11-25T00:00:00Z",
    },
  ],
  gestations: [
    {
      id: "1",
      sowId: "1",
      sowName: "Bella",
      boarId: "4",
      boarName: "Thor",
      breedingDate: "2024-09-15",
      expectedDueDate: "2025-01-07",
      status: "active",
      notes: "Première saillie réussie",
      createdAt: "2024-09-15T00:00:00Z",
    },
    {
      id: "2",
      sowId: "2",
      sowName: "Rosa",
      boarId: "5",
      boarName: "Max",
      breedingDate: "2024-10-01",
      expectedDueDate: "2025-01-23",
      status: "active",
      createdAt: "2024-10-01T00:00:00Z",
    },
  ],
  vaccinations: [
    {
      id: "1",
      animalId: "1",
      animalName: "Bella",
      vaccineName: "Parvovirose",
      date: "2024-06-15",
      nextDueDate: "2025-06-15",
      veterinarian: "Dr. Kouassi",
      createdAt: "2024-06-15T00:00:00Z",
    },
    {
      id: "2",
      animalId: "4",
      animalName: "Thor",
      vaccineName: "Rouget",
      date: "2024-08-01",
      nextDueDate: "2025-02-01",
      veterinarian: "Dr. Kouassi",
      createdAt: "2024-08-01T00:00:00Z",
    },
  ],
  activities: [
    {
      id: "1",
      type: "health_case",
      title: "Nouveau cas de santé",
      description: "Luna présente une boiterie",
      entityId: "1",
      entityType: "health_case",
      createdAt: "2024-12-01T10:00:00Z",
    },
    {
      id: "2",
      type: "gestation",
      title: "Nouvelle gestation",
      description: "Rosa confirmée gestante",
      entityId: "2",
      entityType: "gestation",
      createdAt: "2024-10-01T08:00:00Z",
    },
    {
      id: "3",
      type: "vaccination",
      title: "Vaccination effectuée",
      description: "Thor vacciné contre le Rouget",
      entityId: "2",
      entityType: "vaccination",
      createdAt: "2024-08-01T14:00:00Z",
    },
  ],
  feedingRecords: [
    {
      id: "1",
      date: "2024-12-06",
      category: "truie",
      animalCount: 3,
      totalKg: 9,
      costPerKg: 350,
      totalCost: 3150,
      createdAt: "2024-12-06T07:00:00Z",
    },
    {
      id: "2",
      date: "2024-12-06",
      category: "verrat",
      animalCount: 2,
      totalKg: 7,
      costPerKg: 350,
      totalCost: 2450,
      createdAt: "2024-12-06T07:00:00Z",
    },
  ],
}

class LocalDatabase {
  private data: Database

  constructor() {
    this.data = this.load()
  }

  private load(): Database {
    if (typeof window === "undefined") return defaultData

    try {
      const stored = localStorage.getItem(DB_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (e) {
      console.error("Error loading database:", e)
    }

    // Initialiser avec les données par défaut
    this.save(defaultData)
    return defaultData
  }

  private save(data: Database) {
    if (typeof window === "undefined") return

    try {
      localStorage.setItem(DB_KEY, JSON.stringify(data))
    } catch (e) {
      console.error("Error saving database:", e)
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  private addActivity(activity: Omit<Activity, "id" | "createdAt">) {
    const newActivity: Activity = {
      ...activity,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
    }
    this.data.activities.unshift(newActivity)
    // Garder seulement les 50 dernières activités
    this.data.activities = this.data.activities.slice(0, 50)
    this.save(this.data)
  }

  // ============ ANIMALS ============

  getAnimals(): Animal[] {
    return [...this.data.animals]
  }

  getAnimalById(id: string): Animal | undefined {
    return this.data.animals.find((a) => a.id === id)
  }

  getAnimalsByCategory(category: Animal["category"]): Animal[] {
    return this.data.animals.filter((a) => a.category === category)
  }

  addAnimal(animal: Omit<Animal, "id" | "createdAt" | "updatedAt">): Animal {
    const newAnimal: Animal = {
      ...animal,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    this.data.animals.push(newAnimal)
    this.save(this.data)

    this.addActivity({
      type: "animal_added",
      title: "Nouvel animal ajouté",
      description: `${newAnimal.name} (${newAnimal.identifier}) a été ajouté`,
      entityId: newAnimal.id,
      entityType: "animal",
    })

    return newAnimal
  }

  updateAnimal(id: string, updates: Partial<Animal>): Animal | null {
    const index = this.data.animals.findIndex((a) => a.id === id)
    if (index === -1) return null

    this.data.animals[index] = {
      ...this.data.animals[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    this.save(this.data)
    return this.data.animals[index]
  }

  deleteAnimal(id: string): boolean {
    const animal = this.data.animals.find((a) => a.id === id)
    if (!animal) return false

    this.data.animals = this.data.animals.filter((a) => a.id !== id)
    this.save(this.data)
    return true
  }

  sellAnimal(id: string): Animal | null {
    const animal = this.updateAnimal(id, { status: "vendu" })
    if (animal) {
      this.addActivity({
        type: "animal_sold",
        title: "Animal vendu",
        description: `${animal.name} (${animal.identifier}) a été vendu`,
        entityId: animal.id,
        entityType: "animal",
      })
    }
    return animal
  }

  markAnimalDead(id: string): Animal | null {
    const animal = this.updateAnimal(id, { status: "mort" })
    if (animal) {
      this.addActivity({
        type: "death",
        title: "Décès enregistré",
        description: `${animal.name} (${animal.identifier}) est décédé`,
        entityId: animal.id,
        entityType: "animal",
      })
    }
    return animal
  }

  getAnimalStats() {
    const animals = this.data.animals.filter((a) => a.status === "actif")
    return {
      total: animals.length,
      truies: animals.filter((a) => a.category === "truie").length,
      verrats: animals.filter((a) => a.category === "verrat").length,
      porcelets: animals.filter((a) => a.category === "porcelet").length,
      porcs: animals.filter((a) => a.category === "porc").length,
      malades: animals.filter((a) => a.status === "malade" || a.healthStatus !== "bon").length,
      enGestation: this.data.gestations.filter((g) => g.status === "active").length,
    }
  }

  // ============ HEALTH CASES ============

  getHealthCases(): HealthCase[] {
    return [...this.data.healthCases].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  getActiveHealthCases(): HealthCase[] {
    return this.data.healthCases.filter((h) => h.status !== "resolved")
  }

  addHealthCase(healthCase: Omit<HealthCase, "id" | "createdAt">): HealthCase {
    const newCase: HealthCase = {
      ...healthCase,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
    }
    this.data.healthCases.push(newCase)

    // Mettre à jour le statut de l'animal
    if (healthCase.priority === "high" || healthCase.priority === "critical") {
      this.updateAnimal(healthCase.animalId, {
        status: "malade",
        healthStatus: healthCase.priority === "critical" ? "mauvais" : "moyen",
      })
    }

    this.save(this.data)

    this.addActivity({
      type: "health_case",
      title: "Nouveau cas de santé",
      description: `${healthCase.animalName}: ${healthCase.issue}`,
      entityId: newCase.id,
      entityType: "health_case",
    })

    return newCase
  }

  updateHealthCase(id: string, updates: Partial<HealthCase>): HealthCase | null {
    const index = this.data.healthCases.findIndex((h) => h.id === id)
    if (index === -1) return null

    this.data.healthCases[index] = {
      ...this.data.healthCases[index],
      ...updates,
    }

    // Si résolu, mettre à jour l'animal
    if (updates.status === "resolved") {
      const healthCase = this.data.healthCases[index]
      this.updateAnimal(healthCase.animalId, {
        status: "actif",
        healthStatus: "bon",
      })
    }

    this.save(this.data)
    return this.data.healthCases[index]
  }

  deleteHealthCase(id: string): boolean {
    this.data.healthCases = this.data.healthCases.filter((h) => h.id !== id)
    this.save(this.data)
    return true
  }

  // ============ GESTATIONS ============

  getGestations(): Gestation[] {
    return [...this.data.gestations].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  getActiveGestations(): Gestation[] {
    return this.data.gestations.filter((g) => g.status === "active")
  }

  addGestation(gestation: Omit<Gestation, "id" | "createdAt" | "expectedDueDate">): Gestation {
    // Calculer la date prévue (114 jours après la saillie)
    const breedingDate = new Date(gestation.breedingDate)
    const expectedDueDate = new Date(breedingDate)
    expectedDueDate.setDate(expectedDueDate.getDate() + 114)

    const newGestation: Gestation = {
      ...gestation,
      id: this.generateId(),
      expectedDueDate: expectedDueDate.toISOString().split("T")[0],
      createdAt: new Date().toISOString(),
    }
    this.data.gestations.push(newGestation)
    this.save(this.data)

    this.addActivity({
      type: "gestation",
      title: "Nouvelle gestation",
      description: `${gestation.sowName} saillie par ${gestation.boarName || "inconnu"}`,
      entityId: newGestation.id,
      entityType: "gestation",
    })

    return newGestation
  }

  updateGestation(id: string, updates: Partial<Gestation>): Gestation | null {
    const index = this.data.gestations.findIndex((g) => g.id === id)
    if (index === -1) return null

    this.data.gestations[index] = {
      ...this.data.gestations[index],
      ...updates,
    }
    this.save(this.data)
    return this.data.gestations[index]
  }

  completeGestation(id: string, pigletCount: number, pigletsSurvived: number): Gestation | null {
    return this.updateGestation(id, {
      status: "completed",
      actualDueDate: new Date().toISOString().split("T")[0],
      pigletCount,
      pigletsSurvived,
    })
  }

  deleteGestation(id: string): boolean {
    this.data.gestations = this.data.gestations.filter((g) => g.id !== id)
    this.save(this.data)
    return true
  }

  // ============ VACCINATIONS ============

  getVaccinations(): Vaccination[] {
    return [...this.data.vaccinations].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  getUpcomingVaccinations(): Vaccination[] {
    const today = new Date()
    const in30Days = new Date()
    in30Days.setDate(in30Days.getDate() + 30)

    return this.data.vaccinations.filter((v) => {
      if (!v.nextDueDate) return false
      const nextDue = new Date(v.nextDueDate)
      return nextDue >= today && nextDue <= in30Days
    })
  }

  addVaccination(vaccination: Omit<Vaccination, "id" | "createdAt">): Vaccination {
    const newVaccination: Vaccination = {
      ...vaccination,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
    }
    this.data.vaccinations.push(newVaccination)
    this.save(this.data)

    this.addActivity({
      type: "vaccination",
      title: "Vaccination effectuée",
      description: `${vaccination.animalName}: ${vaccination.vaccineName}`,
      entityId: newVaccination.id,
      entityType: "vaccination",
    })

    return newVaccination
  }

  // ============ ACTIVITIES ============

  getActivities(limit = 10): Activity[] {
    return this.data.activities.slice(0, limit)
  }

  // ============ FEEDING ============

  getFeedingRecords(): FeedingRecord[] {
    return [...this.data.feedingRecords].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  addFeedingRecord(record: Omit<FeedingRecord, "id" | "createdAt">): FeedingRecord {
    const newRecord: FeedingRecord = {
      ...record,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
    }
    this.data.feedingRecords.push(newRecord)
    this.save(this.data)

    this.addActivity({
      type: "feeding",
      title: "Alimentation enregistrée",
      description: `${record.totalKg}kg distribués aux ${record.category}s`,
      entityId: newRecord.id,
      entityType: "feeding",
    })

    return newRecord
  }

  // ============ ALERTS ============

  getAlerts(): { type: string; title: string; description: string; priority: string; link: string }[] {
    const alerts: { type: string; title: string; description: string; priority: string; link: string }[] = []

    // Alertes santé
    const criticalCases = this.data.healthCases.filter(
      (h) => h.status !== "resolved" && (h.priority === "critical" || h.priority === "high"),
    )
    criticalCases.forEach((c) => {
      alerts.push({
        type: "health",
        title: `Cas urgent: ${c.animalName}`,
        description: c.issue,
        priority: c.priority,
        link: "/dashboard/health",
      })
    })

    // Alertes gestation (mise-bas proche)
    const today = new Date()
    this.data.gestations
      .filter((g) => g.status === "active")
      .forEach((g) => {
        const dueDate = new Date(g.expectedDueDate)
        const daysUntil = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

        if (daysUntil <= 7 && daysUntil >= 0) {
          alerts.push({
            type: "gestation",
            title: `Mise-bas imminente: ${g.sowName}`,
            description: `Prévue dans ${daysUntil} jour(s)`,
            priority: daysUntil <= 3 ? "high" : "medium",
            link: "/dashboard/reproduction",
          })
        }
      })

    // Alertes vaccination
    const upcomingVaccinations = this.getUpcomingVaccinations()
    upcomingVaccinations.forEach((v) => {
      const nextDue = new Date(v.nextDueDate!)
      const daysUntil = Math.ceil((nextDue.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

      alerts.push({
        type: "vaccination",
        title: `Rappel vaccin: ${v.animalName}`,
        description: `${v.vaccineName} dans ${daysUntil} jour(s)`,
        priority: daysUntil <= 7 ? "medium" : "low",
        link: "/dashboard/health",
      })
    })

    // Trier par priorité
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
    return alerts.sort(
      (a, b) =>
        (priorityOrder[a.priority as keyof typeof priorityOrder] || 3) -
        (priorityOrder[b.priority as keyof typeof priorityOrder] || 3),
    )
  }

  // ============ STATS DASHBOARD ============

  getDashboardStats() {
    const animals = this.data.animals.filter((a) => a.status === "actif")
    const activeGestations = this.data.gestations.filter((g) => g.status === "active")
    const activeHealthCases = this.data.healthCases.filter((h) => h.status !== "resolved")

    // Calculer le coût alimentation du mois
    const thisMonth = new Date().toISOString().slice(0, 7)
    const monthlyFeedingCost = this.data.feedingRecords
      .filter((r) => r.date.startsWith(thisMonth))
      .reduce((sum, r) => sum + r.totalCost, 0)

    return {
      totalAnimals: animals.length,
      truies: animals.filter((a) => a.category === "truie").length,
      verrats: animals.filter((a) => a.category === "verrat").length,
      porcelets: animals.filter((a) => a.category === "porcelet").length,
      porcs: animals.filter((a) => a.category === "porc").length,
      gestationsActives: activeGestations.length,
      cassSanteActifs: activeHealthCases.length,
      coutAlimentationMois: monthlyFeedingCost,
      alertesCount: this.getAlerts().length,
    }
  }

  // ============ RESET ============

  reset() {
    this.data = { ...defaultData }
    this.save(this.data)
  }
}

// Singleton
let dbInstance: LocalDatabase | null = null

export function getDatabase(): LocalDatabase {
  if (!dbInstance) {
    dbInstance = new LocalDatabase()
  }
  return dbInstance
}
