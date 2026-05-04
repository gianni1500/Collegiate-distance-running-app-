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
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/AuthNavigator';
import { resetPassword } from '../services/authService';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;
};

export function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleReset() {
    if (!email.trim()) return;
    setLoading(true);
    try {
      await resetPassword(email.trim().toLowerCase());
      setSent(true);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>Reset Password</Text>
      {sent ? (
        <Text style={styles.successText}>
          Check your email for a password reset link.
        </Text>
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#888"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TouchableOpacity style={styles.button} onPress={handleReset} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'Sending…' : 'Send Reset Email'}</Text>
          </TouchableOpacity>
        </>
      )}
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Back to login</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    padding: 24,
  },
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
  successText: { color: '#4caf50', textAlign: 'center', fontSize: 16, marginBottom: 24 },
});
