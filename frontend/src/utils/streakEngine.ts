// SehatSync AI - Streak & Wellness Progress Calculation Engine

export interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  lastCheckInDate: string | null;
  isActiveToday: boolean;
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
    progress: number; // 0 to 100
  }>;
}

/**
 * Calculates genuine consecutive-day streaks from check-in dates.
 * Discards duplicates on the same date and correctly handles missed calendar days.
 */
export function calculateWellnessStreak(checkInDates: string[]): StreakStats {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Normalize and deduplicate dates (formatted YYYY-MM-DD)
  const uniqueDateSet = new Set<string>();
  checkInDates.forEach((d) => {
    if (!d) return;
    try {
      const dt = new Date(d);
      if (!isNaN(dt.getTime())) {
        const y = dt.getFullYear();
        const m = String(dt.getMonth() + 1).padStart(2, '0');
        const day = String(dt.getDate()).padStart(2, '0');
        uniqueDateSet.add(`${y}-${m}-${day}`);
      }
    } catch {
      // Ignore invalid date strings
    }
  });

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const isActiveToday = uniqueDateSet.has(todayStr);

  // Calculate current streak
  let currentStreak = 0;
  let checkPointer = new Date(today);

  // If today is not checked in yet, streak could still be alive if yesterday was checked in
  if (!isActiveToday) {
    checkPointer.setDate(checkPointer.getDate() - 1);
  }

  while (true) {
    const y = checkPointer.getFullYear();
    const m = String(checkPointer.getMonth() + 1).padStart(2, '0');
    const d = String(checkPointer.getDate()).padStart(2, '0');
    const dateKey = `${y}-${m}-${d}`;

    if (uniqueDateSet.has(dateKey)) {
      currentStreak += 1;
      checkPointer.setDate(checkPointer.getDate() - 1);
    } else {
      break;
    }
  }

  // Build weekly calendar (last 7 days ending today)
  const weeklyCalendar = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  let weekCheckInsCount = 0;

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateKey = `${y}-${m}-${day}`;
    const isChecked = uniqueDateSet.has(dateKey);
    if (isChecked) weekCheckInsCount += 1;

    weeklyCalendar.push({
      dateStr: dateKey,
      dayLabel: dayNames[d.getDay()],
      dayNumber: d.getDate(),
      isCheckedIn: isChecked,
      isToday: dateKey === todayStr,
    });
  }

  const completionRate7d = Math.round((weekCheckInsCount / 7) * 100);

  // Gamification Milestones & Badges
  const earnedBadges = [
    {
      id: 'first_step',
      title: 'First Step',
      description: 'Logged your first vital check-in',
      icon: '🌱',
      unlocked: uniqueDateSet.size >= 1,
      progress: Math.min(100, Math.round((uniqueDateSet.size / 1) * 100)),
    },
    {
      id: 'rhythm_builder',
      title: 'Rhythm Builder',
      description: '3 consecutive days of mindful check-ins',
      icon: '🔥',
      unlocked: currentStreak >= 3,
      progress: Math.min(100, Math.round((currentStreak / 3) * 100)),
    },
    {
      id: 'weekly_harmony',
      title: 'Weekly Harmony',
      description: 'Complete 7 days of verified check-ins',
      icon: '🏆',
      unlocked: currentStreak >= 7 || uniqueDateSet.size >= 7,
      progress: Math.min(100, Math.round((Math.max(currentStreak, uniqueDateSet.size) / 7) * 100)),
    },
    {
      id: 'wellness_champion',
      title: 'Wellness Champion',
      description: '14 consecutive days of steady tracking',
      icon: '⭐',
      unlocked: currentStreak >= 14,
      progress: Math.min(100, Math.round((currentStreak / 14) * 100)),
    },
  ];

  return {
    currentStreak,
    longestStreak: Math.max(currentStreak, uniqueDateSet.size),
    lastCheckInDate: uniqueDateSet.size > 0 ? Array.from(uniqueDateSet).sort().reverse()[0] : null,
    isActiveToday,
    weeklyCalendar,
    completionRate7d,
    earnedBadges,
  };
}
