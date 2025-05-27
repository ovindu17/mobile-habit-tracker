import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme, Theme } from '../contexts/ThemeContext';

export const useThemedStyles = <T extends StyleSheet.NamedStyles<T>>(
  createStyles: (theme: Theme) => T
): T => {
  const { theme } = useTheme();
  
  return useMemo(() => createStyles(theme), [theme, createStyles]);
};
