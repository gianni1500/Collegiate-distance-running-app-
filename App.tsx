import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { initAuthListener } from './src/services/authService';
import Constants from 'expo-constants';

// Initialize Mapbox token — skipped in Expo Go (native module not available)
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Mapbox = require('@rnmapbox/maps').default;
  Mapbox.setAccessToken(Constants.expoConfig?.extra?.mapboxAccessToken ?? '');
} catch {
  // Running in Expo Go — Mapbox native module not bundled
}

export default function App() {
  useEffect(() => {
    // Start Firebase auth state listener — keeps user logged in across restarts
    const unsubscribe = initAuthListener();
    return unsubscribe;
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
