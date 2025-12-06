export type PigSex = 'male' | 'female';
export type PigStatus = 'active' | 'sold' | 'deceased' | 'breeding';
export type EventType = 'vaccination' | 'weighing' | 'birth' | 'sale' | 'treatment' | 'other';
export type TransactionType = 'income' | 'expense';
export type TransactionCategory = 'sale' | 'feed' | 'veterinary' | 'equipment' | 'labor' | 'other';
export type SubscriptionTier = 'free' | 'premium' | 'enterprise';
export type PigCategory = 'piglet' | 'grower' | 'finisher' | 'sow' | 'boar';

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  farm_name: string | null;
  subscription_tier: SubscriptionTier;
  formulations_count: number;
  created_at: string;
  updated_at: string;
}

export interface WeightRecord {
  date: string;
  weight: number;
}

export interface Pig {
  id: string;
  user_id: string;
  tag_number: string;
  birth_date: string | null;
  sex: PigSex;
  breed: string | null;
  status: PigStatus;
  weight_history: WeightRecord[];
  photo_url: string | null;
  mother_id: string | null;
  father_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface NutritionalValues {
  protein: number;
  energy: number;
  fiber: number;
  calcium: number;
  phosphorus: number;
  lysine: number;
}

export interface Ingredient {
  name: string;
  percentage: number;
  cost_per_kg: number;
}

export interface FeedFormulation {
  id: string;
  user_id: string;
  name: string;
  pig_category: PigCategory;
  ingredients: Ingredient[];
  nutritional_values: NutritionalValues;
  cost_per_kg: number;
  notes: string | null;
  created_at: string;
}

export interface Event {
  id: string;
  user_id: string;
  pig_id: string | null;
  event_type: EventType;
  title: string;
  description: string | null;
  cost: number | null;
  event_date: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  description: string | null;
  transaction_date: string;
  created_at: string;
}

export interface DashboardStats {
  totalPigs: number;
  pigsChange: number;
  monthlyRevenue: number;
  revenueChange: number;
  feedCost: number;
  feedCostChange: number;
  alertsCount: number;
}

// ============================================
// TYPES POUR GESTATION
// ============================================
export type GestationStatus = 'pregnant' | 'delivered' | 'aborted' | 'lost';

export interface Gestation {
  id: string;
  user_id: string;
  sow_id: string;
  boar_id: string | null;
  breeding_date: string;
  expected_delivery_date: string;
  actual_delivery_date: string | null;
  gestation_status: GestationStatus;
  gestation_week: number | null;
  expected_litter_size: number | null;
  actual_litter_size: number | null;
  live_piglets: number | null;
  stillborn_piglets: number | null;
  notes: string | null;
  veterinarian_notes: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// TYPES POUR SANTÉ
// ============================================
export type HealthRecordType = 'vaccination' | 'treatment' | 'checkup' | 'surgery' | 'medication' | 'observation';

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface HealthRecord {
  id: string;
  user_id: string;
  pig_id: string;
  record_type: HealthRecordType;
  title: string;
  description: string | null;
  veterinarian_name: string | null;
  cost: number | null;
  record_date: string;
  next_due_date: string | null;
  medications: Medication[];
  diagnosis: string | null;
  treatment_notes: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// TYPES POUR PHOTOS
// ============================================
export interface AIAnalysis {
  health_score?: number;
  weight_estimate?: number;
  condition?: 'excellent' | 'good' | 'fair' | 'poor';
  anomalies?: string[];
  recommendations?: string[];
}

export interface PigPhoto {
  id: string;
  user_id: string;
  pig_id: string;
  photo_url: string;
  thumbnail_url: string | null;
  photo_date: string;
  caption: string | null;
  tags: string[];
  ai_analysis: AIAnalysis | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// TYPES POUR IA
// ============================================
export type InsightType = 
  | 'health_alert' 
  | 'gestation_progress' 
  | 'weight_anomaly' 
  | 'behavior_pattern' 
  | 'nutrition_recommendation' 
  | 'breeding_optimization';

export type InsightStatus = 'new' | 'reviewed' | 'dismissed' | 'action_taken';

export interface Recommendation {
  action: string;
  priority: 'high' | 'medium' | 'low';
  description: string;
}

export interface AIInsight {
  id: string;
  user_id: string;
  pig_id: string | null;
  gestation_id: string | null;
  insight_type: InsightType;
  title: string;
  description: string;
  confidence_score: number;
  source_data: Record<string, unknown>;
  recommendations: Recommendation[];
  status: InsightStatus;
  created_at: string;
  updated_at: string;
}

// ============================================
// TYPES POUR REPRODUCTION
// ============================================
export type BreedingMethod = 'natural' | 'ai' | 'mixed';

export interface BreedingRecord {
  id: string;
  user_id: string;
  sow_id: string;
  boar_id: string;
  breeding_date: string;
  breeding_time: string | null;
  breeding_method: BreedingMethod | null;
  successful: boolean | null;
  gestation_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
