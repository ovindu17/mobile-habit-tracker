import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { Theme } from '../contexts/ThemeContext';

interface HeaderTitleProps {
  title: string;
  subtitle?: string;
  style?: ViewStyle;
}

const HeaderTitle: React.FC<HeaderTitleProps> = ({ title, subtitle, style }) => {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: 'center',
  },
});

export default HeaderTitle;