import apiClient from './axios';
import { DietaryProfile, MealPlan, HydrationData, Habit } from '../types';

const defaultProfile: DietaryProfile = {
  dietary_type: 'vegetarian',
  allergies: ['Peanuts'],
  goal: 'weight_loss',
  daily_budget_inr: 350,
  calorie_target: 1950,
};

const defaultMealPlan: MealPlan = {
  id: 'plan_curated_01',
  title: 'Holistic Balanced Ayurvedic & Macronutrient Plan',
  created_at: new Date().toISOString(),
  weekly_budget_est_inr: 2450,
  days: [
    {
      day: 'Monday',
      total_calories: 1890,
      breakfast: {
        name: 'Moong Dal Chilla & Mint Chutney',
        description: '2 savory mung bean pancakes filled with grated paneer and coriander.',
        calories: 380,
        protein_g: 18,
        carbs_g: 42,
        fat_g: 12,
        recipe_notes: 'Soak split yellow moong overnight. Blend with ginger and green chillies.',
      },
      lunch: {
        name: 'Quinoa Brown Rice Khichdi & Curd',
        description: 'Lightly spiced one-pot meal with turmeric, cumin, spinach, and fresh yogurt.',
        calories: 550,
        protein_g: 22,
        carbs_g: 78,
        fat_g: 14,
        recipe_notes: 'Cook with a dash of A2 ghee and roasted cumin seeds.',
      },
      dinner: {
        name: 'Palak Paneer with Multigrain Roti',
        description: 'Blanched spinach puree simmered with fresh cottage cheese cubes and 2 rotis.',
        calories: 620,
        protein_g: 28,
        carbs_g: 60,
        fat_g: 24,
        recipe_notes: 'Keep oil low, use garlic and kasuri methi for rich aroma.',
      },
      snack: {
        name: 'Roasted Makhana & Green Tea',
        description: 'Crispy lotus seeds roasted with turmeric and rock salt.',
        calories: 180,
        protein_g: 5,
        carbs_g: 28,
        fat_g: 4,
        recipe_notes: 'Slow roast in cast iron pan without heavy butter.',
      },
    },
    {
      day: 'Tuesday',
      total_calories: 1920,
      breakfast: {
        name: 'Sprouted Methi & Poha Bowl',
        description: 'Flattened rice with sprouted fenugreek, curry leaves, and crunchy peanuts.',
        calories: 410,
        protein_g: 12,
        carbs_g: 65,
        fat_g: 11,
      },
      lunch: {
        name: 'Rajma Masala with Steamed Brown Rice',
        description: 'Rich kidney bean curry slow cooked with whole spices, served with fresh salad.',
        calories: 610,
        protein_g: 24,
        carbs_g: 88,
        fat_g: 14,
      },
      dinner: {
        name: 'Lauki (Bottle Gourd) Kofta & Millet Roti',
        description: 'Steamed lauki dumplings in light tomato-coriander gravy.',
        calories: 510,
        protein_g: 16,
        carbs_g: 58,
        fat_g: 15,
      },
      snack: {
        name: 'Spiced Buttermilk (Chaas) & Almonds',
        description: 'Churned yogurt with mint, roasted cumin, and 6 soaked almonds.',
        calories: 190,
        protein_g: 8,
        carbs_g: 12,
        fat_g: 11,
      },
    },
    {
      day: 'Wednesday',
      total_calories: 1850,
      breakfast: {
        name: 'Vegetable Oats Upma',
        description: 'Rolled oats tempered with mustard seeds, green peas, carrots, and ginger.',
        calories: 360,
        protein_g: 11,
        carbs_g: 54,
        fat_g: 9,
      },
      lunch: {
        name: 'Chole with Jowar (Sorghum) Roti',
        description: 'Chickpea gravy paired with gluten-free rotis and cucumber kachumber.',
        calories: 620,
        protein_g: 22,
        carbs_g: 85,
        fat_g: 16,
      },
      dinner: {
        name: 'Methi Dal & Stir-fried Tofu / Paneer',
        description: 'Pigeon pea dal tempered with fresh fenugreek leaves and sautéed bell peppers.',
        calories: 530,
        protein_g: 26,
        carbs_g: 52,
        fat_g: 18,
      },
      snack: {
        name: 'Seasonal Papaya with Chia Seeds',
        description: 'Fresh enzyme-rich papaya cubes sprinkled with soaked black chia seeds.',
        calories: 160,
        protein_g: 3,
        carbs_g: 32,
        fat_g: 2,
      },
    },
    {
      day: 'Thursday',
      total_calories: 1940,
      breakfast: {
        name: 'Idli & Sambar with Coconut Chutney',
        description: '3 steamed fermented rice-lentil cakes with vegetable lentil stew.',
        calories: 420,
        protein_g: 14,
        carbs_g: 72,
        fat_g: 8,
      },
      lunch: {
        name: 'Soya Chunk Pulao with Cucumber Raita',
        description: 'High-protein soya nuggets cooked with basmati rice and warming whole spices.',
        calories: 580,
        protein_g: 34,
        carbs_g: 70,
        fat_g: 12,
      },
      dinner: {
        name: 'Paneer Bhurji with Whole Wheat Phulkas',
        description: 'Crumbled cottage cheese sautéed with tomatoes, onions, and turmeric.',
        calories: 580,
        protein_g: 27,
        carbs_g: 48,
        fat_g: 24,
      },
      snack: {
        name: 'Roasted Chickpeas (Chana)',
        description: 'Dry roasted black chickpeas with black pepper.',
        calories: 180,
        protein_g: 10,
        carbs_g: 24,
        fat_g: 3,
      },
    },
    {
      day: 'Friday',
      total_calories: 1880,
      breakfast: {
        name: 'Besan & Spinach Cheela',
        description: 'Gram flour crêpes packed with iron-rich baby spinach and ginger.',
        calories: 390,
        protein_g: 16,
        carbs_g: 46,
        fat_g: 13,
      },
      lunch: {
        name: 'Dal Tadka with Jeera Rice & Green Salad',
        description: 'Yellow lentils infused with cumin, garlic, and hing, served with fragrant rice.',
        calories: 590,
        protein_g: 20,
        carbs_g: 86,
        fat_g: 14,
      },
      dinner: {
        name: 'Baingan Bharta with Bajra Roti',
        description: 'Smoky roasted eggplant mash with pearl millet rotis and jaggery nib.',
        calories: 540,
        protein_g: 14,
        carbs_g: 68,
        fat_g: 18,
      },
      snack: {
        name: 'Walnuts & Dried Figs',
        description: '3 walnut halves and 2 naturally sweet dry figs for omega-3 support.',
        calories: 170,
        protein_g: 4,
        carbs_g: 20,
        fat_g: 9,
      },
    },
    {
      day: 'Saturday',
      total_calories: 1910,
      breakfast: {
        name: 'Multigrain Dosa with Sambar',
        description: 'Crisp dosa made from ragi, rice, and urad dal batter with vegetable stew.',
        calories: 430,
        protein_g: 13,
        carbs_g: 68,
        fat_g: 10,
      },
      lunch: {
        name: 'Panchmel Dal with Roti & Beetroot Salad',
        description: 'Five-lentil protein rich Rajasthani stew served with warm phulkas.',
        calories: 610,
        protein_g: 25,
        carbs_g: 78,
        fat_g: 16,
      },
      dinner: {
        name: 'Grilled Vegetable & Paneer Skewers',
        description: 'Tandoori-spiced bell peppers, onions, tomatoes, and paneer cubes.',
        calories: 520,
        protein_g: 28,
        carbs_g: 34,
        fat_g: 26,
      },
      snack: {
        name: 'Fresh Coconut Water & Tender Flesh',
        description: 'Natural electrolyte recharge with potassium and enzymes.',
        calories: 150,
        protein_g: 2,
        carbs_g: 24,
        fat_g: 4,
      },
    },
    {
      day: 'Sunday',
      total_calories: 1870,
      breakfast: {
        name: 'Ragi Porridge with Cinnamon & Crushed Nuts',
        description: 'Warm finger millet cooked with low-fat milk, cardamom, and sliced almonds.',
        calories: 390,
        protein_g: 12,
        carbs_g: 58,
        fat_g: 11,
      },
      lunch: {
        name: 'Kadhi Pakora with Steamed Rice',
        description: 'Tangy gram flour yogurt stew with fenugreek dumplings and rice.',
        calories: 620,
        protein_g: 18,
        carbs_g: 88,
        fat_g: 18,
      },
      dinner: {
        name: 'Mixed Veg Clear Soup & Steamed Momos/Dumplings',
        description: 'Nutrient-packed garlic broth with light whole wheat vegetable dumplings.',
        calories: 490,
        protein_g: 15,
        carbs_g: 64,
        fat_g: 12,
      },
      snack: {
        name: 'Guava with Chaat Masala',
        description: 'Fresh pink guava loaded with Vitamin C and dietary fiber.',
        calories: 140,
        protein_g: 3,
        carbs_g: 28,
        fat_g: 1,
      },
    },
  ],
};

const defaultHabits: Habit[] = [
  { id: 'hab_1', name: 'Morning Warm Water (500ml)', category: 'hydration', completed: true, streak: 12 },
  { id: 'hab_2', name: '10,000 Daily Footsteps', category: 'fitness', completed: false, streak: 5 },
  { id: 'hab_3', name: 'Zero Refined Sugar Before 6 PM', category: 'nutrition', completed: true, streak: 8 },
  { id: 'hab_4', name: 'Evening Meditation (10 mins)', category: 'mindfulness', completed: false, streak: 4 },
  { id: 'hab_5', name: 'Eat 3 Servings of Vegetables', category: 'nutrition', completed: true, streak: 9 },
];

export const nutritionApi = {
  getDietaryProfile: async (): Promise<DietaryProfile> => {
    try {
      const response = await apiClient.get<DietaryProfile>('/api/nutrition/profile');
      return response.data;
    } catch (error) {
      return defaultProfile;
    }
  },

  updateDietaryProfile: async (profile: DietaryProfile): Promise<DietaryProfile> => {
    try {
      const response = await apiClient.put<DietaryProfile>('/api/nutrition/profile', profile);
      return response.data;
    } catch (error) {
      return profile;
    }
  },

  generateMealPlan: async (profile: DietaryProfile): Promise<MealPlan> => {
    try {
      const response = await apiClient.post<MealPlan>('/api/nutrition/generate-meal-plan', profile);
      return response.data;
    } catch (error) {
      return {
        ...defaultMealPlan,
        id: 'plan_' + Date.now(),
        created_at: new Date().toISOString(),
      };
    }
  },

  getLatestMealPlan: async (): Promise<MealPlan> => {
    try {
      const response = await apiClient.get<MealPlan>('/api/nutrition/meal-plan/latest');
      return response.data;
    } catch (error) {
      return defaultMealPlan;
    }
  },

  getHydration: async (): Promise<HydrationData> => {
    try {
      const response = await apiClient.get<HydrationData>('/api/nutrition/hydration/today');
      return response.data;
    } catch (error) {
      return {
        date: new Date().toISOString().split('T')[0],
        glasses: 5,
        goal: 8,
      };
    }
  },

  logHydrationGlass: async (glasses: number): Promise<HydrationData> => {
    try {
      const response = await apiClient.post<HydrationData>('/api/nutrition/hydration/log', { glasses });
      return response.data;
    } catch (error) {
      return {
        date: new Date().toISOString().split('T')[0],
        glasses,
        goal: 8,
      };
    }
  },

  getHabits: async (): Promise<Habit[]> => {
    try {
      const response = await apiClient.get<Habit[]>('/api/nutrition/habits');
      return response.data;
    } catch (error) {
      return defaultHabits;
    }
  },

  toggleHabit: async (habitId: string, completed: boolean): Promise<Habit> => {
    try {
      const response = await apiClient.post<Habit>(`/api/nutrition/habits/${habitId}/toggle`, { completed });
      return response.data;
    } catch (error) {
      const habit = defaultHabits.find(h => h.id === habitId);
      return {
        ...(habit || { id: habitId, name: 'Habit', category: 'nutrition', streak: 1 }),
        completed,
        streak: completed ? ((habit?.streak || 0) + 1) : Math.max(0, (habit?.streak || 1) - 1),
      };
    }
  },
};
