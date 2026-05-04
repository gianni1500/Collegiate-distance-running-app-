import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import { getUserProfile, updateUserProfile, logoutUser } from '../services/authService';
import { useRunStore } from '../store/useRunStore';

export function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const { units, setUnits } = useRunStore();

  const [displayName, setDisplayName] = useState('');
  const [team, setTeam] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    getUserProfile(user.uid).then((profile) => {
      if (profile) {
        setDisplayName(profile.displayName ?? '');
        setTeam(profile.team ?? '');
      }
    });
  }, [user]);

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    try {
      await updateUserProfile(user.uid, { displayName, team, units });
      Alert.alert('Saved', 'Profile updated.');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    try {
      await logoutUser();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Profile & Settings</Text>

      <Text style={styles.label}>Full Name</Text>
      <TextInput
        style={styles.input}
        value={displayName}
        onChangeText={setDisplayName}
        placeholder="Your name"
        placeholderTextColor="#666"
      />

      <Text style={styles.label}>School / Team</Text>
      <TextInput
        style={styles.input}
        value={team}
        onChangeText={setTeam}
        placeholder="e.g. State University XC"
        placeholderTextColor="#666"
      />

      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>
          Units: {units === 'miles' ? 'Miles' : 'Kilometers'}
        </Text>
        <Switch
          value={units === 'km'}
          onValueChange={(v) => setUnits(v ? 'km' : 'miles')}
          trackColor={{ false: '#333', true: '#e94560' }}
          thumbColor="#fff"
        />
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
        <Text style={styles.saveButtonText}>{saving ? 'Saving…' : 'Save Changes'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  content: { padding: 24, paddingBottom: 48 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 24 },
  label: { color: '#aaa', fontSize: 13, marginBottom: 6, textTransform: 'uppercase' },
  input: {
    backgroundColor: '#16213e',
    color: '#fff',
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    marginBottom: 24,
  },
  toggleLabel: { color: '#fff', fontSize: 16 },
  saveButton: {
    backgroundColor: '#0f3460',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  logoutButton: {
    borderWidth: 1,
    borderColor: '#e94560',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
  },
  logoutButtonText: { color: '#e94560', fontSize: 16, fontWeight: '600' },
});
