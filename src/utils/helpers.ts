export const generateId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const getTodayString = (): string => {
  return formatDate(new Date());
};

export const isToday = (dateString: string): boolean => {
  return dateString === getTodayString();
};

export const getWeekStart = (date: Date = new Date()): Date => {
  const newDate = new Date(date); 
  const day = newDate.getDay();
  const diff = newDate.getDate() - day;
  newDate.setDate(diff);
  return newDate;
};

export const getWeekEnd = (date: Date = new Date()): Date => {
  const weekStart = getWeekStart(new Date(date)); 
  return new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
};

export const getDaysInWeek = (): string[] => {
  const today = new Date();
  const weekStart = getWeekStart(today);
  const days = [];

  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    days.push(formatDate(day));
  }

  return days;
};

export const calculateCompletionRate = (completions: any[], frequency: 'daily' | 'weekly'): number => {
  if (completions.length === 0) return 0;

  const completedCount = completions.filter(c => c.completed).length;
  return Math.round((completedCount / completions.length) * 100);
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

export const getProgressBarWidth = (completed: number, total: number): string => {
  if (total === 0) return '0%';
  if (completed === total) return '100%';
  return `${Math.round((completed / total) * 100)}%`;
};

export const isDateInCurrentWeek = (dateString: string): boolean => {
  const date = new Date(dateString);
  const today = new Date();
  const weekStart = getWeekStart(today);
  const weekEnd = getWeekEnd(today);

  return date >= weekStart && date <= weekEnd;
};

export const getCurrentWeekRangeString = (): string => {
  const weekStart = getWeekStart();
  const weekEnd = getWeekEnd();

  const formatOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const startFormatted = weekStart.toLocaleDateString('en-US', formatOptions);
  const endFormatted = weekEnd.toLocaleDateString('en-US', formatOptions);

  return `${startFormatted} - ${endFormatted}`;
};

export const getProgressColor = (rate: number, isDark: boolean = false): string => {
  if (isDark) {
    if (rate >= 80) return '#34C759';
    if (rate >= 60) return '#FF9F0A';
    if (rate >= 40) return '#FF8C00';
    return '#FF453A';
  } else {
    if (rate >= 80) return '#28a745';
    if (rate >= 60) return '#ffc107';
    if (rate >= 40) return '#fd7e14';
    return '#dc3545';
  }
};

export const isHabitCompletedInWeek = (habit: any, weekStartStr: string, weekEndStr: string): boolean => {
  return habit.completions.some((c: { date: string; completed: boolean }) => {
    const completionDateStr = c.date;

    return c.completed &&
           completionDateStr >= weekStartStr &&
           completionDateStr <= weekEndStr;
  });
};


export const getDateRange = (days: number): string[] => {
  const dates: string[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    dates.push(formatDate(date));
  }

  return dates;
};

export const getWeekRange = (weeks: number): Array<{start: string; end: string; label: string}> => {
  const ranges: Array<{start: string; end: string; label: string}> = [];
  const today = new Date();

  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - (today.getDay() + (i * 7)));

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const label = i === 0 ? 'This Week' :
                  i === 1 ? 'Last Week' :
                  `${i} weeks ago`;

    ranges.push({
      start: formatDate(weekStart),
      end: formatDate(weekEnd),
      label
    });
  }

  return ranges;
};

export const getHabitCompletionForDate = (habit: any, date: string): boolean => {
  const completion = habit.completions.find((c: any) => c.date === date);
  return completion?.completed || false;
};

export const getHabitCompletionForWeek = (habit: any, weekStart: string, weekEnd: string): boolean => {
  return habit.completions.some((c: any) =>
    c.date >= weekStart && c.date <= weekEnd && c.completed
  );
};

export const calculateStreakForHabit = (habit: any): number => {
  if (!habit.completions || habit.completions.length === 0) return 0;

  const sortedCompletions = habit.completions
    .filter((c: any) => c.completed)
    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (sortedCompletions.length === 0) return 0;

  let streak = 0;
  const today = new Date();

  for (let i = 0; i < sortedCompletions.length; i++) {
    const completionDate = new Date(sortedCompletions[i].date);
    const expectedDate = new Date(today);
    expectedDate.setDate(today.getDate() - i);

    if (habit.frequency === 'daily') {
      if (formatDate(completionDate) === formatDate(expectedDate)) {
        streak++;
      } else {
        break;
      }
    } else {

      const weekStart = getWeekStart(expectedDate);
      const weekEnd = getWeekEnd(expectedDate);

      if (completionDate >= weekStart && completionDate <= weekEnd) {
        streak++;
      } else {
        break;
      }
    }
  }

  return streak;
};
