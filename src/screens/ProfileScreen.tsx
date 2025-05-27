import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { StackNavigationProp } from '@react-navigation/stack';
import { StorageService } from '../services/storageService';
import { User } from '../types';
import { Section, SettingItem, StatsCard } from '../components';
import { useTheme } from '../contexts/ThemeContext';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { Theme } from '../contexts/ThemeContext';

interface ProfileScreenProps {
  navigation: StackNavigationProp<any>;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const [user, setUser] = useState<User | null>(null);
  const [totalHabits, setTotalHabits] = useState(0);
  const [completedToday, setCompletedToday] = useState(0);
  const { theme, isDark, toggleTheme } = useTheme();
  const styles = useThemedStyles(createStyles);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const currentUser = await StorageService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        const habits = await StorageService.getUserHabits(currentUser.id);
        setTotalHabits(habits.length);

        const today = new Date().toISOString().split('T')[0];
        const completedHabits = habits.filter(habit =>
          habit.completions.some((completion: any) =>
            completion.date === today && completion.completed
          )
        );
        setCompletedToday(completedHabits.length);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.clearCurrentUser();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error('Error logging out:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all your habits and progress. This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            try {
              if (user) {
                await StorageService.clearUserHabits(user.id);
                setTotalHabits(0);
                setCompletedToday(0);
                Alert.alert('Success', 'All habit data has been cleared.');
              }
            } catch (error) {
              console.error('Error clearing data:', error);
              Alert.alert('Error', 'Failed to clear data. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleEditProfile = () => {
    Alert.alert(
      'Edit Profile',
      'This feature is coming soon!',
      [{ text: 'OK' }]
    );
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerContainer}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0) || '?'}</Text>
          </View>
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email || ''}</Text>
        </View>

        <View style={styles.statsContainer}>
          <StatsCard
            icon="📊"
            value={totalHabits}
            label="Total Habits"
            style={styles.statsCard}
          />
          <StatsCard
            icon="✅"
            value={completedToday}
            label="Completed Today"
            style={styles.statsCard}
          />
        </View>


        <Section title="Settings">
          <SettingItem
            icon={isDark ? '🌙' : '☀️'}
            label="Dark Mode"
            action={isDark ? 'On' : 'Off'}
            onPress={toggleTheme}
          />
          <SettingItem
            icon="🗑️"
            label="Clear All Habit Data"
            action="Clear"
            onPress={handleClearData}
            actionStyle={{color: theme.error}}
            isLast={true}
          />
        </Section>


        <Section title="Account">
          <SettingItem
            icon="👤"
            label="Edit Profile"
            action="Edit"
            onPress={handleEditProfile}
          />
          <SettingItem
            icon="🚪"
            label="Logout"
            action="→"
            onPress={handleLogout}
            isLast={true}
            labelStyle={{color: theme.error}}
            actionStyle={{color: theme.error}}
          />
        </Section>


      </ScrollView>
    </View>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollContent: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: Platform.OS === 'ios' ? 100 : 80,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 20,
    shadowColor: theme.shadow,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: theme.buttonText,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: theme.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statsCard: {
    flex: 1,
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: theme.shadow,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.background,
  },
  loadingText: {
    fontSize: 16,
    color: theme.textSecondary,
    marginTop: 10,
  },
});

export default ProfileScreen;
