// Système de base de données locale pour PorkyFarm
// Simule une vraie BDD avec localStorage pour persistence PAR UTILISATEUR

export interface Animal {
  id: string
  identifier: string
  name: string
  category: "truie" | "verrat" | "porcelet" | "porc"
  breed: string
  birthDate: string
  age?: string
  weight: number
  healthScore?: number
  status: "actif" | "vendu" | "mort" | "malade"
  healthStatus: "bon" | "moyen" | "mauvais"
  photo?: string
  motherId?: string
  fatherId?: string
  notes?: string
  location?: string
  lastWeightDate?: string
  lastVaccinationDate?: string
  createdAt: string
  updatedAt: string
  userId?: string
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
  userId?: string // Ajout du userId pour filtrage
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
  userId?: string // Ajout du userId pour filtrage
}

export interface Vaccination {
  id: string
  name: string
  animalId?: string
  targetAnimals?: string
  scheduledDate?: string
  date?: string
  nextDueDate?: string
  completedDate?: string
  status: "pending" | "completed" | "overdue"
  completedCount?: number
  notes?: string
  createdAt: string
  userId?: string
}

export interface Activity {
  id: string
  type: "animal_added" | "animal_sold" | "health_case" | "gestation" | "vaccination" | "feeding" | "death"
  title: string
  description: string
  entityId?: string
  entityType?: string
  createdAt: string
  userId?: string // Ajout du userId pour filtrage
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
  userId?: string // Ajout du userId pour filtrage
}

export interface FeedStock {
  id: string
  name: string
  currentQty: number
  maxQty: number
  unit: string
  costPerUnit: number
  lastRestocked?: string
  createdAt: string
  updatedAt: string
  userId?: string // Ajout du userId pour filtrage
}

export interface FeedProduction {
  id: string
  date: string
  ingredients: { name: string; qty: number }[]
  totalProduced: number
  costTotal: number
  notes?: string
  createdAt: string
  userId?: string // Ajout du userId pour filtrage
}

export interface DailyConsumption {
  id: string
  date: string
  stockId: string
  stockName: string
  quantity: number
  animalCategory: string
  animalCount: number
  createdAt: string
  userId?: string // Ajout du userId pour filtrage
}

interface Database {
  animals: Animal[]
  healthCases: HealthCase[]
  gestations: Gestation[]
  vaccinations: Vaccination[]
  activities: Activity[]
  feedingRecords: FeedingRecord[]
  feedStock: FeedStock[]
  feedProductions: FeedProduction[]
  dailyConsumptions: DailyConsumption[]
}

const getDbKey = (userId?: string) => {
  if (userId) {
    return `porkyfarm_db_${userId}`
  }
  return "porkyfarm_db_demo" // Mode demo sans connexion
}

// Données vides pour nouvel utilisateur
const emptyData: Database = {
  animals: [],
  healthCases: [],
  gestations: [],
  vaccinations: [],
  activities: [],
  feedingRecords: [],
  feedStock: [],
  feedProductions: [],
  dailyConsumptions: [],
}

// Données de démonstration (uniquement pour mode demo)
const demoData: Database = {
  animals: [
    {
      id: "demo-1",
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
      id: "demo-2",
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
      id: "demo-3",
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
  ],
  healthCases: [],
  gestations: [],
  vaccinations: [],
  activities: [],
  feedingRecords: [],
  feedStock: [
    {
      id: "demo-stock-1",
      name: "Maïs",
      currentQty: 500,
      maxQty: 1000,
      unit: "kg",
      costPerUnit: 150,
      lastRestocked: "2024-01-01",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "demo-stock-2",
      name: "Soja",
      currentQty: 300,
      maxQty: 600,
      unit: "kg",
      costPerUnit: 200,
      lastRestocked: "2024-02-01",
      createdAt: "2024-02-01T00:00:00Z",
      updatedAt: "2024-02-01T00:00:00Z",
    },
  ],
  feedProductions: [],
  dailyConsumptions: [],
}

class LocalDatabase {
  private data: Database
  private userId: string | undefined
  private dbKey: string

  constructor(userId?: string) {
    this.userId = userId
    this.dbKey = getDbKey(userId)
    this.data = this.load()
  }

  setUserId(userId: string | undefined) {
    if (this.userId !== userId) {
      this.userId = userId
      this.dbKey = getDbKey(userId)
      this.data = this.load()
    }
  }

  getUserId(): string | undefined {
    return this.userId
  }

  private load(): Database {
    if (typeof window === "undefined") return emptyData

    try {
      const stored = localStorage.getItem(this.dbKey)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Verifier que les donnees sont valides
        if (parsed && typeof parsed === "object" && Array.isArray(parsed.animals)) {
          return parsed
        }
      }
    } catch (e) {
      // Silently fail and return empty/demo data
    }

    if (this.userId) {
      // Utilisateur connecte : commencer avec donnees vides
      this.save(emptyData)
      return emptyData
    } else {
      // Mode demo : donnees de demonstration
      this.save(demoData)
      return demoData
    }
  }

  private save(data: Database) {
    if (typeof window === "undefined") return

    try {
      localStorage.setItem(this.dbKey, JSON.stringify(data))
    } catch (e) {
      // Silently fail
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  private addActivity(activity: Omit<Activity, "id" | "createdAt" | "userId">) {
    const newActivity: Activity = {
      ...activity,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      userId: this.userId,
    }
    this.data.activities.unshift(newActivity)
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

  addAnimal(animal: Omit<Animal, "id" | "createdAt" | "updatedAt" | "userId">): Animal {
    const newAnimal: Animal = {
      ...animal,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: this.userId, // Associer a l'utilisateur
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

  addHealthCase(healthCase: Omit<HealthCase, "id" | "createdAt" | "userId">): HealthCase {
    const newCase: HealthCase = {
      ...healthCase,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      userId: this.userId, // Associer a l'utilisateur
    }
    this.data.healthCases.push(newCase)

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

  addGestation(gestation: Omit<Gestation, "id" | "createdAt" | "expectedDueDate" | "userId">): Gestation {
    const breedingDate = new Date(gestation.breedingDate)
    const expectedDueDate = new Date(breedingDate)
    expectedDueDate.setDate(expectedDueDate.getDate() + 114)

    const newGestation: Gestation = {
      ...gestation,
      id: this.generateId(),
      expectedDueDate: expectedDueDate.toISOString().split("T")[0],
      createdAt: new Date().toISOString(),
      userId: this.userId, // Associer a l'utilisateur
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
    return [...this.data.vaccinations].sort(
      (a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime(),
    )
  }

  getUpcomingVaccinations(): Vaccination[] {
    const today = new Date()
    const in30Days = new Date()
    in30Days.setDate(in30Days.getDate() + 30)

    return this.data.vaccinations.filter((v) => {
      const scheduled = new Date(v.scheduledDate)
      return scheduled >= today && scheduled <= in30Days
    })
  }

  addVaccination(vaccination: Omit<Vaccination, "id" | "createdAt" | "userId">): Vaccination {
    const newVaccination: Vaccination = {
      ...vaccination,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      userId: this.userId, // Associer a l'utilisateur
    }
    this.data.vaccinations.push(newVaccination)
    this.save(this.data)

    this.addActivity({
      type: "vaccination",
      title: "Vaccination effectuée",
      description: `${vaccination.targetAnimals}: ${vaccination.name}`,
      entityId: newVaccination.id,
      entityType: "vaccination",
    })

    return newVaccination
  }

  updateVaccination(id: string, updates: Partial<Vaccination>): Vaccination | null {
    const index = this.data.vaccinations.findIndex((v) => v.id === id)
    if (index === -1) return null

    this.data.vaccinations[index] = {
      ...this.data.vaccinations[index],
      ...updates,
    }
    this.save(this.data)
    return this.data.vaccinations[index]
  }

  completeVaccination(id: string, completedCount: number): Vaccination | null {
    return this.updateVaccination(id, {
      status: "completed",
      completedDate: new Date().toISOString().split("T")[0],
      completedCount,
    })
  }

  deleteVaccination(id: string): boolean {
    this.data.vaccinations = this.data.vaccinations.filter((v) => v.id !== id)
    this.save(this.data)
    return true
  }

  // ============ ACTIVITIES ============

  getActivities(limit = 10): Activity[] {
    return this.data.activities.slice(0, limit)
  }

  // ============ FEEDING ============

  getFeedingRecords(): FeedingRecord[] {
    return [...this.data.feedingRecords].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  addFeedingRecord(record: Omit<FeedingRecord, "id" | "createdAt" | "userId">): FeedingRecord {
    const newRecord: FeedingRecord = {
      ...record,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      userId: this.userId, // Associer a l'utilisateur
    }
    this.data.feedingRecords.push(newRecord)
    this.save(this.data)

    this.addActivity({
      type: "feeding",
      title: "Alimentation enregistrée",
      description: `${record.totalKg}kg pour ${record.animalCount} ${record.category}(s)`,
      entityId: newRecord.id,
      entityType: "feeding",
    })

    return newRecord
  }

  // ============ FEED STOCK ============

  getFeedStock(): FeedStock[] {
    return [...this.data.feedStock]
  }

  addFeedStock(stock: Omit<FeedStock, "id" | "createdAt" | "updatedAt" | "userId">): FeedStock {
    const newStock: FeedStock = {
      ...stock,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: this.userId,
    }
    this.data.feedStock.push(newStock)
    this.save(this.data)
    return newStock
  }

  updateFeedStock(id: string, updates: Partial<FeedStock>): FeedStock | null {
    const index = this.data.feedStock.findIndex((s) => s.id === id)
    if (index === -1) return null

    this.data.feedStock[index] = {
      ...this.data.feedStock[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    this.save(this.data)
    return this.data.feedStock[index]
  }

  deleteFeedStock(id: string): boolean {
    this.data.feedStock = this.data.feedStock.filter((s) => s.id !== id)
    this.save(this.data)
    return true
  }

  // ============ FEED PRODUCTION ============

  getFeedProductions(): FeedProduction[] {
    return [...this.data.feedProductions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  addFeedProduction(production: Omit<FeedProduction, "id" | "createdAt" | "userId">): FeedProduction {
    const newProduction: FeedProduction = {
      ...production,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      userId: this.userId,
    }
    this.data.feedProductions.push(newProduction)
    this.save(this.data)
    return newProduction
  }

  // ============ DAILY CONSUMPTION ============

  getDailyConsumptions(): DailyConsumption[] {
    return [...this.data.dailyConsumptions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  addDailyConsumption(consumption: Omit<DailyConsumption, "id" | "createdAt" | "userId">): DailyConsumption {
    const newConsumption: DailyConsumption = {
      ...consumption,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      userId: this.userId,
    }
    this.data.dailyConsumptions.push(newConsumption)
    this.save(this.data)
    return newConsumption
  }

  // ============ ALERTS ============

  getAlerts() {
    const alerts: { type: string; title: string; description: string; priority: string; link: string }[] = []

    // Alertes gestations proches
    const activeGestations = this.getActiveGestations()
    const today = new Date()

    activeGestations.forEach((g) => {
      const dueDate = new Date(g.expectedDueDate)
      const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

      if (daysUntilDue <= 7 && daysUntilDue > 0) {
        alerts.push({
          type: "gestation",
          title: "Mise-bas imminente",
          description: `${g.sowName} - dans ${daysUntilDue} jour(s)`,
          priority: daysUntilDue <= 3 ? "high" : "medium",
          link: "/dashboard/reproduction",
        })
      } else if (daysUntilDue <= 0) {
        alerts.push({
          type: "gestation",
          title: "Mise-bas attendue",
          description: `${g.sowName} - date dépassée`,
          priority: "critical",
          link: "/dashboard/reproduction",
        })
      }
    })

    // Alertes cas santé non résolus
    const activeHealthCases = this.getActiveHealthCases()
    activeHealthCases.forEach((h) => {
      if (h.priority === "critical" || h.priority === "high") {
        alerts.push({
          type: "health",
          title: "Cas santé critique",
          description: `${h.animalName}: ${h.issue}`,
          priority: h.priority,
          link: "/dashboard/health",
        })
      }
    })

    // Alertes stock bas
    const feedStock = this.getFeedStock()
    feedStock.forEach((s) => {
      const percentLeft = (s.currentQty / s.maxQty) * 100
      if (percentLeft <= 20) {
        alerts.push({
          type: "stock",
          title: "Stock bas",
          description: `${s.name}: ${s.currentQty}${s.unit} restant`,
          priority: percentLeft <= 10 ? "high" : "medium",
          link: "/dashboard/feeding",
        })
      }
    })

    return alerts.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
      return (
        (priorityOrder[a.priority as keyof typeof priorityOrder] || 3) -
        (priorityOrder[b.priority as keyof typeof priorityOrder] || 3)
      )
    })
  }

  // ============ DASHBOARD STATS ============

  getDashboardStats() {
    const animals = this.data.animals.filter((a) => a.status === "actif")
    const activeGestations = this.data.gestations.filter((g) => g.status === "active")
    const activeHealthCases = this.data.healthCases.filter((h) => h.status !== "resolved")

    // Calculer le coût d'alimentation du mois
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const feedingThisMonth = this.data.feedingRecords.filter((r) => new Date(r.date) >= startOfMonth)
    const coutAlimentationMois = feedingThisMonth.reduce((sum, r) => sum + r.totalCost, 0)

    return {
      totalAnimals: animals.length,
      truies: animals.filter((a) => a.category === "truie").length,
      verrats: animals.filter((a) => a.category === "verrat").length,
      porcelets: animals.filter((a) => a.category === "porcelet").length,
      porcs: animals.filter((a) => a.category === "porc").length,
      gestationsActives: activeGestations.length,
      cassSanteActifs: activeHealthCases.length,
      coutAlimentationMois,
      alertesCount: this.getAlerts().length,
    }
  }

  resetData() {
    if (this.userId) {
      this.data = emptyData
    } else {
      this.data = demoData
    }
    this.save(this.data)
  }
}

let dbInstance: LocalDatabase | null = null
let currentUserId: string | undefined = undefined

export function getDatabase(userId?: string): LocalDatabase {
  // Si l'utilisateur change, recreer l'instance
  if (dbInstance && currentUserId !== userId) {
    dbInstance.setUserId(userId)
    currentUserId = userId
  }

  if (!dbInstance) {
    dbInstance = new LocalDatabase(userId)
    currentUserId = userId
  }

  return dbInstance
}

export function resetDatabaseInstance() {
  dbInstance = null
  currentUserId = undefined
}
