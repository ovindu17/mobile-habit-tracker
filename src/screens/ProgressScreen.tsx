import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Platform,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {StorageService} from '../services/storageService';
import {getTodayString, getDaysInWeek, getWeekStart, getWeekEnd, getCurrentWeekRangeString} from '../utils/helpers';
import { StatsSummary, WeeklyChart } from '../components';
import { useTheme } from '../contexts/ThemeContext';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { Theme } from '../contexts/ThemeContext';

interface Habit {
  id: string;
  userId: string;
  name: string;
  frequency: 'daily' | 'weekly';
  createdAt: string;
  completions: Array<{date: string; completed: boolean}>;
  icon?: string;
  goal?: string;
}

interface ProgressStats {
  totalHabits: number;
  todayCompleted: number;
  todayCompletionRate: number;
  weeklyStats: Array<{
    date: string;
    dailyCompleted: number;
    dailyTotal: number;
    weeklyCompleted: number; // Integer count of weekly habits completed on this specific date
    weeklyTotal: number;
    overallPercentage: number;
  }>;
}

const ProgressScreen: React.FC = () => {
  const [stats, setStats] = useState<ProgressStats>({
    totalHabits: 0,
    todayCompleted: 0,
    todayCompletionRate: 0,
    weeklyStats: [],
  });
  const [habits, setHabits] = useState<Habit[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { theme } = useTheme();
  const styles = useThemedStyles(createStyles);

  useFocusEffect(
    React.useCallback(() => {
      loadProgressData();
    }, []),
  );

  const loadProgressData = async () => {
    try {
      const currentUser = await StorageService.getCurrentUser();
      if (!currentUser) return;

      const userHabits = await StorageService.getHabitsByUserId(currentUser.id);
      setHabits(userHabits);
      calculateStats(userHabits);
    } catch (error) {
      console.error('Error loading progress data:', error);
    }
  };

  const calculateStats = (habits: Habit[]) => {
    const todayString = getTodayString();
    const weekDays = getDaysInWeek();

    // Today's completion stats
    const totalHabits = habits.length;

    // For daily habits, check today's completion
    // For weekly habits, check if there is any completion in the current week
    const todayCompleted = habits.filter(habit => {
      if (habit.frequency === 'daily') {
        const todayCompletion = habit.completions.find(c => c.date === todayString);
        return todayCompletion?.completed;
      } else {
        // For weekly habits, check if completed in any day of the current week
        return habit.completions.some(c => {
          const completionDate = new Date(c.date);
          const weekStart = getWeekStart(new Date());
          const weekEnd = getWeekEnd(new Date());
          return c.completed && completionDate >= weekStart && completionDate <= weekEnd;
        });
      }
    }).length;

    const todayCompletionRate = totalHabits > 0 ? Math.round((todayCompleted / totalHabits) * 100) : 0;

    // Weekly stats with improved logic
    const weeklyStats = weekDays.map(date => {
      const dateObj = new Date(date);

      // Count daily habits that existed on this date
      const dailyHabits = habits.filter(habit =>
        habit.frequency === 'daily' && new Date(habit.createdAt) <= dateObj
      );

      // Count weekly habits that existed on this date
      const weeklyHabits = habits.filter(habit =>
        habit.frequency === 'weekly' && new Date(habit.createdAt) <= dateObj
      );

      // For daily habits, check completion on that specific day
      const dailyCompleted = dailyHabits.filter(habit => {
        const dayCompletion = habit.completions.find(c => c.date === date);
        return dayCompletion?.completed;
      }).length;

      // For weekly habits, only count progress for this specific date
      const weeklyCompleted = weeklyHabits.filter(habit => {
        // Check if this specific date is marked as completed for this weekly habit
        const dayCompletion = habit.completions.find(c => c.date === date);
        return dayCompletion?.completed === true;
      }).length;

      const dailyTotal = dailyHabits.length;
      const weeklyTotal = weeklyHabits.length;
      const totalHabits = dailyTotal + weeklyTotal;
      const totalCompleted = dailyCompleted + weeklyCompleted;

      // Calculate percentage with fractional weekly progress
      const overallPercentage = totalHabits > 0 ? Math.round((totalCompleted / totalHabits) * 100) : 0;

      return {
        date,
        dailyCompleted,
        dailyTotal,
        weeklyCompleted, // Integer count of weekly habits completed on this specific date
        weeklyTotal,
        overallPercentage,
      };
    });

    setStats({
      totalHabits,
      todayCompleted,
      todayCompletionRate,
      weeklyStats,
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProgressData();
    setRefreshing(false);
  };



  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>


      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Progress</Text>
        </View>
        <Text style={styles.subtitle}>Track your habit consistency</Text>
      </View>


      <StatsSummary
        title="Today's Progress"
        completed={stats.todayCompleted}
        total={stats.totalHabits}
        completionRate={stats.todayCompletionRate}
        note={`Note: Daily habits are tracked for today, weekly habits for the current week (${getCurrentWeekRangeString()})`}
        style={styles.card}
      />


      <WeeklyChart
        title="This Week"
        data={stats.weeklyStats}
        style={styles.card}
      />








      {stats.totalHabits === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No habits yet! Create your first habit to start tracking progress.
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollContent: {
    paddingBottom: Platform.OS === 'ios' ? 100 : 80,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: theme.surface,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: theme.text,
  },
  subtitle: {
    fontSize: 26,
    color: theme.textSecondary,
    marginBottom: 15,
  },
  card: {
    backgroundColor: theme.card,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: theme.shadow,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },

  todayStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  todayStatItem: {
    alignItems: 'center',
  },
  todayStatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.text,
  },
  todayStatLabel: {
    fontSize: 12,
    color: theme.textSecondary,
    marginTop: 4,
  },
  progressBarContainer: {
    marginTop: 8,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: theme.separator,
    borderRadius: 4,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressNote: {
    fontSize: 12,
    color: theme.textSecondary,
    marginTop: 10,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  weeklyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekDayContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  weekDayLabel: {
    fontSize: 12,
    color: theme.textSecondary,
    marginBottom: 8,
  },
  weekDayBar: {
    height: 80,
    width: 20,
    justifyContent: 'flex-end',
  },
  weekDayBarBackground: {
    flex: 1,
    backgroundColor: theme.separator,
    borderRadius: 10,
    justifyContent: 'flex-end',
  },
  weekDayBarFill: {
    width: '100%',
    borderRadius: 10,
  },
  weekDayNumbers: {
    fontSize: 10,
    color: theme.textSecondary,
    marginTop: 4,
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: 'center',
  },
});

export default ProgressScreen;
