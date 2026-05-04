import React from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';

export function AppNavigator() {
  const user = useAuthStore((state) => state.user);

  return user ? <MainNavigator /> : <AuthNavigator />;
}
