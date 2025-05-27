import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Theme {

  background: string;
  surface: string;
  card: string;

  text: string;
  textSecondary: string;
  textTertiary: string;

  primary: string;
  primaryLight: string;
  primaryDark: string;

  success: string;
  warning: string;
  error: string;
  info: string;

  border: string;
  separator: string;

  buttonPrimary: string;
  buttonSecondary: string;
  buttonDanger: string;
  buttonText: string;
  buttonTextSecondary: string;

  habitCompleted: string;
  habitInProgress: string;
  habitFailed: string;

  habitWeeklyBorder: string;

  shadow: string;

  tabBarBackground: string;
  tabBarActive: string;
  tabBarInactive: string;
}

export const lightTheme: Theme = {
  background: '#f8f9fa',
  surface: '#ffffff',
  card: '#ffffff',

  text: '#1C1C1E',
  textSecondary: '#8E8E93',
  textTertiary: '#C7C7CC',

  primary: '#007AFF',
  primaryLight: '#E1F5FE',
  primaryDark: '#0056CC',

  success: '#34C759',
  warning: '#FF9F0A',
  error: '#FF453A',
  info: '#007AFF',

  border: '#E5E5EA',
  separator: '#F2F2F7',

  buttonPrimary: '#007AFF',
  buttonSecondary: '#E5E5EA',
  buttonDanger: '#FF3B30',
  buttonText: '#FFFFFF',
  buttonTextSecondary: '#1C1C1E',

  habitCompleted: '#E8F5E8',
  habitInProgress: '#F5F5F5',
  habitFailed: '#FFEBEE',

  habitWeeklyBorder: '#007AFF',

  shadow: '#000000',

  tabBarBackground: '#ffffff',
  tabBarActive: '#007AFF',
  tabBarInactive: '#8E8E93',
};

export const darkTheme: Theme = {
  background: '#000000',
  surface: '#1C1C1E',
  card: '#2C2C2E',

  text: '#FFFFFF',
  textSecondary: '#8E8E93',
  textTertiary: '#48484A',

  primary: '#0A84FF',
  primaryLight: '#1E3A8A',
  primaryDark: '#0066CC',

  success: '#30D158',
  warning: '#FF9F0A',
  error: '#FF453A',
  info: '#0A84FF',

  border: '#38383A',
  separator: '#2C2C2E',

  buttonPrimary: '#0A84FF',
  buttonSecondary: '#48484A',
  buttonDanger: '#FF453A',
  buttonText: '#FFFFFF',
  buttonTextSecondary: '#FFFFFF',

  habitCompleted: '#1E3A1E',
  habitInProgress: '#2C2C2E',
  habitFailed: '#3A1E1E',

  habitWeeklyBorder: '#0A84FF',

  shadow: '#000000',

  tabBarBackground: '#1C1C1E',
  tabBarActive: '#0A84FF',
  tabBarInactive: '#8E8E93',
};

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

const THEME_STORAGE_KEY = '@habit_tracker_theme';

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme !== null) {
        setIsDark(savedTheme === 'dark');
      } else {

        const systemColorScheme = Appearance.getColorScheme();
        setIsDark(systemColorScheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme:', error);

      const systemColorScheme = Appearance.getColorScheme();
      setIsDark(systemColorScheme === 'dark');
    }
  };

  const saveTheme = async (darkMode: boolean) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, darkMode ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    saveTheme(newIsDark);
  };

  const setTheme = (darkMode: boolean) => {
    setIsDark(darkMode);
    saveTheme(darkMode);
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
