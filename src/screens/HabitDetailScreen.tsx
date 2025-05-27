import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Animated,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { StorageService } from '../services/storageService';
import {
  getTodayString,
  formatDate,
  getDateRange
} from '../utils/helpers';
import { useTheme } from '../contexts/ThemeContext';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { Theme } from '../contexts/ThemeContext';

type HabitDetailScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'HabitDetail'
>;

type HabitDetailScreenRouteProp = RouteProp<RootStackParamList, 'HabitDetail'>;

interface Props {
  navigation: HabitDetailScreenNavigationProp;
  route: HabitDetailScreenRouteProp;
}

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

interface DayCompletion {
  date: string;
  dateDisplay: string;
  dayNumber: number;
  dayName: string;
  isCompleted: boolean;
  isToday: boolean;
  isPast: boolean;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
}

interface WeekData {
  days: (DayCompletion | null)[];
}

const HabitDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { habitId } = route.params;
  const [habit, setHabit] = useState<Habit | null>(null);
  const [completionHistory, setCompletionHistory] = useState<DayCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const styles = useThemedStyles(createStyles);

  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.8)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const checkmarkScale = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadHabitData();
  }, [habitId]);

  const playCompletionAnimation = () => {
    // Reset animation values
    scaleAnim.setValue(1);
    overlayOpacity.setValue(0);
    cardScale.setValue(0.8);
    cardOpacity.setValue(0);
    checkmarkScale.setValue(0);
    textOpacity.setValue(0);

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.sequence([
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.spring(cardScale, {
          toValue: 1,
          tension: 80,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(100),
          Animated.spring(checkmarkScale, {
            toValue: 1,
            tension: 120,
            friction: 4,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.delay(150),
          Animated.timing(textOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
      ]),
      Animated.delay(800),
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(textOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  const loadHabitData = async () => {
    try {
      setLoading(true);
      const allHabits = await StorageService.getHabits();
      const foundHabit = allHabits.find(h => h.id === habitId);

      if (!foundHabit) {
        Alert.alert('Error', 'Habit not found', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
        return;
      }

      setHabit(foundHabit);
      generateCompletionHistory(foundHabit);
    } catch (error) {
      console.error('Error loading habit data:', error);
      Alert.alert('Error', 'Failed to load habit data');
    } finally {
      setLoading(false);
    }
  };

  const generateCompletionHistory = (habit: Habit) => {
    const today = new Date();
    const daysToShow = 30; // Show last 30 days
    const history: DayCompletion[] = [];

    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = formatDate(date);

      const completion = habit.completions.find(c => c.date === dateString);
      const isToday = dateString === getTodayString();
      const isPast = date < today && !isToday;

      history.push({
        date: dateString,
        dateDisplay: date.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        }),
        dayNumber: date.getDate(),
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayOfWeek: date.getDay(), // 0 = Sunday, 1 = Monday, etc.
        isCompleted: completion?.completed || false,
        isToday,
        isPast,
      });
    }

    setCompletionHistory(history);
  };

  const toggleCompletion = async (date: string) => {
    if (!habit) return;

    try {
      const existingCompletionIndex = habit.completions.findIndex(c => c.date === date);
      let updatedCompletions = [...habit.completions];
      let wasCompleted = false;
      let isNowCompleted = false;

      if (existingCompletionIndex >= 0) {
        wasCompleted = updatedCompletions[existingCompletionIndex].completed;
        updatedCompletions[existingCompletionIndex] = {
          ...updatedCompletions[existingCompletionIndex],
          completed: !updatedCompletions[existingCompletionIndex].completed,
        };
        isNowCompleted = updatedCompletions[existingCompletionIndex].completed;
      } else {
        updatedCompletions.push({
          date,
          completed: true,
        });
        isNowCompleted = true;
      }

      const updatedHabit = {
        ...habit,
        completions: updatedCompletions,
      };

      await StorageService.saveHabit(updatedHabit);
      setHabit(updatedHabit);
      generateCompletionHistory(updatedHabit);

      // Check if this is today's date and we just completed it (not uncompleted)
      const todayString = getTodayString();
      if (date === todayString && !wasCompleted && isNowCompleted) {
        playCompletionAnimation();
      }
    } catch (error) {
      console.error('Error toggling completion:', error);
      Alert.alert('Error', 'Failed to update completion status');
    }
  };

  const organizeIntoWeeks = (): WeekData[] => {
    const daysByWeek = new Map<string, (DayCompletion | null)[]>();

    completionHistory.forEach((day) => {
      const date = new Date(day.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];

      if (!daysByWeek.has(weekKey)) {
        daysByWeek.set(weekKey, new Array(7).fill(null));
      }

      const weekDays = daysByWeek.get(weekKey)!;
      weekDays[day.dayOfWeek] = day;
    });

    const sortedWeeks = Array.from(daysByWeek.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([_, days]) => ({ days }));

    return sortedWeeks;
  };

  const getCurrentWeekProgress = (): { completed: number; total: number; percentage: number } => {
    if (!habit || habit.frequency !== 'weekly') return { completed: 0, total: 7, percentage: 0 };

    const today = new Date();
    const currentWeekDates: string[] = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      const dayOfWeek = today.getDay();
      date.setDate(today.getDate() - dayOfWeek + i);
      currentWeekDates.push(formatDate(date));
    }

    const completedDays = currentWeekDates.filter(dateString => {
      const completion = habit.completions.find(c => c.date === dateString);
      return completion?.completed === true;
    }).length;

    const percentage = completedDays === 7 ? 100 : Math.round((completedDays / 7) * 100);

    return { completed: completedDays, total: 7, percentage };
  };

  const calculateStats = () => {
    if (!habit) return { totalDays: 0, completedDays: 0, completionRate: 0 };

    const totalDays = completionHistory.length;
    const completedDays = habit.completions.filter(c => c.completed).length;
    const completionRate = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

    return { totalDays, completedDays, completionRate };
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!habit) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Habit not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const stats = calculateStats();
  const habitIcon = habit.icon || '📘';
  const weeks = organizeIntoWeeks();
  const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weekProgress = getCurrentWeekProgress();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Habit Details</Text>
        <View style={styles.placeholder} />
      </View>

      <Animated.View
        style={[
          styles.celebrationOverlay,
          {
            opacity: overlayOpacity,
          }
        ]}
        pointerEvents="none"
      >
        <Animated.View
          style={[
            styles.celebrationCard,
            {
              opacity: cardOpacity,
              transform: [{ scale: cardScale }]
            }
          ]}
        >
          <Animated.View
            style={[
              styles.checkmarkContainer,
              {
                transform: [{ scale: checkmarkScale }]
              }
            ]}
          >
            <Text style={styles.checkmarkIcon}>✓</Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.celebrationTextContainer,
              {
                opacity: textOpacity,
              }
            ]}
          >
            <Text style={styles.celebrationTitle}>Well Done!</Text>
            <Text style={styles.celebrationSubtitle}>Habit completed for today</Text>
          </Animated.View>
        </Animated.View>
      </Animated.View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.habitInfoCard}>
          <View style={styles.habitHeader}>
            <View style={styles.habitIconContainer}>
              <Text style={styles.habitIcon}>{habitIcon}</Text>
            </View>
            <View style={styles.habitTitleContainer}>
              <Text style={styles.habitName}>{habit.name}</Text>
              <Text style={styles.habitFrequency}>
                {habit.frequency === 'daily' ? 'Daily habit' : 'Weekly habit'}
              </Text>
              <Text style={styles.habitCreated}>
                Created on {new Date(habit.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>

          {/* Weekly Progress Display */}
          {habit.frequency === 'weekly' && (
            <View style={styles.weeklyProgressSection}>
              <Text style={styles.progressSectionTitle}>This Week's Progress</Text>
              <View style={styles.progressDisplay}>
                <View style={styles.progressBarBackground}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${weekProgress.percentage}%` }
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {weekProgress.completed}/{weekProgress.total} days ({weekProgress.percentage}%)
                </Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.statsCard}>
          <Text style={styles.cardTitle}>Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.completionRate}%</Text>
              <Text style={styles.statLabel}>Completion Rate</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.completedDays}</Text>
              <Text style={styles.statLabel}>Completed Days</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.totalDays}</Text>
              <Text style={styles.statLabel}>Total Days</Text>
            </View>
          </View>
        </View>

        <View style={styles.historyCard}>
          <Text style={styles.cardTitle}>Completion History (Last 30 Days)</Text>
          <Text style={styles.historySubtitle}>Tap any day to toggle completion status</Text>

          <View style={styles.dayHeadersRow}>
            {dayHeaders.map((header, index) => (
              <View key={index} style={styles.dayHeaderItem}>
                <Text style={styles.dayHeaderText}>{header}</Text>
              </View>
            ))}
          </View>

          {weeks.map((week, weekIndex) => (
            <View key={weekIndex} style={styles.weekRow}>
              {week.days.map((day, dayIndex) => (
                <View key={dayIndex} style={styles.daySlot}>
                  {day ? (
                    <Animated.View
                      style={[
                        { transform: [{ scale: day.isToday ? scaleAnim : 1 }] }
                      ]}
                    >
                      <TouchableOpacity
                        style={[
                          styles.dayItem,
                          day.isCompleted && styles.dayItemCompleted,
                          day.isToday && styles.dayItemToday,
                        ]}
                        onPress={() => toggleCompletion(day.date)}
                      >
                        <Text style={[
                          styles.dayText,
                          day.isCompleted && styles.dayTextCompleted,
                          day.isToday && styles.dayTextToday,
                        ]}>
                          {day.dayNumber}
                        </Text>
                        {day.isCompleted && (
                          <Text style={styles.checkmark}>✓</Text>
                        )}
                      </TouchableOpacity>
                    </Animated.View>
                  ) : (
                    <View style={styles.emptyDaySlot} />
                  )}
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.separator,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: theme.primary,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.background,
  },
  loadingText: {
    fontSize: 16,
    color: theme.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.background,
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: theme.error,
    marginBottom: 20,
    textAlign: 'center',
  },
  habitInfoCard: {
    backgroundColor: theme.card,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  habitHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  habitIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: theme.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  habitIcon: {
    fontSize: 32,
  },
  habitTitleContainer: {
    flex: 1,
    paddingTop: 4,
  },
  habitName: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  habitFrequency: {
    fontSize: 16,
    color: theme.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  habitCreated: {
    fontSize: 14,
    color: theme.textSecondary,
    fontWeight: '400',
  },
  weeklyProgressSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: theme.separator,
  },
  progressSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 16,
  },
  progressDisplay: {
    alignItems: 'center',
  },
  progressBarBackground: {
    width: '100%',
    height: 12,
    backgroundColor: theme.separator,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: theme.primary,
    borderRadius: 6,
  },
  progressText: {
    fontSize: 14,
    color: theme.textSecondary,
    fontWeight: '500',
  },

  statsCard: {
    backgroundColor: theme.card,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '32%',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.primary,
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 13,
    color: theme.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  historyCard: {
    backgroundColor: theme.card,
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  historySubtitle: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 20,
    fontWeight: '400',
    lineHeight: 20,
  },
  dayHeadersRow: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  dayHeaderItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  dayHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  daySlot: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  emptyDaySlot: {
    height: 44,
    width: 44,
  },
  dayItem: {
    width: 44,
    height: 44,
    backgroundColor: theme.separator,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dayItemCompleted: {
    backgroundColor: theme.success,
    shadowColor: theme.success,
    shadowOpacity: 0.3,
  },
  dayItemToday: {
    borderWidth: 2,
    borderColor: theme.primary,
    backgroundColor: theme.primary + '10',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
  },
  dayTextCompleted: {
    color: 'white',
    fontWeight: '700',
  },
  dayTextToday: {
    color: theme.primary,
    fontWeight: '700',
  },
  checkmark: {
    position: 'absolute',
    top: 3,
    right: 3,
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
  celebrationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 1000,
  },
  celebrationCard: {
    backgroundColor: theme.card,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: theme.primary + '20',
    minWidth: 280,
  },
  checkmarkContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: theme.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  checkmarkIcon: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  celebrationTextContainer: {
    alignItems: 'center',
  },
  celebrationTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  celebrationSubtitle: {
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default HabitDetailScreen;
