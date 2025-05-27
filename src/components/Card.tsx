import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { Theme } from '../contexts/ThemeContext';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

const Card: React.FC<CardProps> = ({ children, style }) => {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  card: {
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: theme.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default Card;