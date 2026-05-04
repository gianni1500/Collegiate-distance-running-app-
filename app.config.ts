import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Collegiate Runner',
  slug: 'collegiate-distance-running-app',
  owner: 'gianni800s-organization',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#1a1a2e',
  },
  extra: {
    mapboxAccessToken: process.env.MAPBOX_ACCESS_TOKEN ?? '',
    eas: {
      projectId: 'c3e2a54e-57e2-4985-b1db-78e27adee1f9',
    },
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.henrygianni.collegiaterunner',
    infoPlist: {
      NSLocationWhenInUseUsageDescription:
        'This app tracks your GPS location during runs to measure pace and distance.',
      NSLocationAlwaysAndWhenInUseUsageDescription:
        'This app uses background location to keep tracking your run when the screen is off.',
      NSMotionUsageDescription:
        'Motion data helps improve pace accuracy.',
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#1a1a2e',
    },
    package: 'com.henrygianni.collegiaterunner',
    permissions: [
      'ACCESS_FINE_LOCATION',
      'ACCESS_COARSE_LOCATION',
      'ACCESS_BACKGROUND_LOCATION',
      'FOREGROUND_SERVICE',
    ],
  },
  plugins: [
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission:
          'Allow Collegiate Runner to use your location for GPS run tracking.',
      },
    ],
    '@rnmapbox/maps',
  ],
});
