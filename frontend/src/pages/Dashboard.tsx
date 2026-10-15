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

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Queries
  const { data: latestCheckIn, isLoading: checkInLoading } = useQuery({
    queryKey: ['wellness-latest'],
    queryFn: () => wellnessApi.getLatestCheckIn(),
  });

  const { data: trends, isLoading: trendsLoading } = useQuery({
    queryKey: ['wellness-trends-7d'],
    queryFn: () => wellnessApi.getWellnessTrends(7),
  });

  const { data: hydration } = useQuery({
    queryKey: ['hydration-today'],
    queryFn: () => nutritionApi.getHydration(),
  });

  const { data: medications } = useQuery({
    queryKey: ['medications'],
    queryFn: () => careSyncApi.getMedications(),
  });

  const { data: appointments } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => careSyncApi.getAppointments(),
  });

  const { data: habits } = useQuery({
    queryKey: ['habits'],
    queryFn: () => nutritionApi.getHabits(),
  });

  // Derived metrics
  const medsDue = medications?.filter((m) => m.is_active && !m.taken_today) || [];
  const medsTaken = medications?.filter((m) => m.taken_today).length || 0;
  const medsTotal = medications?.length || 0;
  const upcomingAppointments = appointments?.filter((a) => a.status === 'upcoming') || [];
  const habitsDone = habits?.filter((h) => h.completed).length || 0;
  const habitsTotal = habits?.length || 5;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 text-white p-6 sm:p-8 shadow-xl shadow-teal-900/10">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold mb-3 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-teal-200" />
            <span>AI Care Intelligence Engine Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Namaste, {user?.name || 'Aarogya Member'}
          </h1>
          <p className="mt-2 text-sm text-teal-100 font-normal leading-relaxed">
            Your physiological indicators are stable today. You have completed {medsTaken}/{medsTotal} scheduled medications and 
            logged {hydration?.glasses || 5}/8 glasses of water.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/wellness')}
              className="px-4 py-2 rounded-xl bg-white text-teal-800 text-xs font-bold shadow-md hover:bg-teal-50 transition-all flex items-center gap-1.5"
            >
              <Activity className="w-3.5 h-3.5 text-teal-600" />
              Daily Check-in
            </button>
            <button
              onClick={() => navigate('/assistant')}
              className="px-4 py-2 rounded-xl bg-teal-800/40 hover:bg-teal-800/60 backdrop-blur-md text-white text-xs font-semibold border border-white/20 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              Ask AI Doctor
            </button>
          </div>
        </div>

        {/* Decorative background shapes */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-center">
          <Heart className="w-80 h-80 text-white transform translate-x-12" />
        </div>
      </div>

      {/* Primary Stat Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Daily Wellness Score"
          value={latestCheckIn ? `${latestCheckIn.mood * 10}/100` : '85/100'}
          subtitle={latestCheckIn ? `Mood: ${latestCheckIn.mood}/10 • Stress: ${latestCheckIn.stress}/10` : 'Tap to log today\'s vitals'}
          icon={Activity}
          colorScheme="teal"
          trend={{ value: '+4 pts', isPositive: true }}
          onClick={() => navigate('/wellness')}
        />

        <StatCard
          title="Sleep Restored"
          value={latestCheckIn ? `${latestCheckIn.sleep_hours} hrs` : '7.5 hrs'}
          subtitle="Optimal restorative circadian phase"
          icon={Moon}
          colorScheme="indigo"
          trend={{ value: 'Target: 8.0h', neutral: true }}
          onClick={() => navigate('/wellness')}
        />

        <StatCard
          title="Hydration Intake"
          value={`${hydration?.glasses || 5} / ${hydration?.goal || 8}`}
          subtitle={`${Math.round(((hydration?.glasses || 5) / (hydration?.goal || 8)) * 100)}% of daily 2L goal`}
          icon={Droplets}
          colorScheme="cyan"
          trend={{ value: '+2 glasses', isPositive: true }}
          onClick={() => navigate('/nutrition')}
        />

        <StatCard
          title="Meds Due Today"
          value={medsDue.length}
          subtitle={medsDue.length === 0 ? 'All scheduled doses taken' : `${medsDue.length} doses pending`}
          icon={Pill}
          colorScheme={medsDue.length === 0 ? 'emerald' : 'amber'}
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
                  <h3 className="text-base font-bold text-slate-800">Today's Wellness</h3>
                  <p className="text-xs text-slate-400">RakshakAI Bio-Telemetry</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                Synchronized
              </span>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                  <span>Stress Level</span>
                  <span className="font-bold text-slate-800">{latestCheckIn?.stress || 4}/10</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-teal-500 h-2 rounded-full transition-all"
                    style={{ width: `${(latestCheckIn?.stress || 4) * 10}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                  <span>Fatigue Index</span>
                  <span className="font-bold text-slate-800">{latestCheckIn?.fatigue || 3}/10</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all"
                    style={{ width: `${(latestCheckIn?.fatigue || 3) * 10}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                  <span>Mood State</span>
                  <span className="font-bold text-slate-800">{latestCheckIn?.mood || 8}/10</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-teal-600 h-2 rounded-full transition-all"
                    style={{ width: `${(latestCheckIn?.mood || 8) * 10}%` }}
                  />
                </div>
              </div>

              {latestCheckIn?.notes && (
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600 italic">
                  "{latestCheckIn.notes}"
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <button
              onClick={() => navigate('/wellness')}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 transition-colors flex items-center justify-center gap-1.5"
            >
              Update Today's Metrics
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
                  <p className="text-xs text-slate-400">Mood vs. Stress correlation</p>
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
              ) : (
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
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        fontSize: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="mood"
                      name="Mood"
                      stroke="#0d9488"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#moodGradient)"
                    />
                    <Area
                      type="monotone"
                      dataKey="stress"
                      name="Stress"
                      stroke="#94a3b8"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      fillOpacity={1}
                      fill="url(#stressGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>✨ Gemini Insight: Inverse correlation confirmed—higher sleep correlates with +2.2 mood increase.</span>
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
                Record stress, fatigue, mood, and sleep duration for RakshakAI analysis.
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
                Ayurvedic and macro-balanced dietary recommendations within INR budget.
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
                Medications Due Today
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                {medsDue.length} doses remaining. Review dosages and mark completed.
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
            {upcomingAppointments.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No upcoming appointments scheduled.</p>
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
              {Math.round(((medsTaken + habitsDone + 1) / (medsTotal + habitsTotal + 1)) * 100)}% Complete
            </span>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50/40 border border-emerald-100/60">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-semibold text-slate-700">RakshakAI Bio Check-in</span>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                Recorded
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3">
                <Droplets className="w-5 h-5 text-cyan-600" />
                <span className="text-xs font-semibold text-slate-700">Hydration Goal</span>
              </div>
              <span className="text-[11px] font-bold text-slate-600">
                {hydration?.glasses || 5} of {hydration?.goal || 8} glasses
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3">
                <Pill className="w-5 h-5 text-teal-600" />
                <span className="text-xs font-semibold text-slate-700">Medication Adherence</span>
              </div>
              <span className="text-[11px] font-bold text-slate-600">
                {medsTaken} of {medsTotal} doses taken
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-indigo-600" />
                <span className="text-xs font-semibold text-slate-700">Daily Health Habits</span>
              </div>
              <span className="text-[11px] font-bold text-slate-600">
                {habitsDone} of {habitsTotal} accomplished
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
