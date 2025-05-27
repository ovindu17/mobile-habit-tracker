import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  Platform,

} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

import {StorageService} from '../services/storageService';
import {RootStackParamList} from '../types';
import {
  getTodayString,
  formatDate
} from '../utils/helpers';

import { useThemedStyles } from '../hooks/useThemedStyles';
import { Theme } from '../contexts/ThemeContext';
import { SwipeableHabitItem } from '../components';

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

interface HabitWithStatus extends Habit {
  isCompletedToday: boolean;
  order?: number;
}

type HabitsScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const HabitsScreen: React.FC = () => {
  const navigation = useNavigation<HabitsScreenNavigationProp>();
  const [habits, setHabits] = useState<HabitWithStatus[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const styles = useThemedStyles(createStyles);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []),
  );

  useEffect(() => {
    if (currentUser) {
      loadHabits(currentUser.id);
    }
  }, [currentUser]);

  const loadData = async () => {
    try {
      const user = await StorageService.getCurrentUser();
      if (user) {
        setCurrentUser(user);
        await loadHabits(user.id);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadHabits = async (userId: string) => {
    try {
      const userHabits = await StorageService.getHabitsByUserId(userId);
      let savedOrder = await StorageService.getHabitOrder(userId);
      const allHabitIds = userHabits.map(h => h.id);
      const newHabitIds = allHabitIds.filter(id => !savedOrder.includes(id));

      if (newHabitIds.length > 0 || savedOrder.length === 0) {
        savedOrder = [...savedOrder, ...newHabitIds];
        savedOrder = savedOrder.filter(id => allHabitIds.includes(id));
        await StorageService.saveHabitOrder(userId, savedOrder);
      }

      const orderMap = savedOrder.reduce((map, id, index) => {
        map[id] = index;
        return map;
      }, {} as Record<string, number>);

      const todayString = getTodayString();
      const habitsWithStatus: HabitWithStatus[] = userHabits.map((habit: Habit) => {
        if (habit.frequency === 'daily') {
          const dateCompletion = habit.completions.find(c => c.date === todayString);
          return {
            ...habit,
            isCompletedToday: dateCompletion?.completed || false,
            order: orderMap[habit.id] ?? Number.MAX_SAFE_INTEGER,
          };
        } else {
          const today = new Date();
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());

          const weekDates: string[] = [];
          for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(weekStart.getDate() + i);
            weekDates.push(formatDate(date));
          }

          const isWeekFullyCompleted = weekDates.every(dateString => {
            const completion = habit.completions.find(c => c.date === dateString);
            return completion?.completed === true;
          });

          return {
            ...habit,
            isCompletedToday: isWeekFullyCompleted,
            order: orderMap[habit.id] ?? Number.MAX_SAFE_INTEGER,
          };
        }
      });

      const sortedHabits = [...habitsWithStatus].sort((a, b) => {
        return (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER);
      });

      setHabits(sortedHabits);
    } catch (error) {
      console.error('Error loading habits:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleDeleteHabit = async (habitId: string, habitName: string) => {
    Alert.alert(
      'Delete Habit',
      `Are you sure you want to delete "${habitName}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.deleteHabit(habitId);

              if (currentUser) {
                const currentOrder = await StorageService.getHabitOrder(currentUser.id);
                const updatedOrder = currentOrder.filter(id => id !== habitId);
                await StorageService.saveHabitOrder(currentUser.id, updatedOrder);
              }

              await loadData();

              Alert.alert('Success', 'Habit deleted successfully');
            } catch (error) {
              console.error('Error deleting habit:', error);
              Alert.alert('Error', 'Failed to delete habit');
            }
          },
        },
      ]
    );
  };

  const filteredHabits = habits;

  const getWeeklyProgress = (habit: HabitWithStatus): { completed: number; total: number; percentage: number } => {
    if (habit.frequency !== 'weekly') return { completed: 0, total: 7, percentage: 0 };

    const today = new Date();
    const currentWeekDates: string[] = [];

    // Get all 7 days of the current week (Sunday to Saturday)
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
      date.setDate(today.getDate() - dayOfWeek + i);
      currentWeekDates.push(formatDate(date));
    }

    // Count completed days in the current week
    const completedDays = currentWeekDates.filter(dateString => {
      const completion = habit.completions.find(c => c.date === dateString);
      return completion?.completed === true;
    }).length;

    // Ensure that when all 7 days are completed, we get exactly 100%
    const percentage = completedDays === 7 ? 100 : Math.round((completedDays / 7) * 100);

    return { completed: completedDays, total: 7, percentage };
  };

  const getHabitType = (habitName: string): 'water' | 'exercise' | 'abs' | 'vacuum' | 'walk' | 'reading' | 'default' => {
    const name = habitName.toLowerCase();
    if (name.includes('water')) return 'water';
    if (name.includes('exercise')) return 'exercise';
    if (name.includes('abs')) return 'abs';
    if (name.includes('vacuum')) return 'vacuum';
    if (name.includes('walk')) return 'walk';
    return 'reading';
  };

  const renderHabitItem = ({item}: {item: HabitWithStatus}) => {
    const isCompleted = item.isCompletedToday;
    const weeklyProgress = item.frequency === 'weekly' ? getWeeklyProgress(item) : undefined;

    const itemIcon = item.icon || (
      item.name.toLowerCase().includes('water') ? '💧' :
      item.name.toLowerCase().includes('exercise') ? '🙏' :
      item.name.toLowerCase().includes('abs') ? '💪' :
      item.name.toLowerCase().includes('vacuum') ? '😊' :
      item.name.toLowerCase().includes('walk') ? '🐕' : '📘'
    );

    const progressPercentage = item.frequency === 'weekly'
      ? (weeklyProgress ? `${weeklyProgress.percentage}%` : "0%")
      : (isCompleted ? "100%" : "0%");

    const trackingInfo = item.frequency === 'weekly'
      ? 'Tracked weekly'
      : 'Tracked daily';

    return (
      <SwipeableHabitItem
        name={item.name}
        isCompleted={isCompleted}
        icon={itemIcon}
        frequency={item.frequency}
        progressPercentage={progressPercentage}
        trackingInfo={trackingInfo}
        onPress={() => navigation.navigate('HabitDetail', { habitId: item.id })}
        goal={item.goal}
        weeklyProgress={weeklyProgress}
        habitType={getHabitType(item.name)}
        showProgressFill={true}
        onDelete={() => handleDeleteHabit(item.id, item.name)}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Your habits</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
              <Text style={styles.refreshButtonText}>↻</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.subtitle}>Track your daily progress</Text>
      </View>

      <View style={styles.statusHeader}>
        <Text style={styles.statusTitle}>Your Habits</Text>
      </View>

      {filteredHabits.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No habits found. Create your first habit!
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredHabits}
          renderItem={renderHabitItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          extraData={habits.map(h => h.isCompletedToday).join(',')} // Ensure rerender only when completion status changes
        />
      )}
    </View>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 10,
    paddingHorizontal: 20,
    backgroundColor: theme.surface,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
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

  refreshButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  refreshButtonText: {
    fontSize: 24,
    color: theme.primary,
    fontWeight: '300',
  },

  statusHeader: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 5,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.text,
  },

  completionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  completionIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  completionText: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  listContainer: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 100 : 80,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: 'center',
  },
});

export default HabitsScreen;
