export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
}

export interface Habit {
  id: string;
  userId: string;
  name: string;
  frequency: 'daily' | 'weekly';
  createdAt: string;
  completions: HabitCompletion[];
  icon?: string;
  goal?: string;
}

export interface HabitCompletion {
  date: string;
  completed: boolean;
}

export interface HabitWithStatus extends Habit {
  isCompletedToday: boolean;
  completionRate: number;
}

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  MainTabs: undefined;
  HabitDetail: { habitId: string };
};

export type MainTabParamList = {
  Habits: undefined;
  CreateHabit: undefined;
  Progress: undefined;
  Profile: undefined;
};
