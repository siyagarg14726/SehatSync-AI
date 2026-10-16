import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  Heart,
  Pill,
  Salad,
  Calendar,
  Sparkles,
  ArrowRight,
  Droplets,
  CheckCircle2,
  Clock,
  ShieldCheck,
  TrendingUp,
  Moon,
  Smile,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import StatCard from '../components/common/StatCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { wellnessApi } from '../api/wellness';
import { nutritionApi } from '../api/nutrition';
import { careSyncApi } from '../api/caresync';
import { useAuthStore } from '../store/authStore';
import { calculateWellnessStreak } from '../utils/streakEngine';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Queries
  const { data: latestCheckIn, isLoading: checkInLoading } = useQuery({
    queryKey: ['wellness-latest'],
    queryFn: () => wellnessApi.getLatestCheckIn(),
  });

  const { data: checkInHistory, isLoading: historyLoading, isError: historyError } = useQuery({
    queryKey: ['wellness-history'],
    queryFn: () => wellnessApi.getAllCheckIns(),
  });
  const streak = calculateWellnessStreak(
    (checkInHistory ?? [])
      .map((checkIn) => checkIn.recorded_at ?? checkIn.created_at ?? '')
      .filter(Boolean),
  );
  const todayCheckIn = streak.isActiveToday ? latestCheckIn : null;
  const hasCheckInToday = !historyLoading && !historyError && streak.isActiveToday;

  const { data: trends, isLoading: trendsLoading, isError: trendsError } = useQuery({
    queryKey: ['wellness-trends-7d'],
    queryFn: () => wellnessApi.getWellnessTrends(7),
  });

  const { data: hydration, isLoading: hydrationLoading, isError: hydrationError } = useQuery({
    queryKey: ['hydration-today'],
    queryFn: () => nutritionApi.getHydration(),
  });

  const { data: medications, isError: medicationsError } = useQuery({
    queryKey: ['medications'],
    queryFn: () => careSyncApi.getMedications(),
  });

  const { data: appointments, isLoading: appointmentsLoading, isError: appointmentsError } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => careSyncApi.getAppointments(),
  });

  const { data: habits, isError: habitsError } = useQuery({
    queryKey: ['habits'],
    queryFn: () => nutritionApi.getHabits(),
  });

  // Derived metrics
  const activeMedications = medications?.filter((m) => m.is_active) || [];
  const upcomingAppointments = appointments?.filter((a) => a.status === 'upcoming') || [];
  const habitsDone = habits?.filter((h) => h.completed).length || 0;
  const habitsTotal = habits?.length || 0;
  const planTotal = 2 + habitsTotal;
  const planComplete = (hasCheckInToday ? 1 : 0) +
    (hydration && hydration.glasses >= hydration.goal ? 1 : 0) +
    habitsDone;
  const carePlanAvailable = !historyLoading && !historyError && Boolean(hydration) && Boolean(habits) &&
    !hydrationError && !habitsError;
  const planProgress = carePlanAvailable ? Math.round((planComplete / planTotal) * 100) : null;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 text-white p-6 sm:p-8 shadow-xl shadow-teal-900/10">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold mb-3 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-teal-200" />
            <span>Your connected care overview</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Namaste, {user?.name || 'Member'}
          </h1>
          <p className="mt-2 text-sm text-teal-100 font-normal leading-relaxed">
            Your wellness check-ins and connected care information are brought together here. Data appears when available from your account.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/wellness')}
              className="px-4 py-2 rounded-xl bg-white text-teal-800 text-xs font-bold shadow-md hover:bg-teal-50 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Activity className="w-3.5 h-3.5 text-teal-600" />
              Daily wellness check-in
            </button>
            <button
              onClick={() => navigate('/assistant')}
              className="px-4 py-2 rounded-xl bg-teal-800/40 hover:bg-teal-800/60 backdrop-blur-md text-white text-xs font-semibold border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              Ask My Health AI
            </button>
          </div>
        </div>

        {/* Decorative background shapes */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-center">
          <Heart className="w-80 h-80 text-white transform translate-x-12" />
        </div>
      </div>

      <section aria-labelledby="wellness-progress-title" className="rounded-3xl border border-teal-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">Your wellness rhythm</p>
            <h2 id="wellness-progress-title" className="mt-1 text-xl font-bold text-slate-900">Small check-ins, steady progress</h2>
            <p className="mt-1 text-sm text-slate-600">Progress is calculated from saved check-in dates, not sign-ins.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/wellness')}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2"
          >
            {historyLoading || historyError ? 'Open Wellness' : streak.isActiveToday ? 'View today’s check-in' : 'Log today’s check-in'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        {historyLoading ? (
          <p role="status" className="mt-5 text-sm text-slate-600">Loading your check-in history…</p>
        ) : historyError ? (
          <p role="alert" className="mt-5 rounded-xl bg-rose-50 p-4 text-sm text-rose-800">
            Your check-in history could not be loaded. Streaks and weekly progress are hidden until it is available.
          </p>
        ) : (
        <div className="mt-5 grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-teal-50 p-4">
              <p className="text-xs font-medium text-teal-800">Current streak</p>
              <p className="mt-1 text-2xl font-bold text-teal-950">{streak.currentStreak} <span className="text-sm font-semibold">days</span></p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-4">
              <p className="text-xs font-medium text-emerald-800">Longest streak</p>
              <p className="mt-1 text-2xl font-bold text-emerald-950">{streak.longestStreak} <span className="text-sm font-semibold">days</span></p>
            </div>
            <div className="col-span-2 rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-800">Weekly check-in goal</span>
                <span className="font-semibold text-teal-800">{streak.checkInsThisWeek}/{streak.weeklyGoal}</span>
              </div>
              <div
                role="progressbar"
                aria-label="Weekly wellness check-in goal"
                aria-valuemin={0}
                aria-valuemax={streak.weeklyGoal}
                aria-valuenow={Math.min(streak.checkInsThisWeek, streak.weeklyGoal)}
                className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"
              >
                <div className="h-full rounded-full bg-teal-600 transition-all" style={{ width: `${streak.weeklyGoalProgress}%` }} />
              </div>
              <p className="mt-2 text-xs text-slate-500">{streak.weeklyGoalProgress}% of your weekly goal</p>
            </div>
          </div>
          <div>
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2" aria-label="Check-in activity in the last seven days">
              {streak.weeklyCalendar.map((day) => (
                <div key={day.dateStr} className="text-center">
                  <span className="block text-[10px] font-medium text-slate-500">{day.dayLabel}</span>
                  <span
                    title={`${day.dateStr}${day.isCheckedIn ? ': check-in logged' : ': no check-in'}`}
                    aria-label={`${day.dateStr}${day.isCheckedIn ? ', check-in logged' : ', no check-in'}${day.isToday ? ', today' : ''}`}
                    className={`mx-auto mt-1 flex h-9 w-9 items-center justify-center rounded-xl text-xs font-semibold ${
                      day.isCheckedIn
                        ? 'bg-teal-700 text-white'
                        : day.isToday
                          ? 'border border-teal-300 bg-teal-50 text-teal-800'
                          : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {day.dayNumber}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {streak.earnedBadges.map((badge) => (
                <div key={badge.id} title={badge.description} className={`rounded-xl border p-2.5 ${badge.unlocked ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-slate-50'}`}>
                  <span aria-hidden="true" className="text-lg">{badge.icon}</span>
                  <p className="mt-1 text-[10px] font-semibold leading-tight text-slate-700">{badge.title}</p>
                  <p className="mt-1 text-[10px] text-slate-500">{badge.unlocked ? 'Earned' : `${badge.progress}%`}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-500">A check-in streak reflects activity, not a clinical health measure.</p>
          </div>
        </div>
        )}
      </section>

      {/* Primary Stat Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Today's check-in"
          value={historyLoading || historyError ? '—' : hasCheckInToday ? 'Logged' : 'Not logged'}
          subtitle={todayCheckIn ? 'Your entry is saved' : 'Add a wellness check-in'}
          icon={Activity}
          colorScheme="teal"
          onClick={() => navigate('/wellness')}
        />

        <StatCard
          title="Last sleep entry"
          value={todayCheckIn ? `${todayCheckIn.sleep_hours} hrs` : '—'}
          subtitle={todayCheckIn ? 'From today’s check-in' : 'Log a check-in to view'}
          icon={Moon}
          colorScheme="indigo"
          onClick={() => navigate('/wellness')}
        />

        <StatCard
          title="Hydration Intake"
          value={hydration ? `${hydration.glasses} / ${hydration.goal}` : '—'}
          subtitle={hydrationLoading ? 'Loading hydration data' : hydrationError ? 'Hydration data could not be loaded' : hydration ? 'Glasses logged / saved goal' : 'No hydration record available'}
          icon={Droplets}
          colorScheme="cyan"
          onClick={() => navigate('/nutrition')}
        />

        <StatCard
          title="Medication schedules"
          value={medications ? activeMedications.length : '—'}
          subtitle={medications ? 'Active schedules' : 'Medication data unavailable'}
          icon={Pill}
          colorScheme="emerald"
          onClick={() => navigate('/caresync')}
        />
      </div>

      {/* Main Grid: Today's Summary & 7-Day Trend Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Wellness Summary Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
                  <Smile className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Today's Wellness Check-in</h3>
                  <p className="text-xs text-slate-400">Your self-reported entry</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                {historyLoading || checkInLoading ? 'Loading' : historyError ? 'History unavailable' : hasCheckInToday ? 'Saved' : 'No entry today'}
              </span>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                  <span>Stress Level</span>
                  <span className="font-bold text-slate-800">{todayCheckIn ? `${todayCheckIn.stress}/10` : '—'}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-teal-500 h-2 rounded-full transition-all"
                    style={{ width: `${(todayCheckIn?.stress ?? 0) * 10}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                  <span>Fatigue Index</span>
                  <span className="font-bold text-slate-800">{todayCheckIn ? `${todayCheckIn.fatigue}/10` : '—'}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all"
                    style={{ width: `${(todayCheckIn?.fatigue ?? 0) * 10}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                  <span>Mood State</span>
                  <span className="font-bold text-slate-800">{todayCheckIn ? `${todayCheckIn.mood}/10` : '—'}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-teal-600 h-2 rounded-full transition-all"
                    style={{ width: `${(todayCheckIn?.mood ?? 0) * 10}%` }}
                  />
                </div>
              </div>

              {todayCheckIn?.notes && (
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600 italic">
                  "{todayCheckIn.notes}"
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <button
              onClick={() => navigate('/wellness')}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 transition-colors flex items-center justify-center gap-1.5"
            >
              Review today's check-in
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 7-Day Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Wellness Trend (Last 7 Days)</h3>
                  <p className="text-xs text-slate-400">Mood and stress scores from your entries</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-teal-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
                  Mood (1-10)
                </span>
                <span className="flex items-center gap-1.5 text-slate-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                  Stress (1-10)
                </span>
              </div>
            </div>

            <div className="h-64 mt-4">
              {trendsLoading ? (
                <LoadingSpinner />
              ) : trendsError ? (
                <div role="alert" className="flex h-full items-center justify-center rounded-2xl bg-rose-50 px-6 text-center text-sm text-rose-800">
                  Your wellness trends could not be loaded.
                </div>
              ) : trends?.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="stressGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                    <Area type="monotone" dataKey="mood" name="Mood" stroke="#0d9488" strokeWidth={2.5} fillOpacity={1} fill="url(#moodGradient)" />
                    <Area type="monotone" dataKey="stress" name="Stress" stroke="#94a3b8" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#stressGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center rounded-2xl bg-slate-50 px-6 text-center text-sm text-slate-500">
                  Your wellness trend will appear after check-ins have been recorded.
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Trend lines reflect your saved check-ins; they are not a diagnosis.</span>
            <button
              onClick={() => navigate('/wellness')}
              className="text-teal-700 font-bold hover:underline shrink-0 ml-2"
            >
              Full Analytics →
            </button>
          </div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div>
        <h3 className="text-base font-bold text-slate-800 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            onClick={() => navigate('/wellness')}
            className="group cursor-pointer p-5 bg-white rounded-2xl border border-slate-200/80 hover:border-teal-300 hover:shadow-md transition-all flex items-start gap-4"
          >
            <div className="p-3 rounded-2xl bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-all">
              <Activity className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-800 group-hover:text-teal-700 transition-colors">
                Log Today's Wellness
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Record your mood, stress, fatigue, and sleep for your personal wellness history.
              </p>
            </div>
          </div>

          <div
            onClick={() => navigate('/nutrition')}
            className="group cursor-pointer p-5 bg-white rounded-2xl border border-slate-200/80 hover:border-emerald-300 hover:shadow-md transition-all flex items-start gap-4"
          >
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
              <Salad className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">
                View Weekly Meal Plan
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Review your saved nutrition preferences and meal plans.
              </p>
            </div>
          </div>

          <div
            onClick={() => navigate('/caresync')}
            className="group cursor-pointer p-5 bg-white rounded-2xl border border-slate-200/80 hover:border-teal-300 hover:shadow-md transition-all flex items-start gap-4"
          >
            <div className="p-3 rounded-2xl bg-cyan-50 text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white transition-all">
              <Pill className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-800 group-hover:text-cyan-700 transition-colors">
                Review Medication Schedules
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                View medication details saved in Care Coordination.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Upcoming Appointments & Daily Care Plan Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments Widget */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Upcoming Appointments</h3>
                <p className="text-xs text-slate-400">Consultations & Follow-ups</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/caresync')}
              className="text-xs font-bold text-teal-700 hover:text-teal-800 transition-colors"
            >
              Manage →
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {appointmentsLoading ? (
              <p role="status" className="py-4 text-center text-xs text-slate-500">Loading appointment details…</p>
            ) : appointmentsError ? (
              <p role="alert" className="py-4 text-center text-xs text-rose-700">Appointment details could not be loaded.</p>
            ) : upcomingAppointments.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No upcoming appointments are available in your connected care data.</p>
            ) : (
              upcomingAppointments.slice(0, 2).map((apt) => (
                <div
                  key={apt.id}
                  className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 flex items-center justify-between hover:bg-slate-100/70 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-white text-teal-600 shadow-xs border border-slate-100">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{apt.doctor_name}</h4>
                      <p className="text-xs text-slate-500 font-medium">{apt.specialty}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{apt.hospital_clinic}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-100">
                      {apt.date}
                    </span>
                    <p className="text-[11px] font-semibold text-slate-500 mt-1">{apt.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Daily Care Plan Summary */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Daily Care Plan</h3>
                <p className="text-xs text-slate-400">Today's health task checklist</p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
              {planProgress == null ? 'Progress unavailable' : `${planProgress}% Complete`}
            </span>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50/40 border border-emerald-100/60">
              <div className="flex items-center gap-3">
                <CheckCircle2 className={`w-5 h-5 ${hasCheckInToday ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span className="text-xs font-semibold text-slate-700">Daily wellness check-in</span>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                {historyLoading ? 'Loading' : historyError ? 'Unavailable' : hasCheckInToday ? 'Recorded' : 'Not logged'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3">
                <Droplets className="w-5 h-5 text-cyan-600" />
                <span className="text-xs font-semibold text-slate-700">Hydration Goal</span>
              </div>
              <span className="text-[11px] font-bold text-slate-600">
                {hydrationLoading ? 'Loading' : hydrationError ? 'Unavailable' : hydration ? `${hydration.glasses} of ${hydration.goal} glasses` : 'Unavailable'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3">
                <Pill className="w-5 h-5 text-teal-600" />
                <span className="text-xs font-semibold text-slate-700">Medication schedules</span>
              </div>
              <span className="text-[11px] font-bold text-slate-600">
                {medicationsError ? 'Unavailable' : medications ? `${activeMedications.length} active schedules` : 'Loading'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-indigo-600" />
                <span className="text-xs font-semibold text-slate-700">Daily Health Habits</span>
              </div>
              <span className="text-[11px] font-bold text-slate-600">
                {habitsError ? 'Unavailable' : habits ? `${habitsDone} of ${habitsTotal} completed` : 'Loading'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
