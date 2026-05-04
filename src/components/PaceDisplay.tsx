import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatPace, formatPaceDelta } from '../utils/formatters';

interface PaceDisplayProps {
  currentPaceSecPerMile: number;
  targetPaceSecPerMile: number;
}

export function PaceDisplay({ currentPaceSecPerMile, targetPaceSecPerMile }: PaceDisplayProps) {
  const delta = currentPaceSecPerMile - targetPaceSecPerMile;
  const deltaColor = delta > 10 ? '#ff4444' : delta < -5 ? '#44cc88' : '#fff';

  return (
    <View style={styles.container}>
      <Text style={styles.currentPace}>{formatPace(currentPaceSecPerMile)}/mi</Text>
      <Text style={styles.targetLabel}>
        Target: {formatPace(targetPaceSecPerMile)}/mi
      </Text>
      {currentPaceSecPerMile > 0 && (
        <Text style={[styles.delta, { color: deltaColor }]}>
          {formatPaceDelta(delta)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', padding: 16 },
  currentPace: { color: '#fff', fontSize: 48, fontWeight: 'bold' },
  targetLabel: { color: '#aaa', fontSize: 14, marginTop: 4 },
  delta: { fontSize: 22, fontWeight: '600', marginTop: 6 },
});
