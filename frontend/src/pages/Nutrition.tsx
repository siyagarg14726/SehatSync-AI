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
  const [dietaryType, setDietaryType] = useState<DietaryType | ''>('');
  const [allergiesText, setAllergiesText] = useState<string>('');
  const [goal, setGoal] = useState<DietaryProfile['goal'] | ''>('');
  const [dailyBudget, setDailyBudget] = useState<number>(0);

  // Accordion open state for day-by-day plan
  const [expandedDay, setExpandedDay] = useState<string>('Monday');

  // Queries
  const { data: profile, isError: profileError } = useQuery({
    queryKey: ['nutrition-profile'],
    queryFn: async () => {
      const data = await nutritionApi.getDietaryProfile();
      if (data) {
        setDietaryType(data.dietary_type);
        setAllergiesText(data.allergies.join(', '));
        setGoal(data.goal);
        setDailyBudget(data.daily_budget_inr);
      }
      return data;
    },
  });

  const { data: mealPlan, isLoading: planLoading, isError: planError } = useQuery({
    queryKey: ['meal-plan-latest'],
    queryFn: () => nutritionApi.getLatestMealPlan(),
  });

  const { data: hydration, isLoading: hydrationLoading, isError: hydrationError } = useQuery({
    queryKey: ['hydration-today'],
    queryFn: () => nutritionApi.getHydration(),
  });

  const { data: habits, isLoading: habitsLoading, isError: habitsError } = useQuery({
    queryKey: ['habits'],
    queryFn: () => nutritionApi.getHabits(),
  });

  // Mutations
  const generatePlanMutation = useMutation({
    mutationFn: (profileData: DietaryProfile) => nutritionApi.generateMealPlan(profileData),
    onSuccess: () => {
      toast.success('Your meal plan was saved.');
      queryClient.invalidateQueries({ queryKey: ['meal-plan-latest'] });
    },
    onError: () => toast.error('Could not save your preferences or generate a meal plan.'),
  });

  const hydrationMutation = useMutation({
    mutationFn: (glasses: number) => nutritionApi.logHydrationGlass(glasses),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hydration-today'] });
      toast.success('Hydration log updated.');
    },
    onError: () => toast.error('Could not update your hydration log.'),
  });

  const habitMutation = useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      nutritionApi.toggleHabit(id, completed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
    onError: () => toast.error('Could not update this habit.'),
  });

  const handleSaveProfileAndGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dietaryType || !goal) {
      toast.error('Choose a dietary preference and goal first.');
      return;
    }
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
    const newGlasses = glassIndex === current ? glassIndex - 1 : glassIndex;
    hydrationMutation.mutate(Math.max(0, Math.min(8, newGlasses)));
  };

  const currentGlasses = hydration?.glasses ?? 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800">
            Nutrition <span className="text-teal-600">& Lifestyle</span>
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            Your nutrition space
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Manage your nutrition preferences, saved meal plans, hydration logs, and personal habits.
        </p>
      </div>
      {profileError && (
        <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          Saved dietary preferences could not be loaded. Changes will be saved only after the service responds successfully.
        </p>
      )}

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
                  <p className="text-xs text-slate-400">Track the number of glasses you log each day.</p>
                </div>
              </div>
              <span className="text-xs font-bold text-cyan-700 bg-cyan-50 px-2.5 py-1 rounded-full border border-cyan-100">
                {hydration ? `${currentGlasses} of ${hydration.goal} logged` : 'Record unavailable'}
              </span>
            </div>

            <p className="mt-4 text-xs text-slate-600">
              Tap a glass to update the count saved in your hydration record.
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
                    disabled={hydrationLoading || hydrationError || hydrationMutation.isPending}
                    aria-label={`Set hydration to ${num} glasses`}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-200 cursor-pointer ${
                      isFilled
                        ? 'bg-cyan-500 text-white border-cyan-600 shadow-sm scale-102'
                        : 'bg-slate-50 text-slate-300 border-slate-200 hover:border-cyan-300 hover:text-cyan-400'
                    }`}
                  >
                    <Droplets className={`w-6 h-6 ${isFilled ? 'fill-white' : ''}`} />
                    <span className="text-[10px] font-bold mt-1">Glass {num}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>{hydrationError ? 'Hydration data could not be loaded.' : `Glasses logged: ${hydration ? currentGlasses : '—'}`}</span>
            <span className="font-semibold text-cyan-700">
              {hydration && currentGlasses >= hydration.goal ? 'Daily goal reached' : hydration ? `${Math.max(0, hydration.goal - currentGlasses)} glasses to goal` : 'Goal unavailable'}
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
                <span>Saved habits</span>
              </div>
            </div>

            <div className="mt-4 space-y-2.5">
              {habitsLoading ? <p role="status" className="text-sm text-slate-500">Loading saved habits…</p>
                : habitsError ? <p role="alert" className="text-sm text-rose-700">Saved habits could not be loaded.</p>
                : habits?.length ? habits.map((habit) => (
                <button
                  key={habit.id}
                  onClick={() => habitMutation.mutate({ id: habit.id, completed: !habit.completed })}
                  type="button"
                  aria-pressed={habit.completed}
                  disabled={habitMutation.isPending}
                  className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between disabled:opacity-60 ${
                    habit.completed
                      ? 'bg-emerald-50/50 border-emerald-200/80'
                      : 'bg-slate-50/70 border-slate-200/70 hover:bg-slate-100/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span aria-hidden="true" className={`flex h-4 w-4 items-center justify-center rounded border ${habit.completed ? 'border-teal-600 bg-teal-600 text-white' : 'border-slate-300 bg-white'}`}>
                      {habit.completed ? '✓' : ''}
                    </span>
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
                </button>
              )) : <p className="text-sm text-slate-500">No saved habits yet.</p>}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 text-center">
            Track habits you have added to your account.
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
                required
                onChange={(e) => setDietaryType(e.target.value as DietaryType)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-slate-50/50 font-medium text-slate-800"
              >
                <option value="">Choose a dietary preference</option>
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
                required
                onChange={(e) => setGoal(e.target.value as DietaryProfile['goal'] | '')}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-slate-50/50 font-medium text-slate-800"
              >
                <option value="">Choose a goal</option>
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
                  min="0"
                  max="5000"
                  step="50"
                  required
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
              {mealPlan?.daily_budget_estimate_inr
                ? `AI-estimated daily budget: ₹${mealPlan.daily_budget_estimate_inr} (not a price quote)`
                : 'Budget estimate unavailable'}
            </p>
          </div>
          <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            {mealPlan?.days.length ?? 0} Days
          </span>
        </div>

        {planLoading ? (
          <div className="bg-white rounded-3xl p-12 flex justify-center">
            <LoadingSpinner label="Formulating macro-nutrient breakdown..." />
          </div>
        ) : planError ? (
          <p role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">Your saved meal plan could not be loaded.</p>
        ) : mealPlan?.days.length ? (
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
                        <span>{dayPlan.total_calories ? `Approx. ${dayPlan.total_calories} kcal` : 'Calories unavailable'}</span>
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
                            {dayPlan.breakfast.calories != null && <span className="text-xs font-bold text-amber-700">Approx. {dayPlan.breakfast.calories} kcal</span>}
                          </div>
                          <h4 className="font-bold text-slate-800 text-sm">{dayPlan.breakfast.name}</h4>
                          {dayPlan.breakfast.description && <p className="text-xs text-slate-600 mt-1 leading-relaxed">{dayPlan.breakfast.description}</p>}
                        </div>
                        <div className="mt-3 pt-2 border-t border-amber-100/60 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                          {dayPlan.breakfast.protein_g != null && <span>P: {dayPlan.breakfast.protein_g}g</span>}
                          {dayPlan.breakfast.carbs_g != null && <span>C: {dayPlan.breakfast.carbs_g}g</span>}
                          {dayPlan.breakfast.fat_g != null && <span>F: {dayPlan.breakfast.fat_g}g</span>}
                        </div>
                      </div>

                      {/* Lunch */}
                      <div className="p-4 rounded-2xl bg-teal-50/40 border border-teal-100 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800">
                              Lunch
                            </span>
                            {dayPlan.lunch.calories != null && <span className="text-xs font-bold text-teal-700">Approx. {dayPlan.lunch.calories} kcal</span>}
                          </div>
                          <h4 className="font-bold text-slate-800 text-sm">{dayPlan.lunch.name}</h4>
                          {dayPlan.lunch.description && <p className="text-xs text-slate-600 mt-1 leading-relaxed">{dayPlan.lunch.description}</p>}
                        </div>
                        <div className="mt-3 pt-2 border-t border-teal-100/60 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                          {dayPlan.lunch.protein_g != null && <span>P: {dayPlan.lunch.protein_g}g</span>}
                          {dayPlan.lunch.carbs_g != null && <span>C: {dayPlan.lunch.carbs_g}g</span>}
                          {dayPlan.lunch.fat_g != null && <span>F: {dayPlan.lunch.fat_g}g</span>}
                        </div>
                      </div>

                      {/* Dinner */}
                      <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-800">
                              Dinner
                            </span>
                            {dayPlan.dinner.calories != null && <span className="text-xs font-bold text-indigo-700">Approx. {dayPlan.dinner.calories} kcal</span>}
                          </div>
                          <h4 className="font-bold text-slate-800 text-sm">{dayPlan.dinner.name}</h4>
                          {dayPlan.dinner.description && <p className="text-xs text-slate-600 mt-1 leading-relaxed">{dayPlan.dinner.description}</p>}
                        </div>
                        <div className="mt-3 pt-2 border-t border-indigo-100/60 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                          {dayPlan.dinner.protein_g != null && <span>P: {dayPlan.dinner.protein_g}g</span>}
                          {dayPlan.dinner.carbs_g != null && <span>C: {dayPlan.dinner.carbs_g}g</span>}
                          {dayPlan.dinner.fat_g != null && <span>F: {dayPlan.dinner.fat_g}g</span>}
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
                              {dayPlan.snack.calories != null && <span className="text-xs font-bold text-emerald-700">Approx. {dayPlan.snack.calories} kcal</span>}
                            </div>
                            <h4 className="font-bold text-slate-800 text-sm">{dayPlan.snack.name}</h4>
                            {dayPlan.snack.description && <p className="text-xs text-slate-600 mt-1 leading-relaxed">{dayPlan.snack.description}</p>}
                          </div>
                          <div className="mt-3 pt-2 border-t border-emerald-100/60 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                            {dayPlan.snack.protein_g != null && <span>P: {dayPlan.snack.protein_g}g</span>}
                            {dayPlan.snack.carbs_g != null && <span>C: {dayPlan.snack.carbs_g}g</span>}
                            {dayPlan.snack.fat_g != null && <span>F: {dayPlan.snack.fat_g}g</span>}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
            No saved weekly meal plan yet. Choose your preferences above to create one.
          </p>
        )}
      </div>
    </div>
  );
};

export default Nutrition;
