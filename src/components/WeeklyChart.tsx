import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { Theme } from '../contexts/ThemeContext';

interface WeeklyData {
  date: string;
  dailyCompleted: number;
  dailyTotal: number;
  weeklyCompleted: number; // Integer count of weekly habits completed on this specific date
  weeklyTotal: number;
  overallPercentage: number;
}

interface WeeklyChartProps {
  title: string;
  data: WeeklyData[];
  style?: ViewStyle;
}

const WeeklyChart: React.FC<WeeklyChartProps> = ({
  title,
  data,
  style
}) => {
  const { theme } = useTheme();
  const styles = useThemedStyles(createStyles);

  const formatWeekDay = (dateString: string): string => {
    const date = new Date(dateString);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  };

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 100) return theme.success;
    if (percentage >= 75) return theme.primary;
    if (percentage >= 50) return '#FFA500'; // Orange
    if (percentage >= 25) return '#FFD700'; // Gold
    return theme.error;
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>Daily habits and weekly habit days completed</Text>
      <View style={styles.chartContainer}>
        {data.map((day, index) => {
          const totalHabits = day.dailyTotal + day.weeklyTotal;
          const totalCompleted = day.dailyCompleted + day.weeklyCompleted;

          return (
            <View key={day.date} style={styles.dayContainer}>
              <Text style={styles.dayLabel}>{formatWeekDay(day.date)}</Text>
              <View style={styles.dayBar}>
                <View style={styles.dayBarBackground}>
                  <View
                    style={[
                      styles.dayBarFill,
                      {
                        height: totalHabits > 0 ? `${day.overallPercentage}%` : '0%',
                        backgroundColor: totalHabits > 0 ? getProgressColor(day.overallPercentage) : theme.separator
                      }
                    ]}
                  />
                </View>
              </View>
              <Text style={styles.dayNumbers}>
                {totalCompleted}/{totalHabits}
              </Text>
              <Text style={styles.percentageText}>
                {day.overallPercentage}%
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 20,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  dayLabel: {
    fontSize: 12,
    color: theme.textSecondary,
    marginBottom: 8,
    fontWeight: '500',
  },
  dayBar: {
    height: 80,
    width: 20,
    justifyContent: 'flex-end',
  },
  dayBarBackground: {
    flex: 1,
    backgroundColor: theme.separator,
    borderRadius: 10,
    justifyContent: 'flex-end',
  },
  dayBarFill: {
    width: '100%',
    borderRadius: 10,
  },
  dayNumbers: {
    fontSize: 10,
    color: theme.textSecondary,
    marginTop: 4,
    fontWeight: '500',
  },
  percentageText: {
    fontSize: 9,
    color: theme.textSecondary,
    marginTop: 2,
    fontWeight: '600',
  },
});

export default WeeklyChart;