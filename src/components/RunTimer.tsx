import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatElapsed } from '../utils/formatters';

interface RunTimerProps {
  elapsedSeconds: number;
}

export function RunTimer({ elapsedSeconds }: RunTimerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Elapsed</Text>
      <Text style={styles.time}>{formatElapsed(elapsedSeconds)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', padding: 8 },
  label: { color: '#aaa', fontSize: 11, textTransform: 'uppercase' },
  time: { color: '#fff', fontSize: 36, fontWeight: 'bold', fontVariant: ['tabular-nums'] },
});
