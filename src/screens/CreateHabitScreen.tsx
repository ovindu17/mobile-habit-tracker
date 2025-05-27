import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {MainTabParamList} from '../types';
import {StorageService} from '../services/storageService';
import {generateId, getTodayString} from '../utils/helpers';
import { IconSelector } from '../components';
import { useTheme } from '../contexts/ThemeContext';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { Theme } from '../contexts/ThemeContext';

type CreateHabitScreenNavigationProp = BottomTabNavigationProp<
  MainTabParamList,
  'CreateHabit'
>;

interface Props {
  navigation: CreateHabitScreenNavigationProp;
}

const CreateHabitScreen: React.FC<Props> = ({navigation}) => {
  const [habitName, setHabitName] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
  const [loading, setLoading] = useState(false);
  const [habitGoal, setHabitGoal] = useState('');
  const [habitIcon, setHabitIcon] = useState('💧');
  const { theme } = useTheme();
  const styles = useThemedStyles(createStyles);

  const handleCreateHabit = async () => {
    if (!habitName.trim()) {
      Alert.alert('Error', 'Please enter a habit name');
      return;
    }

    setLoading(true);

    try {
      const currentUser = await StorageService.getCurrentUser();
      if (!currentUser) {
        Alert.alert('Error', 'User not found. Please log in again.');
        return;
      }

      const newHabit = {
        id: generateId(),
        userId: currentUser.id,
        name: habitName.trim(),
        frequency,
        createdAt: getTodayString(),
        completions: [],
        icon: habitIcon,
        goal: habitGoal.trim() || 'No goal',
      };

      await StorageService.saveHabit(newHabit);

      const habitOrder = await StorageService.getHabitOrder(currentUser.id);
      await StorageService.saveHabitOrder(currentUser.id, [...habitOrder, newHabit.id]);

      Alert.alert('Success', 'Habit created successfully!', [
        {
          text: 'OK',
          onPress: () => {
            setHabitName('');
            setHabitGoal('');
            setFrequency('daily');
            navigation.navigate('Habits');
          },
        },
      ]);
    } catch (error) {
      console.error('Error creating habit:', error);
      Alert.alert('Error', 'Failed to create habit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const iconOptions = ['💧', '🏃', '💪', '😊', '🐕', '📘', '🍎', '🧘', '💤', '🧹'];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Create new habit</Text>
          <Text style={styles.subtitle}>Define your new habit below</Text>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>What's your habit?</Text>
          <TextInput
            style={styles.input}
            placeholder="Name your habit..."
            placeholderTextColor="#8E8E93"
            value={habitName}
            onChangeText={setHabitName}
            autoCapitalize="sentences"
          />
        </View>

        <IconSelector
          selectedIcon={habitIcon}
          onIconSelect={setHabitIcon}
          icons={iconOptions}
          style={styles.formSection}
        />

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Goal (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="E.g., 2L of water, 10,000 steps..."
            placeholderTextColor="#8E8E93"
            value={habitGoal}
            onChangeText={setHabitGoal}
          />
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Frequency</Text>
          <View style={styles.frequencyOptions}>
            <TouchableOpacity
              style={[
                styles.frequencyOption,
                frequency === 'daily' && styles.selectedFrequency,
              ]}
              onPress={() => setFrequency('daily')}>
              <Text style={styles.frequencyIcon}>📆</Text>
              <Text
                style={[
                  styles.frequencyText,
                  frequency === 'daily' && styles.selectedFrequencyText,
                ]}>
                Daily
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.frequencyOption,
                frequency === 'weekly' && styles.selectedFrequency,
              ]}
              onPress={() => setFrequency('weekly')}>
              <Text style={styles.frequencyIcon}>📅</Text>
              <Text
                style={[
                  styles.frequencyText,
                  frequency === 'weekly' && styles.selectedFrequencyText,
                ]}>
                Weekly
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.frequencyDescription}>
            {frequency === 'daily'
              ? 'Daily habits are tracked separately for each day. You need to complete them every day for best results.'
              : 'Weekly habits only need to be completed once during the week. Great for less frequent activities.'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateHabit}
          disabled={loading || !habitName.trim()}>
          <Text style={styles.createButtonText}>
            {loading ? 'Creating...' : 'Create Habit'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 18,
    color: theme.textSecondary,
  },
  formSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 10,
  },
  input: {
    backgroundColor: theme.surface,
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: theme.border,
    color: theme.text,
  },

  frequencyOptions: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  frequencyOption: {
    flex: 1,
    padding: 16,
    paddingVertical: 20,
    borderRadius: 12,
    backgroundColor: theme.separator,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  selectedFrequency: {
    backgroundColor: theme.primary,
  },
  frequencyText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.text,
  },
  frequencyIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  selectedFrequencyText: {
    color: theme.buttonText,
  },
  frequencyDescription: {
    fontSize: 14,
    color: theme.textSecondary,
    marginTop: 10,
    fontStyle: 'italic',
    paddingHorizontal: 5,
  },
  createButton: {
    backgroundColor: theme.primary,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  createButtonText: {
    color: theme.buttonText,
    fontSize: 18,
    fontWeight: '600',
  },
});

export default CreateHabitScreen;
