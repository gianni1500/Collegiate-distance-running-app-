import * as Speech from 'expo-speech';
import { getMotivationMessage, TriggerKey } from '../utils/motivationMessages';

/**
 * Speak a motivation message for the given trigger and intensity.
 * Intensity maps to Speech pitch and rate.
 */
export function speak(trigger: TriggerKey, intensity: 1 | 2 | 3 | 4 | 5) {
  // Map intensity 1–5 to speech parameters
  const pitchMap: Record<number, number> = { 1: 0.9, 2: 1.0, 3: 1.05, 4: 1.1, 5: 1.2 };
  const rateMap: Record<number, number> = { 1: 0.85, 2: 0.95, 3: 1.0, 4: 1.1, 5: 1.2 };

  const message = getMotivationMessage(trigger, intensity);

  Speech.speak(message, {
    pitch: pitchMap[intensity],
    rate: rateMap[intensity],
    language: 'en-US',
  });
}

export function stopSpeaking() {
  Speech.stop();
}

export function isSpeaking(): Promise<boolean> {
  return Speech.isSpeakingAsync();
}
