import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { View, Text } from 'react-native';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Workouts: undefined;
  Exercises: undefined;
  Plans: undefined;
  Progress: undefined;
  Nutrition: undefined;
  Cardio: undefined;
  Profile: undefined;
  Settings: undefined;
  ActiveWorkout: { planId?: string; dayId?: string };
  WorkoutHistory: undefined;
  WorkoutDetail: { id: string };
  PlanDetail: { id: string };
  PlanBuilder: { planId?: string };
  ExerciseDetail: { id: string };
  ExerciseLibrary: { muscleGroup?: string };
  CardioActive: { type?: string };
  ProgressDetail: { id?: string };
  NutritionDetail: { date?: string };
  SettingsGeneral: undefined;
  SettingsNotifications: undefined;
  SettingsPrivacy: undefined;
  SettingsUnits: undefined;
  SettingsTheme: undefined;
  SettingsBackup: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Workouts: undefined;
  Exercises: undefined;
  Plans: undefined;
  Progress: undefined;
  Nutrition: undefined;
  Cardio: undefined;
  Profile: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type WorkoutStackParamList = {
  ActiveWorkout: { planId?: string; dayId?: string };
  WorkoutHistory: undefined;
  WorkoutDetail: { id: string };
};

export type PlanStackParamList = {
  PlanDetail: { id: string };
  PlanBuilder: { planId?: string };
};

export type ExerciseStackParamList = {
  ExerciseDetail: { id: string };
  ExerciseLibrary: { muscleGroup?: string };
};

export type CardioStackParamList = {
  CardioActive: { type?: string };
};

export type ProgressStackParamList = {
  ProgressDetail: { id?: string };
};

export type NutritionStackParamList = {
  NutritionDetail: { date?: string };
};

export type SettingsStackParamList = {
  SettingsGeneral: undefined;
  SettingsNotifications: undefined;
  SettingsPrivacy: undefined;
  SettingsUnits: undefined;
  SettingsTheme: undefined;
  SettingsBackup: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Auth" component={AuthStack} />
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="ActiveWorkout" component={require('../screens/workout/ActiveWorkoutScreen').ActiveWorkoutScreen} />
      <Stack.Screen name="WorkoutHistory" component={require('../screens/workout/WorkoutHistoryScreen').WorkoutHistoryScreen} />
      <Stack.Screen name="WorkoutDetail" component={require('../screens/workout/WorkoutDetailScreen').WorkoutDetailScreen} />
      <Stack.Screen name="PlanDetail" component={require('../screens/plan/PlanDetailScreen').PlanDetailScreen} />
      <Stack.Screen name="PlanBuilder" component={require('../screens/plan/PlanBuilderScreen').PlanBuilderScreen} />
      <Stack.Screen name="ExerciseDetail" component={require('../screens/exercise/ExerciseDetailScreen').ExerciseDetailScreen} />
      <Stack.Screen name="ExerciseLibrary" component={require('../screens/exercise/ExerciseLibraryScreen').ExerciseLibraryScreen} />
      <Stack.Screen name="CardioActive" component={require('../screens/cardio/CardioActiveScreen').CardioActiveScreen} />
      <Stack.Screen name="ProgressDetail" component={require('../screens/progress/ProgressDetailScreen').ProgressDetailScreen} />
      <Stack.Screen name="NutritionDetail" component={require('../screens/nutrition/NutritionDetailScreen').NutritionDetailScreen} />
      <Stack.Screen name="Settings" component={require('../screens/SettingsScreen').SettingsScreen} />
      <Stack.Screen name="SettingsGeneral" component={require('../screens/settings/SettingsGeneralScreen').SettingsGeneralScreen} />
      <Stack.Screen name="SettingsNotifications" component={require('../screens/settings/SettingsNotificationsScreen').SettingsNotificationsScreen} />
      <Stack.Screen name="SettingsPrivacy" component={require('../screens/settings/SettingsPrivacyScreen').SettingsPrivacyScreen} />
      <Stack.Screen name="SettingsUnits" component={require('../screens/settings/SettingsUnitsScreen').SettingsUnitsScreen} />
      <Stack.Screen name="SettingsTheme" component={require('../screens/settings/SettingsThemeScreen').SettingsThemeScreen} />
      <Stack.Screen name="SettingsBackup" component={require('../screens/settings/SettingsBackupScreen').SettingsBackupScreen} />
    </Stack.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={require('../screens/auth/LoginScreen').LoginScreen} />
      <Stack.Screen name="Register" component={require('../screens/auth/RegisterScreen').RegisterScreen} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E2E8F0',
          height: 64,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={require('../screens/HomeScreen').HomeScreen}
        options={{
          title: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="home" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Workouts"
        component={require('../screens/WorkoutsScreen').WorkoutsScreen}
        options={{
          title: 'Workouts',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="dumbbell" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Exercises"
        component={require('../screens/ExercisesScreen').ExercisesScreen}
        options={{
          title: 'Exercises',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="book-open" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Plans"
        component={require('../screens/PlansScreen').PlansScreen}
        options={{
          title: 'Plans',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="calendar" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Progress"
        component={require('../screens/ProgressScreen').ProgressScreen}
        options={{
          title: 'Progress',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="trending-up" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Nutrition"
        component={require('../screens/NutritionScreen').NutritionScreen}
        options={{
          title: 'Nutrition',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="apple" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Cardio"
        component={require('../screens/CardioScreen').CardioScreen}
        options={{
          title: 'Cardio',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="heart" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={require('../screens/ProfileScreen').ProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="user" focused={focused} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function TabIcon({ name, focused, color }: { name: string; focused: boolean; color: string }) {
  return (
    <View
      style={{
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text style={{ fontSize: 20, color }}>{getIconForName(name)}</Text>
    </View>
  );
}

function getIconForName(name: string): string {
  const icons: Record<string, string> = {
    home: '🏠',
    dumbbell: '💪',
    'book-open': '📖',
    calendar: '📅',
    'trending-up': '📈',
    apple: '🍎',
    heart: '❤️',
    user: '👤',
  };
  return icons[name] || '❓';
}