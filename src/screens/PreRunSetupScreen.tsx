import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RunStackParamList } from '../navigation/MainNavigator';
import { useRunStore } from '../store/useRunStore';
import { calcTargetPace } from '../utils/paceCalculator';
import { formatPace } from '../utils/formatters';

// Common race distances in meters
const PRESET_DISTANCES: Record<string, number> = {
  '1500m': 1500,
  'Mile': 1609,
  '3K': 3000,
  '5K': 5000,
  '8K': 8046,
  '10K': 10000,
};

type Props = {
  navigation: NativeStackNavigationProp<RunStackParamList, 'PreRunSetup'>;
};

export function PreRunSetupScreen({ navigation }: Props) {
  const { setConfig } = useRunStore();

  const [selectedDistance, setSelectedDistance] = useState<string>('5K');
  const [goalMins, setGoalMins] = useState('');
  const [goalSecs, setGoalSecs] = useState('');
  const [intensity, setIntensity] = useState(3);
  const [triggers, setTriggers] = useState({
    onStart: true,
    fallingBehind: true,
    backOnPace: true,
    halfwayPoint: true,
    finalStretch: true,
  });

  const distanceMeters = PRESET_DISTANCES[selectedDistance] ?? 5000;
  const goalSeconds =
    (parseInt(goalMins || '0', 10) * 60) + parseInt(goalSecs || '0', 10);
  const targetPace =
    goalSeconds > 0 ? calcTargetPace(distanceMeters, goalSeconds) : 0;

  function toggleTrigger(key: keyof typeof triggers) {
    setTriggers((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleStartRun() {
    if (goalSeconds <= 0) return;
    setConfig({
      distanceMeters,
      goalSeconds,
      targetPaceSecPerMile: targetPace,
      motivationIntensity: intensity,
      triggers,
    });
    navigation.navigate('ActiveRun');
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Set Up Your Run</Text>

      {/* Distance Picker */}
      <Text style={styles.label}>Distance</Text>
      <View style={styles.distanceRow}>
        {Object.keys(PRESET_DISTANCES).map((key) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.distanceChip,
              selectedDistance === key && styles.distanceChipActive,
            ]}
            onPress={() => setSelectedDistance(key)}
          >
            <Text
              style={[
                styles.distanceChipText,
                selectedDistance === key && styles.distanceChipTextActive,
              ]}
            >
              {key}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Goal Time */}
      <Text style={styles.label}>Goal Time</Text>
      <View style={styles.timeRow}>
        <TextInput
          style={styles.timeInput}
          placeholder="MM"
          placeholderTextColor="#666"
          keyboardType="number-pad"
          maxLength={2}
          value={goalMins}
          onChangeText={setGoalMins}
        />
        <Text style={styles.colon}>:</Text>
        <TextInput
          style={styles.timeInput}
          placeholder="SS"
          placeholderTextColor="#666"
          keyboardType="number-pad"
          maxLength={2}
          value={goalSecs}
          onChangeText={setGoalSecs}
        />
      </View>

      {targetPace > 0 && (
        <View style={styles.pacePreview}>
          <Text style={styles.pacePreviewLabel}>Target Pace</Text>
          <Text style={styles.pacePreviewValue}>{formatPace(targetPace)}/mi</Text>
        </View>
      )}

      {/* Intensity Slider */}
      <Text style={styles.label}>Motivation Intensity: {intensity}</Text>
      <Slider
        style={{ width: '100%', height: 40 }}
        minimumValue={1}
        maximumValue={5}
        step={1}
        value={intensity}
        onValueChange={(v) => setIntensity(v)}
        minimumTrackTintColor="#e94560"
        maximumTrackTintColor="#333"
        thumbTintColor="#e94560"
      />

      {/* Trigger Toggles */}
      <Text style={styles.label}>Motivation Triggers</Text>
      {(Object.keys(triggers) as Array<keyof typeof triggers>).map((key) => (
        <View key={key} style={styles.triggerRow}>
          <Text style={styles.triggerLabel}>
            {key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
          </Text>
          <Switch
            value={triggers[key]}
            onValueChange={() => toggleTrigger(key)}
            trackColor={{ false: '#333', true: '#e94560' }}
            thumbColor="#fff"
          />
        </View>
      ))}

      <TouchableOpacity
        style={[styles.startButton, goalSeconds <= 0 && styles.startButtonDisabled]}
        onPress={handleStartRun}
        disabled={goalSeconds <= 0}
      >
        <Text style={styles.startButtonText}>Start Run</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  content: { padding: 24, paddingBottom: 48 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 24 },
  label: { color: '#aaa', fontSize: 13, fontWeight: '600', textTransform: 'uppercase', marginBottom: 8, marginTop: 20 },
  distanceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  distanceChip: {
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  distanceChipActive: { backgroundColor: '#e94560', borderColor: '#e94560' },
  distanceChipText: { color: '#aaa', fontSize: 14 },
  distanceChipTextActive: { color: '#fff', fontWeight: '600' },
  timeRow: { flexDirection: 'row', alignItems: 'center' },
  timeInput: {
    backgroundColor: '#16213e',
    color: '#fff',
    fontSize: 28,
    width: 72,
    textAlign: 'center',
    borderRadius: 8,
    padding: 12,
  },
  colon: { color: '#fff', fontSize: 28, marginHorizontal: 8 },
  pacePreview: {
    backgroundColor: '#0f3460',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  pacePreviewLabel: { color: '#aaa', fontSize: 12 },
  pacePreviewValue: { color: '#fff', fontSize: 32, fontWeight: 'bold', marginTop: 4 },
  triggerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  triggerLabel: { color: '#fff', fontSize: 15 },
  startButton: {
    backgroundColor: '#e94560',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 32,
  },
  startButtonDisabled: { opacity: 0.4 },
  startButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
