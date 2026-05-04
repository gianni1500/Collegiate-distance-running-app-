import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RunStackParamList } from '../navigation/MainNavigator';
import { useAuthStore } from '../store/useAuthStore';
import { db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { formatDistance, formatElapsed, formatPace } from '../utils/formatters';
import { useRunStore } from '../store/useRunStore';

type Props = {
  navigation: NativeStackNavigationProp<RunStackParamList, 'PostRunSummary'>;
  route: RouteProp<RunStackParamList, 'PostRunSummary'>;
};

export function PostRunSummaryScreen({ navigation, route }: Props) {
  const { runId } = route.params;
  const user = useAuthStore((state) => state.user);
  const units = useRunStore((state) => state.units);
  const [run, setRun] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, 'users', user.uid, 'runs', runId))
      .then((snap) => {
        if (snap.exists()) setRun(snap.data());
      })
      .finally(() => setLoading(false));
  }, [runId, user]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#e94560" />
      </View>
    );
  }

  if (!run) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Could not load run data.</Text>
      </View>
    );
  }

  const coords = run.route ?? [];
  const hasRoute = coords.length > 1;

  // Compute bounding box so the camera fits the entire route
  const lngs = coords.map((c: any) => c.longitude as number);
  const lats = coords.map((c: any) => c.latitude as number);
  const routeBounds = hasRoute ? {
    ne: [Math.max(...lngs), Math.max(...lats)] as [number, number],
    sw: [Math.min(...lngs), Math.min(...lats)] as [number, number],
  } : null;

  const routeGeoJSON = {
    type: 'Feature' as const,
    geometry: {
      type: 'LineString' as const,
      coordinates: coords.map((c: any) => [c.longitude, c.latitude]),
    },
    properties: {},
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {run.isPersonalBest && (
        <View style={styles.pbBanner}>
          <Text style={styles.pbBannerText}>Personal Best 🏆</Text>
        </View>
      )}
      {run.goalAchieved && (
        <View style={styles.goalBanner}>
          <Text style={styles.goalBannerText}>Goal Achieved ✓</Text>
        </View>
      )}

      {hasRoute && routeBounds && (
        <MapboxGL.MapView
          style={styles.map}
          styleURL={MapboxGL.StyleURL.Outdoors}
          logoEnabled={false}
          attributionEnabled={false}
          scrollEnabled={false}
          zoomEnabled={false}
          rotateEnabled={false}
          pitchEnabled={false}
        >
          <MapboxGL.Camera
            bounds={{
              ...routeBounds,
              paddingTop: 40,
              paddingBottom: 40,
              paddingLeft: 40,
              paddingRight: 40,
            }}
            animationMode="none"
          />
          <MapboxGL.ShapeSource id="summaryRoute" shape={routeGeoJSON}>
            <MapboxGL.LineLayer
              id="summaryRouteLine"
              style={{ lineColor: '#e94560', lineWidth: 4, lineCap: 'round', lineJoin: 'round' }}
            />
          </MapboxGL.ShapeSource>
        </MapboxGL.MapView>
      )}

      <View style={styles.statsGrid}>
        <Stat label="Distance" value={formatDistance(run.distanceMeters, units)} />
        <Stat label="Time" value={formatElapsed(run.elapsedSeconds)} />
        <Stat label="Avg Pace" value={`${formatPace(run.averagePaceSecPerMile)}/mi`} />
        <Stat label="Target Pace" value={`${formatPace(run.targetPaceSecPerMile)}/mi`} />
      </View>

      <TouchableOpacity
        style={styles.doneButton}
        onPress={() => navigation.navigate('MainTabs')}
      >
        <Text style={styles.doneButtonText}>Done</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statBlock}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  content: { paddingBottom: 48 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a2e' },
  errorText: { color: '#aaa' },
  pbBanner: { backgroundColor: '#ffd700', padding: 14, alignItems: 'center' },
  pbBannerText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
  goalBanner: { backgroundColor: '#4caf50', padding: 14, alignItems: 'center' },
  goalBannerText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  map: { height: 220 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    justifyContent: 'space-between',
  },
  statBlock: {
    width: '48%',
    backgroundColor: '#16213e',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  statLabel: { color: '#aaa', fontSize: 12, textTransform: 'uppercase' },
  statValue: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginTop: 4 },
  doneButton: {
    backgroundColor: '#0f3460',
    margin: 24,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  doneButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
