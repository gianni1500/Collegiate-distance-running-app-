import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { PreRunSetupScreen } from '../screens/PreRunSetupScreen';
import { ActiveRunScreen } from '../screens/ActiveRunScreen';
import { PostRunSummaryScreen } from '../screens/PostRunSummaryScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

export type MainTabParamList = {
  Home: undefined;
  History: undefined;
  Profile: undefined;
};

export type RunStackParamList = {
  MainTabs: undefined;
  PreRunSetup: undefined;
  ActiveRun: undefined;
  PostRunSummary: { runId: string };
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<RunStackParamList>();

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export function MainNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="PreRunSetup" component={PreRunSetupScreen} />
      <Stack.Screen name="ActiveRun" component={ActiveRunScreen} />
      <Stack.Screen name="PostRunSummary" component={PostRunSummaryScreen} />
    </Stack.Navigator>
  );
}
