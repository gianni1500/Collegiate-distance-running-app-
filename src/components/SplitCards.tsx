import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { formatPace, formatElapsed, formatDistance } from '../utils/formatters';

interface Split {
  mile: number;
  paceSecPerMile: number;
  splitTimeSeconds: number;
}

interface SplitCardsProps {
  splits: Split[];
  targetPaceSecPerMile: number;
  units?: 'miles' | 'km';
}

export function SplitCards({ splits, targetPaceSecPerMile, units = 'miles' }: SplitCardsProps) {
  if (splits.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mile Splits</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {splits.map((split) => {
          const delta = split.paceSecPerMile - targetPaceSecPerMile;
          const deltaColor = delta > 10 ? '#ff4444' : delta < -5 ? '#44cc88' : '#aaa';
          return (
            <View key={split.mile} style={styles.card}>
              <Text style={styles.mileLabel}>Mile {split.mile}</Text>
              <Text style={styles.pace}>{formatPace(split.paceSecPerMile)}</Text>
              <Text style={[styles.delta, { color: deltaColor }]}>
                {delta >= 0 ? '+' : ''}{Math.round(delta)}s
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 16 },
  title: { color: '#aaa', fontSize: 13, textTransform: 'uppercase', paddingHorizontal: 16, marginBottom: 8 },
  card: {
    backgroundColor: '#16213e',
    borderRadius: 10,
    padding: 16,
    marginLeft: 16,
    alignItems: 'center',
    minWidth: 80,
  },
  mileLabel: { color: '#aaa', fontSize: 12 },
  pace: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginTop: 4 },
  delta: { fontSize: 13, marginTop: 4 },
});
