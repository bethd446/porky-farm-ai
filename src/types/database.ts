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
