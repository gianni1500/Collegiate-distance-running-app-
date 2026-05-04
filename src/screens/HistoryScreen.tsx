import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import { getRunHistory } from '../services/authService';
import { formatDistance, formatElapsed, formatPace } from '../utils/formatters';
import { useRunStore } from '../store/useRunStore';

export function HistoryScreen() {
  const user = useAuthStore((state) => state.user);
  const units = useRunStore((state) => state.units);
  const [runs, setRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getRunHistory(user.uid)
      .then(setRuns)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#e94560" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Run History</Text>
      {runs.length === 0 ? (
        <Text style={styles.emptyText}>No runs recorded yet.</Text>
      ) : (
        <FlatList
          data={runs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.runCard}>
              <View style={styles.runCardLeft}>
                <Text style={styles.distance}>
                  {formatDistance(item.distanceMeters, units)}
                </Text>
                <Text style={styles.meta}>
                  {formatElapsed(item.elapsedSeconds)} •{' '}
                  {formatPace(item.averagePaceSecPerMile)}/mi
                </Text>
                <Text style={styles.date}>
                  {new Date(item.startedAt).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.badges}>
                {item.isPersonalBest && <Text style={styles.pbBadge}>PB 🏆</Text>}
                {item.goalAchieved && <Text style={styles.goalBadge}>Goal ✓</Text>}
              </View>
            </View>
          )}
          contentContainerStyle={{ padding: 16 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a2e' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff', padding: 24, paddingBottom: 8 },
  emptyText: { color: '#666', textAlign: 'center', marginTop: 48 },
  runCard: {
    backgroundColor: '#16213e',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  runCardLeft: { flex: 1 },
  distance: { color: '#fff', fontSize: 18, fontWeight: '600' },
  meta: { color: '#aaa', fontSize: 13, marginTop: 4 },
  date: { color: '#666', fontSize: 12, marginTop: 4 },
  badges: { alignItems: 'flex-end', gap: 4 },
  pbBadge: { color: '#ffd700', fontSize: 13 },
  goalBadge: { color: '#4caf50', fontSize: 13 },
});
