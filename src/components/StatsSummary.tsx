import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { getProgressColor } from '../utils/helpers';
import { useTheme } from '../contexts/ThemeContext';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { Theme } from '../contexts/ThemeContext';

interface StatsSummaryProps {
  title: string;
  completed: number;
  total: number;
  completionRate: number;
  note?: string;
  style?: ViewStyle;
}

const StatsSummary: React.FC<StatsSummaryProps> = ({
  title,
  completed,
  total,
  completionRate,
  note,
  style
}) => {
  const { isDark } = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{completed}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{total}</Text>
          <Text style={styles.statLabel}>Total Habits</Text>
        </View>
        <View style={styles.statItem}>
          <Text
            style={[
              styles.statNumber,
              { color: getProgressColor(completionRate, isDark) }
            ]}
          >
            {completionRate}%
          </Text>
          <Text style={styles.statLabel}>Success Rate</Text>
        </View>
      </View>

      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${completionRate}%`,
                backgroundColor: getProgressColor(completionRate, isDark)
              }
            ]}
          />
        </View>
      </View>

      {note && (
        <Text style={styles.note}>{note}</Text>
      )}
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
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.text,
  },
  statLabel: {
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
  note: {
    fontSize: 12,
    color: theme.textSecondary,
    marginTop: 10,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default StatsSummary;