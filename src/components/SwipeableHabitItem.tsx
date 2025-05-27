import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import HabitItem from './HabitItem';
import { useTheme } from '../contexts/ThemeContext';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { Theme } from '../contexts/ThemeContext';

interface WeeklyProgress {
  completed: number;
  total: number;
  percentage: number;
}

interface SwipeableHabitItemProps {
  name: string;
  isCompleted: boolean;
  icon: string;
  frequency: 'daily' | 'weekly';
  progressPercentage?: string;
  trackingInfo?: string;
  onPress: () => void;
  goal?: string;
  weeklyProgress?: WeeklyProgress;
  habitType?: 'water' | 'exercise' | 'abs' | 'vacuum' | 'walk' | 'reading' | 'default';
  showProgressFill?: boolean;
  onDelete?: () => void;
  habitName?: string;
}

const SwipeableHabitItem: React.FC<SwipeableHabitItemProps> = ({
  name,
  isCompleted,
  icon,
  frequency,
  progressPercentage,
  trackingInfo,
  onPress,
  goal,
  weeklyProgress,
  habitType,
  showProgressFill,
  onDelete,
  habitName,
}) => {
  const { theme } = useTheme();
  const styles = useThemedStyles(createStyles);

  const renderRightAction = () => {
    if (!onDelete) return null;
    
    return (
      <TouchableOpacity
        style={styles.deleteAction}
        onPress={onDelete}
      >
        <Text style={styles.deleteActionText}>Delete</Text>
      </TouchableOpacity>
    );
  };

  return (
    <Swipeable
      renderRightActions={renderRightAction}
      rightThreshold={40}
    >
      <HabitItem
        name={name}
        isCompleted={isCompleted}
        icon={icon}
        frequency={frequency}
        progressPercentage={progressPercentage}
        trackingInfo={trackingInfo}
        onPress={onPress}
        goal={goal}
        weeklyProgress={weeklyProgress}
        habitType={habitType}
        showProgressFill={showProgressFill}
      />
    </Swipeable>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  deleteAction: {
    backgroundColor: theme.error,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    marginBottom: 12,
    borderRadius: 16,
    marginLeft: 8,
  },
  deleteActionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SwipeableHabitItem;
