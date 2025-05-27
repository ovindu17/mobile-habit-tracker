import React from 'react';
import { Platform, View, StyleSheet, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HabitsScreen from '../screens/HabitsScreen';
import CreateHabitScreen from '../screens/CreateHabitScreen';
import ProgressScreen from '../screens/ProgressScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { useTheme } from '../contexts/ThemeContext';
import { MainTabParamList } from '../types';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabNavigator: React.FC = () => {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => {
          let icon: string;
          let iconStyle: any;

          switch (route.name) {
            case 'Habits':
              icon = focused ? '✓' : '○';
              break;
            case 'CreateHabit':
              icon = '+';
              break;
            case 'Progress':
              icon = focused ? '▣' : '▢';
              break;
            case 'Profile':
              icon = focused ? '●' : '○';
              break;
            default:
              icon = '?';
          }

          iconStyle = {
            fontSize: 24,
            color: focused ? theme.tabBarActive : theme.tabBarInactive,
            fontWeight: '600',
            textAlign: 'center' as const,
          };

          return (
            <View style={styles.iconContainer}>
              <Text style={iconStyle}>{icon}</Text>
            </View>
          );
        },
        tabBarActiveTintColor: theme.tabBarActive,
        tabBarInactiveTintColor: theme.tabBarInactive,
        tabBarStyle: {
          backgroundColor: theme.tabBarBackground,
          borderTopWidth: 0,
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          paddingTop: 10,
          height: Platform.OS === 'ios' ? 85 : 65,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          shadowColor: theme.shadow,
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.1,
          shadowRadius: 5,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginTop: 2,
          marginBottom: Platform.OS === 'ios' ? 5 : 0,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Habits"
        component={HabitsScreen}
        options={{
          title: 'My Habits',
        }}
      />
      <Tab.Screen
        name="CreateHabit"
        component={CreateHabitScreen}
        options={{
          title: 'Add Habit',
        }}
      />
      <Tab.Screen
        name="Progress"
        component={ProgressScreen}
        options={{
          title: 'Progress',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 42,
    height: 42,
  },
});
