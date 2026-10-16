// SehatSync AI - Core TypeScript Definitions

export interface User {
  id: string;
  name: string;
  email: string;
  age?: number;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  phone?: string;
  language?: string;
  created_at?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message?: string;
}

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  phone?: string;
}

export interface ProfileUpdatePayload {
  name: string;
  age?: number;
  gender?: string;
  phone?: string;
  language?: string;
}

// Wellness Types
export interface WellnessCheckIn {
  id?: string;
  user_id?: string;
  stress: number;      // 1 - 10
  fatigue: number;     // 1 - 10
  mood: number;        // 1 - 10
  sleep_hours: number; // e.g. 7.5
  notes?: string;
  created_at?: string;
  recorded_at?: string;
}

export interface WellnessInsight {
  id?: string;
  summary: string;
  risk_level: string;
  insights: string[];
  recommendations: string[];
  generated_at: string;
}

export interface TrendDataPoint {
  date: string;
  stress: number;
  mood: number;
  sleep_hours: number;
  fatigue: number;
}

// Nutrition Types
export type DietaryType = 
  | 'vegetarian'
  | 'vegan'
  | 'eggetarian'
  | 'non-vegetarian'
  | 'jain'
  | 'pescatarian';

export interface DietaryProfile {
  dietary_type: DietaryType;
  allergies: string[];
  goal: 'weight_loss' | 'muscle_gain' | 'maintenance' | 'diabetes_friendly' | 'heart_healthy';
  daily_budget_inr: number;
  calorie_target?: number;
}

export interface Meal {
  name: string;
  description?: string;
  calories?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  recipe_notes?: string;
}

export interface DayPlan {
  day: string; // e.g. Monday
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
  snack?: Meal;
  total_calories?: number;
}

export interface MealPlan {
  id: string;
  title?: string;
  created_at: string;
  daily_budget_estimate_inr?: number;
  summary?: string;
  grocery_highlights?: string[];
  days: DayPlan[];
}

export interface HydrationData {
  date: string;
  glasses: number;
  goal: number;
}

export interface Habit {
  id: string;
  name: string;
  category?: 'nutrition' | 'fitness' | 'mindfulness' | 'hydration';
  completed: boolean;
  streak: number;
}

// Care Coordination Types
export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string; // e.g., "Twice daily after meals", "Once before sleep"
  time_of_day?: 'morning' | 'afternoon' | 'evening' | 'night' | 'as_needed';
  instructions?: string;
  is_active: boolean;
  taken_today?: boolean;
}

export interface Prescription {
  id: string;
  name: string;
  doctor: string;
  date: string;
  notes?: string;
  file_url?: string;
}

export interface Appointment {
  id: string;
  doctor_name: string;
  specialty: string;
  hospital_clinic: string;
  date: string;       // YYYY-MM-DD
  time: string;       // HH:mm
  status: 'upcoming' | 'completed' | 'cancelled';
  notes?: string;
}

export interface Caregiver {
  id: string;
  email: string;
  name: string;
  relationship: string;
  consent_granted: boolean;
  added_at: string;
}

// AI Assistant Types
export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestions?: string[];
}

// Dashboard Summary Type
export interface DashboardSummary {
  wellness_today?: WellnessCheckIn;
  hydration?: HydrationData;
  medications_due_count: number;
  upcoming_appointments_count: number;
  daily_care_plan_status: {
    check_in_done: boolean;
    medications_taken: number;
    medications_total: number;
    hydration_done: number;
    hydration_goal: number;
    habits_completed: number;
    habits_total: number;
  };
}
