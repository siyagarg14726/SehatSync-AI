import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Activity,
  Sparkles,
  CheckCircle,
  TrendingUp,
  Moon,
  Brain,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import SliderInput from '../components/common/SliderInput';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { wellnessApi } from '../api/wellness';
import { WellnessCheckIn, WellnessInsight } from '../types';
import toast from 'react-hot-toast';

export const Wellness: React.FC = () => {
  const queryClient = useQueryClient();

  // Form state for daily check-in
  const [stress, setStress] = useState<number>(4);
  const [fatigue, setFatigue] = useState<number>(3);
  const [mood, setMood] = useState<number>(8);
  const [sleepHours, setSleepHours] = useState<number>(7.5);
  const [notes, setNotes] = useState<string>('');

  // AI Insights state
  const [currentInsight, setCurrentInsight] = useState<WellnessInsight | null>(null);

  // Queries
  const { data: trends, isLoading: trendsLoading } = useQuery({
    queryKey: ['wellness-trends-30d'],
    queryFn: () => wellnessApi.getWellnessTrends(30),
  });

  // Submit check-in mutation
  const checkInMutation = useMutation({
    mutationFn: (data: WellnessCheckIn) => wellnessApi.submitCheckIn(data),
    onSuccess: () => {
      toast.success('Daily wellness check-in logged successfully!');
      queryClient.invalidateQueries({ queryKey: ['wellness-latest'] });
      queryClient.invalidateQueries({ queryKey: ['wellness-trends-30d'] });
      queryClient.invalidateQueries({ queryKey: ['wellness-trends-7d'] });
    },
    onError: () => {
      toast.error('Failed to submit check-in. Try again.');
    },
  });

  // Generate Gemini AI Insights mutation
  const insightMutation = useMutation({
    mutationFn: () => wellnessApi.getAiInsights(),
    onSuccess: (data) => {
      setCurrentInsight(data);
      toast.success('Gemini AI clinical insights refreshed!');
    },
    onError: () => {
      toast.error('Could not generate insights right now.');
    },
  });

  const handleSubmitCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    checkInMutation.mutate({
      stress,
      fatigue,
      mood,
      sleep_hours: Number(sleepHours),
      notes: notes.trim() || undefined,
    });
  };

  return (
    <div className="space-y-8">
      {/* Module Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800">
              My <span className="text-teal-600">Wellness Vitals</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-200">
              Smart Telemetry
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Monitor daily nervous system fatigue, mood variance, and sleep architecture powered by explainable AI insights.
          </p>
        </div>

        <button
          onClick={() => insightMutation.mutate()}
          disabled={insightMutation.isPending}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white text-xs font-bold shadow-md hover:from-teal-700 hover:to-emerald-700 transition-all cursor-pointer disabled:opacity-50"
        >
          {insightMutation.isPending ? (
            <LoadingSpinner size="sm" />
          ) : (
            <Sparkles className="w-4 h-4 text-emerald-200" />
          )}
          <span>Generate Gemini AI Insights</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Daily Check-in */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">Daily Bio Check-In</h2>
              <p className="text-xs text-slate-400">Log vitals for algorithmic calibration</p>
            </div>
          </div>

          <form onSubmit={handleSubmitCheckIn} className="mt-6 space-y-5">
            <SliderInput
              label="Perceived Stress"
              helperText="1 = Calm & centered, 10 = Acute overload"
              value={stress}
              onChange={setStress}
              min={1}
              max={10}
              lowLabel="Serene"
              highLabel="Overwhelmed"
              colorScheme="amber"
            />

            <SliderInput
              label="Physical & Mental Fatigue"
              helperText="1 = Fully energized, 10 = Severe exhaustion"
              value={fatigue}
              onChange={setFatigue}
              min={1}
              max={10}
              lowLabel="Vibrant"
              highLabel="Drained"
              colorScheme="rose"
            />

            <SliderInput
              label="Emotional Mood"
              helperText="1 = Depressed or anxious, 10 = Uplifted & joyful"
              value={mood}
              onChange={setMood}
              min={1}
              max={10}
              lowLabel="Low"
              highLabel="Great"
              colorScheme="emerald"
            />

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                  <Moon className="w-4 h-4 text-indigo-500" />
                  Sleep Duration (Hours)
                </label>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                  {sleepHours} hrs
                </span>
              </div>
              <input
                type="number"
                step="0.5"
                min="0"
                max="24"
                value={sleepHours}
                onChange={(e) => setSleepHours(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-slate-50/50 text-slate-800 font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                Notes & Physical Symptoms
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="E.g. Mild headache around 4 PM, slept early, took herbal tea..."
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-slate-50/50 text-slate-800 placeholder-slate-400 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={checkInMutation.isPending}
              className="w-full py-3 px-4 rounded-xl shadow-md text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {checkInMutation.isPending ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Submit Today's Bio Log</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Panel: AI Insights & Recommendation Card */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-800">RakshakAI Clinical Intelligence</h2>
                  <p className="text-xs text-slate-400">Powered by Google Gemini Pro Healthcare Model</p>
                </div>
              </div>

              {currentInsight?.risk_level && (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Risk Level: Low
                </span>
              )}
            </div>

            {currentInsight ? (
              <div className="mt-5 space-y-5">
                <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800 mb-1">
                    Telemetry Synthesis
                  </h3>
                  <p className="text-sm font-medium text-slate-700 leading-relaxed">
                    {currentInsight.summary}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                    Key Observations
                  </h4>
                  <ul className="space-y-2">
                    {currentInsight.insights.map((ins, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0 mt-1.5" />
                        <span>{ins}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    Actionable Recommendations
                  </h4>
                  <ul className="space-y-2">
                    {currentInsight.recommendations.map((rec, idx) => (
                      <li key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 flex items-start gap-2">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {currentInsight.gemini_response && (
                  <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 text-xs font-mono whitespace-pre-wrap leading-relaxed">
                    {currentInsight.gemini_response}
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-8 py-10 flex flex-col items-center justify-center text-center px-4">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-3">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">Generate Your Personalized AI Synthesis</h3>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  Click the "Generate Gemini AI Insights" button to run an algorithmic scan on your stress, sleep, and fatigue parameters.
                </p>
                <button
                  onClick={() => insightMutation.mutate()}
                  disabled={insightMutation.isPending}
                  className="mt-4 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold shadow-sm hover:bg-teal-700 transition-colors"
                >
                  Generate Now
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 30-Day Trend Charts Section */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">30-Day Physiological Biometrics</h2>
              <p className="text-xs text-slate-400">Longitudinal evaluation of stress, mood, and sleep duration</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-teal-600">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
              Mood (1-10)
            </span>
            <span className="flex items-center gap-1.5 text-rose-500">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              Stress (1-10)
            </span>
            <span className="flex items-center gap-1.5 text-indigo-500">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              Sleep (Hours)
            </span>
          </div>
        </div>

        <div className="h-80 mt-6">
          {trendsLoading ? (
            <LoadingSpinner />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
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
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Line
                  type="monotone"
                  dataKey="mood"
                  name="Mood Level"
                  stroke="#0d9488"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="stress"
                  name="Stress Level"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                  dot={false}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="sleep_hours"
                  name="Sleep Hours"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wellness;
