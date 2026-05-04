import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import Slider from '@react-native-community/slider';

interface MotivationSettingsProps {
  intensity: number;
  onIntensityChange: (value: number) => void;
  triggers: Record<string, boolean>;
  onTriggerToggle: (key: string) => void;
}

const TRIGGER_LABELS: Record<string, string> = {
  onStart: 'On Start',
  fallingBehind: 'Falling Behind',
  backOnPace: 'Back on Pace',
  halfwayPoint: 'Halfway Point',
  finalStretch: 'Final Stretch',
};

export function MotivationSettings({
  intensity,
  onIntensityChange,
  triggers,
  onTriggerToggle,
}: MotivationSettingsProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Motivation Intensity: {intensity}</Text>
      <Slider
        style={{ width: '100%', height: 40 }}
        minimumValue={1}
        maximumValue={5}
        step={1}
        value={intensity}
        onValueChange={onIntensityChange}
        minimumTrackTintColor="#e94560"
        maximumTrackTintColor="#333"
        thumbTintColor="#e94560"
      />
      <Text style={styles.sectionTitle}>Triggers</Text>
      {Object.keys(triggers).map((key) => (
        <View key={key} style={styles.row}>
          <Text style={styles.triggerLabel}>
            {TRIGGER_LABELS[key] ?? key}
          </Text>
          <Switch
            value={triggers[key]}
            onValueChange={() => onTriggerToggle(key)}
            trackColor={{ false: '#333', true: '#e94560' }}
            thumbColor="#fff"
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 4 },
  sectionTitle: {
    color: '#aaa',
    fontSize: 13,
    textTransform: 'uppercase',
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  triggerLabel: { color: '#fff', fontSize: 15 },
});
