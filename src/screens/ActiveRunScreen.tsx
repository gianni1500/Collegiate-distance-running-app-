import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';

// Mapbox is not available in Expo Go — load conditionally
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let MapboxGL: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  MapboxGL = require('@rnmapbox/maps').default;
} catch {
  // Expo Go environment
}
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RunStackParamList } from '../navigation/MainNavigator';
import { useRunSession } from '../hooks/useRunSession';
import { useMotivation } from '../hooks/useMotivation';
import { formatPace, formatElapsed, formatDistance, formatPaceDelta } from '../utils/formatters';
import { getPaceDelta } from '../utils/paceCalculator';
import { useRunStore } from '../store/useRunStore';
import { saveRun, updatePersonalBest } from '../services/authService';
import { useAuthStore } from '../store/useAuthStore';

type Props = {
  navigation: NativeStackNavigationProp<RunStackParamList, 'ActiveRun'>;
};

const MAP_STYLES = MapboxGL ? [
  { label: 'Outdoors',  url: MapboxGL.StyleURL.Outdoors },
  { label: 'Streets',   url: MapboxGL.StyleURL.Street },
  { label: 'Satellite', url: MapboxGL.StyleURL.SatelliteStreet },
] : [{ label: 'Map', url: '' }];

export function ActiveRunScreen({ navigation }: Props) {
  const user = useAuthStore((state) => state.user);
  const units = useRunStore((state) => state.units);
  const [styleIndex, setStyleIndex] = useState(0);

  function cycleMapType() {
    setStyleIndex((i) => (i + 1) % MAP_STYLES.length);
  }

  const {
    config,
    session,
    targetPaceSecPerMile,
    targetPaceDisplay,
    startRun,
    endRun,
    elapsedSeconds,
    distanceMeters,
    currentPaceSecPerMile,
    route,
    isRunning,
  } = useRunSession();

  useMotivation({
    config: config!,
    distanceMeters,
    currentPaceSecPerMile,
    elapsedSeconds,
    isRunning,
  });

  useEffect(() => {
    startRun().catch((err) => {
      Alert.alert('GPS Error', err.message);
      navigation.goBack();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const paceDelta = getPaceDelta(currentPaceSecPerMile, targetPaceSecPerMile);
  const coords = route.map((l) => ({
    latitude: l.coords.latitude,
    longitude: l.coords.longitude,
  }));
  const startCoord = coords[0];

  const routeGeoJSON = {
    type: 'Feature' as const,
    geometry: {
      type: 'LineString' as const,
      coordinates: coords.map((c) => [c.longitude, c.latitude]),
    },
    properties: {},
  };

  async function handleFinish() {
    endRun();
    if (!user || !config) return;

    const finishedAt = Date.now();
    const startedAt = session.startedAt ?? finishedAt;
    const avgPace = elapsedSeconds > 0
      ? (elapsedSeconds / (distanceMeters / 1609.344))
      : 0;
    const goalAchieved = elapsedSeconds <= config.goalSeconds;

    const isPersonalBest = await updatePersonalBest(
      user.uid,
      config.distanceMeters,
      elapsedSeconds
    );

    const runId = await saveRun({
      uid: user.uid,
      startedAt,
      finishedAt,
      distanceMeters,
      elapsedSeconds,
      targetPaceSecPerMile,
      averagePaceSecPerMile: avgPace,
      route: coords.map((c, i) => ({
        ...c,
        timestamp: route[i]?.timestamp ?? finishedAt,
      })),
      goalAchieved,
      isPersonalBest,
    });

    navigation.replace('PostRunSummary', { runId });
  }

  return (
    <View style={styles.container}>
      {MapboxGL ? (
        <MapboxGL.MapView
          style={styles.map}
          styleURL={MAP_STYLES[styleIndex].url}
          logoEnabled={false}
          attributionEnabled
          scaleBarEnabled
          compassEnabled
          compassViewPosition={0}
        >
          <MapboxGL.Camera
            followUserLocation
            followZoomLevel={16}
            followUserMode="course"
            animationMode="flyTo"
            animationDuration={500}
          />
          <MapboxGL.UserLocation visible showsUserHeadingIndicator />
          {coords.length > 1 && (
            <MapboxGL.ShapeSource id="routeSource" shape={routeGeoJSON}>
              <MapboxGL.LineLayer
                id="routeGlow"
                style={{ lineColor: 'rgba(233,69,96,0.3)', lineWidth: 12, lineCap: 'round', lineJoin: 'round' }}
              />
              <MapboxGL.LineLayer
                id="routeLine"
                style={{ lineColor: '#e94560', lineWidth: 5, lineCap: 'round', lineJoin: 'round' }}
              />
            </MapboxGL.ShapeSource>
          )}
          {startCoord && (
            <MapboxGL.PointAnnotation
              id="startMarker"
              coordinate={[startCoord.longitude, startCoord.latitude]}
            >
              <View style={styles.startDot} />
            </MapboxGL.PointAnnotation>
          )}
        </MapboxGL.MapView>
      ) : (
        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapPlaceholderText}>Live Map</Text>
          <Text style={styles.mapPlaceholderSub}>
            {coords.length === 0 ? 'Acquiring GPS…' : `${coords.length} GPS points recorded`}
          </Text>
        </View>
      )}

      {/* Acquiring GPS overlay — shown until first fix arrives (native build only) */}
      {MapboxGL && coords.length === 0 && (
        <View style={styles.acquiringOverlay}>
          <Text style={styles.acquiringText}>Acquiring GPS…</Text>
        </View>
      )}

      {/* Map style toggle – only shown when Mapbox is available */}
      {MapboxGL && (
        <TouchableOpacity style={styles.mapTypeButton} onPress={cycleMapType}>
          <Text style={styles.mapTypeText}>{MAP_STYLES[styleIndex].label}</Text>
        </TouchableOpacity>
      )}

      <View style={styles.statsOverlay}>
        <View style={styles.statBlock}>
          <Text style={styles.statLabel}>Current Pace</Text>
          <Text style={styles.statValue}>{formatPace(currentPaceSecPerMile)}/mi</Text>
        </View>
        <View style={styles.statBlock}>
          <Text style={styles.statLabel}>Target Pace</Text>
          <Text style={styles.statValue}>{targetPaceDisplay}</Text>
        </View>
        <View style={styles.statBlock}>
          <Text style={styles.statLabel}>Delta</Text>
          <Text style={[
            styles.statValue,
            { color: paceDelta > 10 ? '#ff4444' : paceDelta < -5 ? '#44cc88' : '#fff' },
          ]}>
            {currentPaceSecPerMile > 0 ? formatPaceDelta(paceDelta) : '--'}
          </Text>
        </View>
        <View style={styles.statBlock}>
          <Text style={styles.statLabel}>Distance</Text>
          <Text style={styles.statValue}>{formatDistance(distanceMeters, units)}</Text>
        </View>
        <View style={styles.statBlock}>
          <Text style={styles.statLabel}>Elapsed</Text>
          <Text style={styles.statValue}>{formatElapsed(elapsedSeconds)}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
        <Text style={styles.finishButtonText}>Finish Run</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  map: { flex: 1 },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#16213e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPlaceholderText: { color: '#e94560', fontSize: 18, fontWeight: 'bold' },
  mapPlaceholderSub: { color: '#aaa', fontSize: 14, marginTop: 8 },
  acquiringOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(22,33,62,0.7)',
  },
  acquiringText: { color: '#aaa', fontSize: 16 },
  startDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#44cc88',
    borderWidth: 2,
    borderColor: '#fff',
  },
  mapTypeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(26,26,46,0.85)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e94560',
  },
  mapTypeText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  statsOverlay: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: 'rgba(26,26,46,0.95)',
    padding: 16,
    justifyContent: 'space-between',
  },
  statBlock: { width: '30%', alignItems: 'center', marginVertical: 8 },
  statLabel: { color: '#aaa', fontSize: 11, textTransform: 'uppercase' },
  statValue: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginTop: 2 },
  finishButton: {
    backgroundColor: '#e94560',
    padding: 18,
    alignItems: 'center',
  },
  finishButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
