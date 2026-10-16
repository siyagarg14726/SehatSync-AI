import apiClient from './axios';
import { DietaryProfile, DietaryType, Habit, HydrationData, MealPlan } from '../types';

interface DietaryProfileResponse {
  dietary_type: string;
  allergies?: string | null;
  goals: string;
  daily_budget?: number | null;
  calorie_target?: number | null;
}

interface MealPlanResponse {
  id: number;
  title: string;
  created_at: string;
  plan_data: {
    days?: Record<string, {
      breakfast?: string;
      lunch?: string;
      dinner?: string;
      snacks?: string;
      approx_calories?: number;
    }>;
    daily_budget_estimate?: number;
    weekly_summary?: string;
    grocery_highlights?: string[];
  };
}

interface HydrationResponse {
  log_date: string;
  glasses: number;
  target_glasses: number;
}

interface HabitResponse {
  id: number;
  name: string;
  completed_today: boolean;
  current_streak: number;
}

const toDietaryType = (value: string): DietaryType => {
  if (value === 'veg') return 'vegetarian';
  if (value === 'non-veg') return 'non-vegetarian';
  return value as DietaryType;
};

const toBackendDietaryType = (value: DietaryType): string => {
  if (value === 'vegetarian') return 'veg';
  if (value === 'non-vegetarian') return 'non-veg';
  return value;
};

const mapDietaryProfile = (profile: DietaryProfileResponse): DietaryProfile => ({
  dietary_type: toDietaryType(profile.dietary_type),
  allergies: profile.allergies?.split(',').map((allergy) => allergy.trim()).filter(Boolean) ?? [],
  goal: profile.goals.replace(/-/g, '_') as DietaryProfile['goal'],
  daily_budget_inr: profile.daily_budget ?? 0,
  calorie_target: profile.calorie_target ?? undefined,
});

const mapMealPlan = (plan: MealPlanResponse): MealPlan => {
  const days = Object.entries(plan.plan_data.days ?? {}).map(([day, meals]) => ({
    day,
    total_calories: meals.approx_calories,
    breakfast: { name: meals.breakfast ?? '' },
    lunch: { name: meals.lunch ?? '' },
    dinner: { name: meals.dinner ?? '' },
    snack: meals.snacks ? { name: meals.snacks } : undefined,
  }));

  return {
    id: String(plan.id),
    title: plan.title,
    created_at: plan.created_at,
    daily_budget_estimate_inr: plan.plan_data.daily_budget_estimate,
    summary: plan.plan_data.weekly_summary,
    grocery_highlights: plan.plan_data.grocery_highlights,
    days,
  };
};

const mapHydration = (hydration: HydrationResponse): HydrationData => ({
  date: hydration.log_date,
  glasses: hydration.glasses,
  goal: hydration.target_glasses,
});

const mapHabit = (habit: HabitResponse): Habit => ({
  id: String(habit.id),
  name: habit.name,
  completed: habit.completed_today,
  streak: habit.current_streak,
});

export const nutritionApi = {
  getDietaryProfile: async (): Promise<DietaryProfile | null> => {
    const response = await apiClient.get<DietaryProfileResponse | null>('/api/v1/nutrition/profile');
    return response.data ? mapDietaryProfile(response.data) : null;
  },

  updateDietaryProfile: async (profile: DietaryProfile): Promise<DietaryProfile> => {
    const response = await apiClient.post<DietaryProfileResponse>('/api/v1/nutrition/profile', {
      dietary_type: toBackendDietaryType(profile.dietary_type),
      allergies: profile.allergies.join(', '),
      goals: profile.goal.replace(/_/g, '-'),
      daily_budget: profile.daily_budget_inr,
      calorie_target: profile.calorie_target,
    });
    return mapDietaryProfile(response.data);
  },

  generateMealPlan: async (profile: DietaryProfile): Promise<MealPlan> => {
    await nutritionApi.updateDietaryProfile(profile);
    const response = await apiClient.post<MealPlanResponse>('/api/v1/nutrition/meal-plans/generate', {
      dietary_type_override: toBackendDietaryType(profile.dietary_type),
      daily_budget_override: profile.daily_budget_inr || undefined,
    });
    return mapMealPlan(response.data);
  },

  getLatestMealPlan: async (): Promise<MealPlan | null> => {
    const response = await apiClient.get<MealPlanResponse[]>('/api/v1/nutrition/meal-plans?limit=1');
    return response.data[0] ? mapMealPlan(response.data[0]) : null;
  },

  getHydration: async (): Promise<HydrationData> => {
    const response = await apiClient.get<HydrationResponse>('/api/v1/nutrition/hydration/today');
    return mapHydration(response.data);
  },

  logHydrationGlass: async (glasses: number): Promise<HydrationData> => {
    const response = await apiClient.post<HydrationResponse>('/api/v1/nutrition/hydration', {
      glasses,
      mode: 'set',
    });
    return mapHydration(response.data);
  },

  getHabits: async (): Promise<Habit[]> => {
    const response = await apiClient.get<HabitResponse[]>('/api/v1/nutrition/habits');
    return response.data.map(mapHabit);
  },

  toggleHabit: async (habitId: string, completed: boolean): Promise<Habit> => {
    await apiClient.post(`/api/v1/nutrition/habits/${habitId}/log`, { completed });
    const habits = await nutritionApi.getHabits();
    const updatedHabit = habits.find((habit) => habit.id === habitId);
    if (!updatedHabit) {
      throw new Error('Habit was updated, but its current status could not be loaded.');
    }
    return updatedHabit;
  },
};
