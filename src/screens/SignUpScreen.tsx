import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/AuthNavigator';
import { registerUser } from '../services/authService';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'SignUp'>;
};

export function SignUpScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [team, setTeam] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignUp() {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert('Missing fields', 'Please fill in all required fields.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await registerUser(email.trim().toLowerCase(), password, name.trim(), team.trim());
    } catch (err: any) {
      Alert.alert('Sign up failed', err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#1a1a2e' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Create Account</Text>
        <TextInput
          style={styles.input}
          placeholder="Full Name *"
          placeholderTextColor="#888"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="School / Team (optional)"
          placeholderTextColor="#888"
          value={team}
          onChangeText={setTeam}
        />
        <TextInput
          style={styles.input}
          placeholder="Email *"
          placeholderTextColor="#888"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password (min 6 chars) *"
          placeholderTextColor="#888"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity style={styles.button} onPress={handleSignUp} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Creating account…' : 'Sign Up'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>Already have an account? Log in</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 32 },
  input: {
    backgroundColor: '#16213e',
    color: '#fff',
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#0f3460',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  link: { color: '#e94560', textAlign: 'center', marginTop: 16, fontSize: 14 },
});
