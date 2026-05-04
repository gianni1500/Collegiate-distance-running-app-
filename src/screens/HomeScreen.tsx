import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RunStackParamList } from '../navigation/MainNavigator';
import { useAuthStore } from '../store/useAuthStore';
import { getRunHistory } from '../services/authService';
import { formatDistance, formatElapsed, formatPace } from '../utils/formatters';
import { useRunStore } from '../store/useRunStore';
import { seedRunsForUser } from '../utils/seedTestData';

type Props = {
  navigation: NativeStackNavigationProp<RunStackParamList, 'MainTabs'>;
};

export function HomeScreen({ navigation }: Props) {
  const user = useAuthStore((state) => state.user);
  const units = useRunStore((state) => state.units);
  const [recentRuns, setRecentRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  function loadRuns() {
    if (!user) return;
    setLoading(true);
    getRunHistory(user.uid)
      .then((runs) => setRecentRuns(runs.slice(0, 5)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadRuns(); }, [user]);

  async function handleSeedData() {
    if (!user) return;
    setSeeding(true);
    try {
      await seedRunsForUser(user.uid);
      loadRuns();
      Alert.alert('Done!', '5 test runs added to Firestore.');
    } catch (e: any) {
      Alert.alert('Seed error', e.message);
    } finally {
      setSeeding(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.greeting}>
        Hey, {user?.displayName?.split(' ')[0] ?? 'Runner'} 👋
      </Text>

      <TouchableOpacity
        style={styles.startButton}
        onPress={() => navigation.navigate('PreRunSetup')}
      >
        <Text style={styles.startButtonText}>Start a Run</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Recent Runs</Text>
      {loading ? (
        <ActivityIndicator color="#e94560" />
      ) : recentRuns.length === 0 ? (
        <>
          <Text style={styles.emptyText}>No runs yet. Get out there!</Text>
          <TouchableOpacity
            style={styles.seedButton}
            onPress={handleSeedData}
            disabled={seeding}
          >
            <Text style={styles.seedButtonText}>
              {seeding ? 'Adding test data…' : '⚡ Add Test Data'}
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        recentRuns.map((run) => (
          <View key={run.id} style={styles.runCard}>
            <Text style={styles.runDistance}>
              {formatDistance(run.distanceMeters, units)}
            </Text>
            <Text style={styles.runMeta}>
              {formatElapsed(run.elapsedSeconds)} •{' '}
              {formatPace(run.averagePaceSecPerMile)}/mi
            </Text>
            {run.isPersonalBest && (
              <Text style={styles.pbBadge}>Personal Best 🏆</Text>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  content: { padding: 24 },
  greeting: { fontSize: 24, color: '#fff', fontWeight: 'bold', marginBottom: 24 },
  startButton: {
    backgroundColor: '#e94560',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 32,
  },
  startButtonText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  sectionTitle: { color: '#aaa', fontSize: 14, fontWeight: '600', marginBottom: 12, textTransform: 'uppercase' },
  runCard: {
    backgroundColor: '#16213e',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
  },
  runDistance: { color: '#fff', fontSize: 18, fontWeight: '600' },
  runMeta: { color: '#aaa', fontSize: 14, marginTop: 4 },
  pbBadge: { color: '#ffd700', fontSize: 13, marginTop: 6 },
  emptyText: { color: '#666', textAlign: 'center', marginTop: 24 },
  seedButton: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#e94560',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  seedButtonText: { color: '#e94560', fontSize: 15, fontWeight: '600' },
});
