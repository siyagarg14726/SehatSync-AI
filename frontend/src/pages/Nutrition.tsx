import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Salad,
  Droplets,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Flame,
  IndianRupee,
  Utensils,
  Plus,
  RefreshCw,
  Award,
} from 'lucide-react';
import { nutritionApi } from '../api/nutrition';
import { DietaryProfile, DietaryType, MealPlan } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export const Nutrition: React.FC = () => {
  const queryClient = useQueryClient();

  // Profile form state
  const [dietaryType, setDietaryType] = useState<DietaryType>('vegetarian');
  const [allergiesText, setAllergiesText] = useState<string>('Peanuts, Shellfish');
  const [goal, setGoal] = useState<any>('weight_loss');
  const [dailyBudget, setDailyBudget] = useState<number>(350);

  // Accordion open state for day-by-day plan
  const [expandedDay, setExpandedDay] = useState<string>('Monday');

  // Queries
  const { data: profile } = useQuery({
    queryKey: ['nutrition-profile'],
    queryFn: async () => {
      const data = await nutritionApi.getDietaryProfile();
      setDietaryType(data.dietary_type);
      setAllergiesText(data.allergies.join(', '));
      setGoal(data.goal);
      setDailyBudget(data.daily_budget_inr);
      return data;
    },
  });

  const { data: mealPlan, isLoading: planLoading } = useQuery({
    queryKey: ['meal-plan-latest'],
    queryFn: () => nutritionApi.getLatestMealPlan(),
  });

  const { data: hydration } = useQuery({
    queryKey: ['hydration-today'],
    queryFn: () => nutritionApi.getHydration(),
  });

  const { data: habits } = useQuery({
    queryKey: ['habits'],
    queryFn: () => nutritionApi.getHabits(),
  });

  // Mutations
  const generatePlanMutation = useMutation({
    mutationFn: (profileData: DietaryProfile) => nutritionApi.generateMealPlan(profileData),
    onSuccess: () => {
      toast.success('Generated a customized weekly Ayurvedic & macro meal plan!');
      queryClient.invalidateQueries({ queryKey: ['meal-plan-latest'] });
    },
    onError: () => toast.error('Could not generate plan.'),
  });

  const hydrationMutation = useMutation({
    mutationFn: (glasses: number) => nutritionApi.logHydrationGlass(glasses),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hydration-today'] });
    },
  });

  const habitMutation = useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      nutritionApi.toggleHabit(id, completed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });

  const handleSaveProfileAndGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const allergiesArray = allergiesText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const updatedProfile: DietaryProfile = {
      dietary_type: dietaryType,
      allergies: allergiesArray,
      goal,
      daily_budget_inr: Number(dailyBudget),
    };

    generatePlanMutation.mutate(updatedProfile);
  };

  const handleGlassClick = (glassIndex: number) => {
    const current = hydration?.glasses || 0;
    // Clicking the same glass toggles down or sets to that number
    const newGlasses = glassIndex === current ? glassIndex - 1 : glassIndex;
    hydrationMutation.mutate(Math.max(0, Math.min(8, newGlasses)));
    toast.success(`Hydration updated: ${Math.max(0, newGlasses)} / 8 glasses`, {
      icon: '💧',
      id: 'hydration-toast',
    });
  };

  const currentGlasses = hydration?.glasses || 5;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800">
            Aarogya <span className="text-teal-600">Nutrition & Diet</span>
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            Ayur-Macro AI
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Personalized Indian whole-food meal blueprints, hydration tracking, and micro-habit formation.
        </p>
      </div>

      {/* Top Section: Hydration Tracker & Habit Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Hydration Tracker */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-50 text-cyan-600">
                  <Droplets className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-800">Hydration Tracker</h2>
                  <p className="text-xs text-slate-400">Target: 8 glasses (2.0 Liters) / day</p>
                </div>
              </div>
              <span className="text-xs font-bold text-cyan-700 bg-cyan-50 px-2.5 py-1 rounded-full border border-cyan-100">
                {currentGlasses} of 8 logged
              </span>
            </div>

            <p className="mt-4 text-xs text-slate-600">
              Tap any glass to mark water intake. Proper cellular hydration boosts nutrient absorption and cognitive alertness.
            </p>

            {/* Interactive Glass Icons */}
            <div className="mt-5 grid grid-cols-4 sm:grid-cols-8 gap-2.5 sm:gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => {
                const isFilled = num <= currentGlasses;
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleGlassClick(num)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-200 cursor-pointer ${
                      isFilled
                        ? 'bg-cyan-500 text-white border-cyan-600 shadow-sm scale-102'
                        : 'bg-slate-50 text-slate-300 border-slate-200 hover:border-cyan-300 hover:text-cyan-400'
                    }`}
                  >
                    <Droplets className={`w-6 h-6 ${isFilled ? 'fill-white' : ''}`} />
                    <span className="text-[10px] font-bold mt-1">{num * 250}ml</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Current Intake: {currentGlasses * 250} ml</span>
            <span className="font-semibold text-cyan-700">
              {currentGlasses >= 8 ? '🎉 Daily goal reached!' : `${(8 - currentGlasses) * 250} ml remaining`}
            </span>
          </div>
        </div>

        {/* Daily Habit Tracker */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-800">Daily Health Habits</h2>
                  <p className="text-xs text-slate-400">Micro-actions for sustainable vitality</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                <Award className="w-3.5 h-3.5" />
                <span>Streaks Active</span>
              </div>
            </div>

            <div className="mt-4 space-y-2.5">
              {habits?.map((habit) => (
                <div
                  key={habit.id}
                  onClick={() => habitMutation.mutate({ id: habit.id, completed: !habit.completed })}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    habit.completed
                      ? 'bg-emerald-50/50 border-emerald-200/80'
                      : 'bg-slate-50/70 border-slate-200/70 hover:bg-slate-100/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={habit.completed}
                      onChange={() => {}} // handled by parent div
                      className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 accent-teal-600 cursor-pointer"
                    />
                    <span
                      className={`text-xs font-semibold ${
                        habit.completed ? 'text-slate-800 line-through opacity-80' : 'text-slate-700'
                      }`}
                    >
                      {habit.name}
                    </span>
                  </div>

                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600">
                    🔥 {habit.streak} days
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 text-center">
            Habit completion feeds directly into your RakshakAI resilience index.
          </div>
        </div>
      </div>

      {/* Middle Section: Dietary Profile Setup Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between pb-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-teal-50 text-teal-600">
              <Utensils className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Dietary Profile & Preferences</h2>
              <p className="text-xs text-slate-500">
                Tailor meal generations by dietary doctrine, allergies, and daily INR affordability
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveProfileAndGenerate} className="mt-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Dietary Type */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Dietary Archetype
              </label>
              <select
                value={dietaryType}
                onChange={(e) => setDietaryType(e.target.value as DietaryType)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-slate-50/50 font-medium text-slate-800"
              >
                <option value="vegetarian">Vegetarian (Lacto)</option>
                <option value="vegan">Vegan (100% Plant)</option>
                <option value="eggetarian">Eggetarian</option>
                <option value="non-vegetarian">Non-Vegetarian</option>
                <option value="jain">Jain (No Root Veg)</option>
                <option value="pescatarian">Pescatarian</option>
              </select>
            </div>

            {/* Health Goal */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Primary Goal
              </label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-slate-50/50 font-medium text-slate-800"
              >
                <option value="weight_loss">Weight Loss & Fat Reduction</option>
                <option value="muscle_gain">Lean Muscle Synthesis</option>
                <option value="maintenance">Maintenance & Vitality</option>
                <option value="diabetes_friendly">Glycemic Control (Diabetes)</option>
                <option value="heart_healthy">Cardioprotective (Low Sodium)</option>
              </select>
            </div>

            {/* Daily Budget in INR */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Daily Budget (INR)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 font-bold text-sm">
                  ₹
                </span>
                <input
                  type="number"
                  min="100"
                  max="5000"
                  step="50"
                  value={dailyBudget}
                  onChange={(e) => setDailyBudget(Number(e.target.value))}
                  className="w-full pl-8 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-slate-50/50 font-medium text-slate-800"
                />
              </div>
            </div>

            {/* Allergies / Intolerances */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Allergies & Dislikes
              </label>
              <input
                type="text"
                value={allergiesText}
                onChange={(e) => setAllergiesText(e.target.value)}
                placeholder="e.g. Peanuts, Dairy, Gluten"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-slate-50/50 font-medium text-slate-800 placeholder-slate-400"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={generatePlanMutation.isPending}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-sm font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {generatePlanMutation.isPending ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Sparkles className="w-4 h-4 text-emerald-200" />
              )}
              <span>Generate Customized Weekly Plan</span>
            </button>
          </div>
        </form>
      </div>

      {/* Weekly Meal Plan Accordion */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Weekly Meal Plan Blueprint</h2>
            <p className="text-xs text-slate-500">
              Estimated weekly expenditure: ₹{mealPlan?.weekly_budget_est_inr || 2450} • Tailored to {dietaryType}
            </p>
          </div>
          <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            7 Days Available
          </span>
        </div>

        {planLoading ? (
          <div className="bg-white rounded-3xl p-12 flex justify-center">
            <LoadingSpinner label="Formulating macro-nutrient breakdown..." />
          </div>
        ) : (
          <div className="space-y-3">
            {mealPlan?.days.map((dayPlan) => {
              const isExpanded = expandedDay === dayPlan.day;
              return (
                <div
                  key={dayPlan.day}
                  className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden transition-all duration-200"
                >
                  {/* Day Header Accordion Toggle */}
                  <button
                    type="button"
                    onClick={() => setExpandedDay(isExpanded ? '' : dayPlan.day)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50/70 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 font-bold text-sm flex items-center justify-center border border-teal-100">
                        {dayPlan.day.slice(0, 3)}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-800">{dayPlan.day}</h3>
                        <p className="text-xs text-slate-400">
                          {dayPlan.breakfast.name} • {dayPlan.lunch.name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                        <Flame className="w-3.5 h-3.5" />
                        <span>{dayPlan.total_calories} kcal</span>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {/* Accordion Content */}
                  {isExpanded && (
                    <div className="px-6 pb-6 pt-2 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-150">
                      {/* Breakfast */}
                      <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-100 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                              Breakfast
                            </span>
                            <span className="text-xs font-bold text-amber-700">
                              {dayPlan.breakfast.calories} kcal
                            </span>
                          </div>
                          <h4 className="font-bold text-slate-800 text-sm">{dayPlan.breakfast.name}</h4>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            {dayPlan.breakfast.description}
                          </p>
                        </div>
                        <div className="mt-3 pt-2 border-t border-amber-100/60 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                          <span>P: {dayPlan.breakfast.protein_g}g</span>
                          <span>C: {dayPlan.breakfast.carbs_g}g</span>
                          <span>F: {dayPlan.breakfast.fat_g}g</span>
                        </div>
                      </div>

                      {/* Lunch */}
                      <div className="p-4 rounded-2xl bg-teal-50/40 border border-teal-100 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800">
                              Lunch
                            </span>
                            <span className="text-xs font-bold text-teal-700">
                              {dayPlan.lunch.calories} kcal
                            </span>
                          </div>
                          <h4 className="font-bold text-slate-800 text-sm">{dayPlan.lunch.name}</h4>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            {dayPlan.lunch.description}
                          </p>
                        </div>
                        <div className="mt-3 pt-2 border-t border-teal-100/60 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                          <span>P: {dayPlan.lunch.protein_g}g</span>
                          <span>C: {dayPlan.lunch.carbs_g}g</span>
                          <span>F: {dayPlan.lunch.fat_g}g</span>
                        </div>
                      </div>

                      {/* Dinner */}
                      <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-800">
                              Dinner
                            </span>
                            <span className="text-xs font-bold text-indigo-700">
                              {dayPlan.dinner.calories} kcal
                            </span>
                          </div>
                          <h4 className="font-bold text-slate-800 text-sm">{dayPlan.dinner.name}</h4>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            {dayPlan.dinner.description}
                          </p>
                        </div>
                        <div className="mt-3 pt-2 border-t border-indigo-100/60 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                          <span>P: {dayPlan.dinner.protein_g}g</span>
                          <span>C: {dayPlan.dinner.carbs_g}g</span>
                          <span>F: {dayPlan.dinner.fat_g}g</span>
                        </div>
                      </div>

                      {/* Snack */}
                      {dayPlan.snack && (
                        <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                                Snack / Teatime
                              </span>
                              <span className="text-xs font-bold text-emerald-700">
                                {dayPlan.snack.calories} kcal
                              </span>
                            </div>
                            <h4 className="font-bold text-slate-800 text-sm">{dayPlan.snack.name}</h4>
                            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                              {dayPlan.snack.description}
                            </p>
                          </div>
                          <div className="mt-3 pt-2 border-t border-emerald-100/60 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                            <span>P: {dayPlan.snack.protein_g}g</span>
                            <span>C: {dayPlan.snack.carbs_g}g</span>
                            <span>F: {dayPlan.snack.fat_g}g</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Nutrition;
