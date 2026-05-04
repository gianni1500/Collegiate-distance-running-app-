# Collegiate Distance Runner App

React Native (Expo) app for iOS + Android. Athletes set a goal race time, track live pace via GPS, and receive text-to-speech motivation.

## Quick Start

### 1. Install dependencies
```bash
cd CollegiateRunnerApp
npm install
```

Also install the community slider (used in PreRunSetup & MotivationSettings):
```bash
npx expo install @react-native-community/slider
```

### 2. Configure Firebase
1. Go to [Firebase Console](https://console.firebase.google.com) → New project
2. Enable **Email/Password** auth under Authentication
3. Create a **Firestore** database (start in test mode for dev)
4. Copy your web config into `src/services/firebase.ts`

### 3. Start the dev server
```bash
npx expo start
```
- Press `i` for iOS Simulator, `a` for Android Emulator

---

## Project Structure
```
src/
  screens/       — All 7 screens (Auth, Home, PreRun, ActiveRun, PostRun, History, Profile)
  components/    — PaceDisplay, LiveMap, RunTimer, MotivationSettings, SplitCards
  hooks/         — useGPSTracking, usePaceCalculator, useMotivation, useRunSession
  services/      — firebase.ts, authService.ts, tts.ts
  store/         — useAuthStore.ts, useRunStore.ts (Zustand)
  utils/         — paceCalculator.ts, haversine.ts, motivationMessages.ts, formatters.ts
  navigation/    — AppNavigator.tsx, AuthNavigator.tsx, MainNavigator.tsx
```

## Implementation Phases

Follow the phases in `plan-collegiateDistanceRunnerApp.prompt.md`:

- **Phase 1** — Install deps, Firebase setup ← *start here*
- **Phase 2** — Auth screens are done; wire `initAuthListener()` in `App.tsx`
- **Phase 3** — Pace engine + PreRun screen are done
- **Phase 4** — GPS tracking hook is done; test on simulator
- **Phase 5** — Motivation hook + TTS are done; 75 messages in `motivationMessages.ts`
- **Phase 6** — PostRun + History screens are done
- **Phase 7** — Polish: icons, splash, error states

## Verification Checklist
- [ ] 5K in 16:00 displays **5:09/mi** target pace
- [ ] Auth flow: register → login → logout → password reset
- [ ] GPS pace updates live using iOS Simulator "City Run"
- [ ] Each of the 5 TTS triggers fires at all 5 intensity levels
- [ ] Run saves and appears correctly in Firebase Console
- [ ] Personal best badge appears when faster time is recorded
