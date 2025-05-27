import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { Theme } from '../contexts/ThemeContext';

interface WeeklyProgress {
  completed: number;
  total: number;
  percentage: number;
}

interface HabitItemProps {
  name: string;
  isCompleted: boolean;
  icon: string;
  frequency: 'daily' | 'weekly';
  progressPercentage?: string;
  trackingInfo?: string;
  style?: ViewStyle;
  onPress: () => void;
  goal?: string;
  weeklyProgress?: WeeklyProgress;
  habitType?: 'water' | 'exercise' | 'abs' | 'vacuum' | 'walk' | 'reading' | 'default';
  showProgressFill?: boolean;
}

const HabitItem: React.FC<HabitItemProps> = ({
  name,
  isCompleted,
  icon,
  frequency,
  progressPercentage = '0%',
  trackingInfo,
  style,
  onPress,
  goal,
  weeklyProgress,
  habitType = 'default',
  showProgressFill = true,
}) => {
  const { theme } = useTheme();
  const styles = useThemedStyles(createStyles);
  const isWeekly = frequency === 'weekly';

  const frequencyText = isWeekly ? '(Weekly habit)' : '';
  const trackingInfoText = trackingInfo || (isWeekly ? 'Tracked weekly' : 'Tracked daily');

  const getBgColorStyle = () => {
    if (isCompleted) {
      const completedStyles = {
        water: isWeekly ? styles.waterWeeklyCompletedItem : styles.waterCompletedItem,
        exercise: isWeekly ? styles.exerciseWeeklyCompletedItem : styles.exerciseCompletedItem,
        abs: isWeekly ? styles.absWeeklyCompletedItem : styles.absCompletedItem,
        vacuum: isWeekly ? styles.vacuumWeeklyCompletedItem : styles.vacuumCompletedItem,
        walk: isWeekly ? styles.walkWeeklyCompletedItem : styles.walkCompletedItem,
        reading: isWeekly ? styles.readingWeeklyCompletedItem : styles.readingCompletedItem,
        default: isWeekly ? styles.readingWeeklyCompletedItem : styles.readingCompletedItem,
      };
      return completedStyles[habitType];
    } else if (habitType === 'walk') {
      return isWeekly ? styles.failedWeeklyItem : styles.failedItem;
    } else {
      return isWeekly ? styles.inProgressWeeklyItem : styles.inProgressItem;
    }
  };

  const renderStatusContent = () => {
    if (isCompleted) {
      return (
        <View style={styles.statusIndicator}>
          <Text style={styles.completedText}>
            {frequency === 'weekly' ? 'Week Completed' : 'Completed'}
          </Text>
          <Text style={styles.checkmark}>✓</Text>
          <Text style={styles.trackingText}>{trackingInfoText}</Text>
        </View>
      );
    } else if (frequency === 'weekly' && weeklyProgress && weeklyProgress.completed > 0) {
      return (
        <View style={styles.statusIndicator}>
          <Text style={styles.habitGoal}>
            In Progress ({weeklyProgress.completed}/7 days)
          </Text>
          <Text style={styles.trackingText}>{trackingInfoText}</Text>
        </View>
      );
    } else if (habitType === 'walk') {
      return (
        <View style={styles.statusIndicator}>
          <Text style={styles.failedText}>Failed</Text>
          <Text style={styles.failMark}>✕</Text>
          <Text style={styles.trackingText}>{trackingInfoText}</Text>
        </View>
      );
    } else {
      return (
        <View style={styles.statusIndicator}>
          <Text style={styles.habitGoal}>
            Goal: {goal || 'No goal'}
          </Text>
          <Text style={styles.trackingText}>{trackingInfoText}</Text>
        </View>
      );
    }
  };

  return (
    <TouchableOpacity
      style={[styles.habitItem, getBgColorStyle(), style]}
      onPress={onPress}
    >
      {frequency === 'weekly' && weeklyProgress && weeklyProgress.percentage > 0 && showProgressFill && (
        <View
          style={[
            styles.weeklyProgressFill,
            weeklyProgress.percentage === 100 ? {
              left: 0,
              right: 0,
              width: undefined,
              borderTopRightRadius: 16,
              borderBottomRightRadius: 16,
              backgroundColor: `${theme.primary}20`,
            } : {
              width: `${weeklyProgress.percentage}%`,
              backgroundColor: `${theme.primary}20`,
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
            }
          ]}
        />
      )}

      <View style={styles.habitContentContainer}>
        <View style={styles.habitIconContainer}>
          <Text style={styles.habitIcon}>{icon}</Text>
        </View>
        <View style={styles.habitInfo}>
          <View style={styles.habitNameRow}>
            <Text style={styles.habitName}>{name}</Text>
            <Text style={styles.frequencyIndicator}>{frequencyText}</Text>
          </View>
          {renderStatusContent()}
        </View>
        <View style={styles.percentageContainer}>
          <Text style={styles.percentageText}>{progressPercentage}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  habitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  habitContentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    zIndex: 2,
  },
  waterCompletedItem: {
    backgroundColor: theme.habitCompleted,
  },
  exerciseCompletedItem: {
    backgroundColor: theme.habitCompleted,
  },
  absCompletedItem: {
    backgroundColor: theme.habitCompleted,
  },
  vacuumCompletedItem: {
    backgroundColor: theme.habitCompleted,
  },
  walkCompletedItem: {
    backgroundColor: theme.habitCompleted,
  },
  readingCompletedItem: {
    backgroundColor: theme.habitCompleted,
  },
  waterWeeklyCompletedItem: {
    backgroundColor: theme.habitCompleted,
    borderLeftWidth: 5,
    borderLeftColor: theme.habitWeeklyBorder,
  },
  exerciseWeeklyCompletedItem: {
    backgroundColor: theme.habitCompleted,
    borderLeftWidth: 5,
    borderLeftColor: theme.habitWeeklyBorder,
  },
  absWeeklyCompletedItem: {
    backgroundColor: theme.habitCompleted,
    borderLeftWidth: 5,
    borderLeftColor: theme.habitWeeklyBorder,
  },
  vacuumWeeklyCompletedItem: {
    backgroundColor: theme.habitCompleted,
    borderLeftWidth: 5,
    borderLeftColor: theme.habitWeeklyBorder,
  },
  walkWeeklyCompletedItem: {
    backgroundColor: theme.habitCompleted,
    borderLeftWidth: 5,
    borderLeftColor: theme.habitWeeklyBorder,
  },
  readingWeeklyCompletedItem: {
    backgroundColor: theme.habitCompleted,
    borderLeftWidth: 5,
    borderLeftColor: theme.habitWeeklyBorder,
  },
  inProgressItem: {
    backgroundColor: theme.habitInProgress,
  },
  inProgressWeeklyItem: {
    backgroundColor: theme.habitInProgress,
    borderLeftWidth: 5,
    borderLeftColor: theme.textSecondary,
  },
  failedItem: {
    backgroundColor: theme.habitFailed,
  },
  failedWeeklyItem: {
    backgroundColor: theme.habitFailed,
    borderLeftWidth: 5,
    borderLeftColor: theme.error,
  },
  habitIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  habitIcon: {
    fontSize: 22,
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 2,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedText: {
    fontSize: 14,
    color: theme.success,
    marginRight: 4,
  },
  checkmark: {
    fontSize: 14,
    color: theme.success,
    fontWeight: 'bold',
  },
  failedText: {
    fontSize: 14,
    color: theme.error,
    marginRight: 4,
  },
  failMark: {
    fontSize: 14,
    color: theme.error,
    fontWeight: 'bold',
  },
  habitGoal: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  percentageContainer: {
    minWidth: 50,
    alignItems: 'flex-end',
  },
  percentageText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
  },
  frequencyIndicator: {
    fontSize: 12,
    color: theme.textSecondary,
    marginLeft: 4,
  },
  habitNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  trackingText: {
    fontSize: 11,
    color: theme.textSecondary,
    marginLeft: 8,
    fontStyle: 'italic',
  },
  weeklyProgressFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    zIndex: 1,
  },
});

export default HabitItem;