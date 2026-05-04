import { useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { useRunStore } from '../store/useRunStore';
import { useAuthStore } from '../store/useAuthStore';
import { haversineDistance } from '../utils/haversine';
import { calcCurrentPace } from '../utils/paceCalculator';
import { startLiveSession, updateLiveLocation, endLiveSession } from '../services/liveTrackingService';
import { getUserProfile } from '../services/authService';

const LOCATION_OPTIONS: Location.LocationOptions = {
  accuracy: Location.Accuracy.BestForNavigation,
  distanceInterval: 5, // update every 5 meters
  timeInterval: 1000,  // or every 1 second
};

export function useGPSTracking() {
  const { session, updateSession } = useRunStore();
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const lastTimestampRef = useRef<number | null>(null);
  const lastDistanceRef = useRef<number>(0);
  const user = useAuthStore((s) => s.user);

  async function start() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Location permission not granted');
    }

    updateSession({ isRunning: true, startedAt: Date.now() });

    // Publish a live session document to Firestore so coaches can subscribe
    if (user) {
      const profile = await getUserProfile(user.uid);
      await startLiveSession(
        user.uid,
        profile?.displayName ?? user.displayName ?? 'Athlete',
        profile?.team ?? 'Unknown'
      );
    }

    subscriptionRef.current = await Location.watchPositionAsync(
      LOCATION_OPTIONS,
      (location) => {
        // Read current state, compute new values, then write atomically
        const state = useRunStore.getState();
        const newRoute = [...state.session.route, location];
        const coords = newRoute.map((l) => l.coords);

        // Accumulate distance
        let addedDistance = 0;
        if (coords.length >= 2) {
          const prev = coords[coords.length - 2];
          const curr = coords[coords.length - 1];
          addedDistance = haversineDistance(
            prev.latitude,
            prev.longitude,
            curr.latitude,
            curr.longitude
          );
        }
        const distanceMeters = state.session.distanceMeters + addedDistance;

        // Current pace: distance added over time window
        const now = location.timestamp;
        const windowSec = lastTimestampRef.current
          ? (now - lastTimestampRef.current) / 1000
          : 1;
        lastTimestampRef.current = now;

        const windowDist = distanceMeters - lastDistanceRef.current;
        lastDistanceRef.current = distanceMeters;
        const currentPaceSecPerMile = calcCurrentPace(windowDist, windowSec);

        // Elapsed time
        const startedAt = state.session.startedAt ?? now;
        const elapsedSeconds = Math.floor((now - startedAt) / 1000);

        // Update local store
        useRunStore.setState({
          session: {
            ...state.session,
            route: newRoute,
            distanceMeters,
            currentPaceSecPerMile,
            elapsedSeconds,
          },
        });

        // Push live location to Firestore (fire-and-forget; network errors are non-fatal)
        if (user) {
          updateLiveLocation(
            user.uid,
            {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              timestamp: location.timestamp,
            },
            { distanceMeters, elapsedSeconds, currentPaceSecPerMile }
          ).catch(() => {});
        }
      }
    );
  }

  function stop() {
    subscriptionRef.current?.remove();
    subscriptionRef.current = null;
    updateSession({ isRunning: false });

    // Mark the live session as finished in Firestore
    if (user) {
      endLiveSession(user.uid).catch(() => {});
    }
  }

  useEffect(() => {
    return () => {
      subscriptionRef.current?.remove();
    };
  }, []);

  return {
    route: session.route,
    distanceMeters: session.distanceMeters,
    currentPaceSecPerMile: session.currentPaceSecPerMile,
    elapsedSeconds: session.elapsedSeconds,
    isRunning: session.isRunning,
    start,
    stop,
  };
}
