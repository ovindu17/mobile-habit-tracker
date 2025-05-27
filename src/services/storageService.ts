import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  CURRENT_USER: 'current_user',
  USERS: 'users',
  HABITS: 'habits',
  HABIT_ORDER: 'habit_order',
};

export class StorageService {

  static async saveCurrentUser(user: any): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving current user:', error);
      throw error;
    }
  }

  static async getCurrentUser(): Promise<any | null> {
    try {
      const userString = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return userString ? JSON.parse(userString) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  static async saveUser(user: any): Promise<void> {
    try {
      const existingUsers = await this.getUsers();
      const updatedUsers = [...existingUsers.filter((u: any) => u.id !== user.id), user];
      await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  }

  static async getUsers(): Promise<any[]> {
    try {
      const usersString = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
      return usersString ? JSON.parse(usersString) : [];
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  }


  static async saveHabit(habit: any): Promise<void> {
    try {
      const existingHabits = await this.getHabits();
      const updatedHabits = [...existingHabits.filter((h: any) => h.id !== habit.id), habit];
      await AsyncStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(updatedHabits));
    } catch (error) {
      console.error('Error saving habit:', error);
      throw error;
    }
  }

  static async getHabits(): Promise<any[]> {
    try {
      const habitsString = await AsyncStorage.getItem(STORAGE_KEYS.HABITS);
      return habitsString ? JSON.parse(habitsString) : [];
    } catch (error) {
      console.error('Error getting habits:', error);
      return [];
    }
  }

  static async getHabitsByUserId(userId: string): Promise<any[]> {
    try {
      const allHabits = await this.getHabits();
      return allHabits.filter((habit: any) => habit.userId === userId);
    } catch (error) {
      console.error('Error getting habits by user ID:', error);
      return [];
    }
  }

  static async getUserHabits(userId: string): Promise<any[]> {
    try {
      const allHabits = await this.getHabits();
      return allHabits.filter((habit: any) => habit.userId === userId);
    } catch (error) {
      console.error('Error getting user habits:', error);
      return [];
    }
  }

  static async deleteHabit(habitId: string): Promise<void> {
    try {
      const allHabits = await this.getHabits();
      const filteredHabits = allHabits.filter((habit: any) => habit.id !== habitId);
      await AsyncStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(filteredHabits));
    } catch (error) {
      console.error('Error deleting habit:', error);
      throw error;
    }
  }

  static async clearCurrentUser(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    } catch (error) {
      console.error('Error clearing current user:', error);
      throw error;
    }
  }


  static async saveHabitOrder(userId: string, habitIds: string[]): Promise<void> {
    try {
      const key = `${STORAGE_KEYS.HABIT_ORDER}_${userId}`;
      await AsyncStorage.setItem(key, JSON.stringify(habitIds));
    } catch (error) {
      console.error('Error saving habit order:', error);
      throw error;
    }
  }

  static async getHabitOrder(userId: string): Promise<string[]> {
    try {
      const key = `${STORAGE_KEYS.HABIT_ORDER}_${userId}`;
      const orderString = await AsyncStorage.getItem(key);
      return orderString ? JSON.parse(orderString) : [];
    } catch (error) {
      console.error('Error getting habit order:', error);
      return [];
    }
  }

  static async clearUserHabits(userId: string): Promise<void> {
    try {
      const allHabits = await this.getHabits();
      const filteredHabits = allHabits.filter((habit: any) => habit.userId !== userId);
      await AsyncStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(filteredHabits));


      const key = `${STORAGE_KEYS.HABIT_ORDER}_${userId}`;
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error clearing user habits:', error);
      throw error;
    }
  }

  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  }
}
