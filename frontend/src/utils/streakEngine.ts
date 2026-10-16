export interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  lastCheckInDate: string | null;
  isActiveToday: boolean;
  checkInsThisWeek: number;
  weeklyGoal: number;
  weeklyGoalProgress: number;
  weeklyCalendar: Array<{
    dateStr: string;
    dayLabel: string;
    dayNumber: number;
    isCheckedIn: boolean;
    isToday: boolean;
  }>;
  completionRate7d: number;
  earnedBadges: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    unlocked: boolean;
    progress: number;
  }>;
}

const formatDateKey = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const parseDateKey = (value: string): string | null => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
      ? value
      : null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : formatDateKey(date);
};

const differenceInDays = (newer: string, older: string): number => {
  const [newerYear, newerMonth, newerDay] = newer.split('-').map(Number);
  const [olderYear, olderMonth, olderDay] = older.split('-').map(Number);
  return (
    Date.UTC(newerYear, newerMonth - 1, newerDay) -
    Date.UTC(olderYear, olderMonth - 1, olderDay)
  ) / 86_400_000;
};

export function calculateWellnessStreak(checkInDates: string[]): StreakStats {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = formatDateKey(today);
  const uniqueDateSet = new Set(
    checkInDates
      .map(parseDateKey)
      .filter((date): date is string => Boolean(date && date <= todayStr)),
  );
  const sortedDates = Array.from(uniqueDateSet).sort();
  const isActiveToday = uniqueDateSet.has(todayStr);

  let currentStreak = 0;
  const streakStart = new Date(today);
  if (!isActiveToday) streakStart.setDate(streakStart.getDate() - 1);
  let pointer = formatDateKey(streakStart);
  while (uniqueDateSet.has(pointer)) {
    currentStreak += 1;
    streakStart.setDate(streakStart.getDate() - 1);
    pointer = formatDateKey(streakStart);
  }

  let longestStreak = 0;
  let consecutiveRun = 0;
  let previousDate: string | null = null;
  for (const date of sortedDates) {
    consecutiveRun = previousDate && differenceInDays(date, previousDate) === 1
      ? consecutiveRun + 1
      : 1;
    longestStreak = Math.max(longestStreak, consecutiveRun);
    previousDate = date;
  }

  const weeklyCalendar: StreakStats['weeklyCalendar'] = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  for (let offset = 6; offset >= 0; offset -= 1) {
    const day = new Date(today);
    day.setDate(day.getDate() - offset);
    const dateStr = formatDateKey(day);
    weeklyCalendar.push({
      dateStr,
      dayLabel: dayNames[day.getDay()],
      dayNumber: day.getDate(),
      isCheckedIn: uniqueDateSet.has(dateStr),
      isToday: dateStr === todayStr,
    });
  }

  const checkInsThisWeek = weeklyCalendar.filter((day) => day.isCheckedIn).length;
  const weeklyGoal = 5;
  const weeklyGoalProgress = Math.min(100, Math.round((checkInsThisWeek / weeklyGoal) * 100));

  return {
    currentStreak,
    longestStreak,
    lastCheckInDate: sortedDates.length ? sortedDates[sortedDates.length - 1] : null,
    isActiveToday,
    checkInsThisWeek,
    weeklyGoal,
    weeklyGoalProgress,
    weeklyCalendar,
    completionRate7d: Math.round((checkInsThisWeek / 7) * 100),
    earnedBadges: [
      {
        id: 'first_step',
        title: 'First Step',
        description: 'Log your first daily wellness check-in',
        icon: '🌱',
        unlocked: sortedDates.length > 0,
        progress: sortedDates.length > 0 ? 100 : 0,
      },
      {
        id: 'rhythm_builder',
        title: 'Rhythm Builder',
        description: 'Check in on three consecutive days',
        icon: '🔥',
        unlocked: longestStreak >= 3,
        progress: Math.min(100, Math.round((longestStreak / 3) * 100)),
      },
      {
        id: 'weekly_harmony',
        title: 'Weekly Harmony',
        description: `Reach ${weeklyGoal} check-ins in one week`,
        icon: '🏆',
        unlocked: weeklyCalendar.filter((day) => day.isCheckedIn).length >= weeklyGoal,
        progress: weeklyGoalProgress,
      },
      {
        id: 'wellness_champion',
        title: 'Wellness Champion',
        description: 'Check in on fourteen consecutive days',
        icon: '⭐',
        unlocked: longestStreak >= 14,
        progress: Math.min(100, Math.round((longestStreak / 14) * 100)),
      },
    ],
  };
}
