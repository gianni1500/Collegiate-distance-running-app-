import { create } from 'zustand';
import { LocationObject } from 'expo-location';

export type Units = 'miles' | 'km';

export interface RunConfig {
  distanceMeters: number;
  goalSeconds: number;
  targetPaceSecPerMile: number;
  motivationIntensity: number; // 1–5
  triggers: {
    onStart: boolean;
    fallingBehind: boolean;
    backOnPace: boolean;
    halfwayPoint: boolean;
    finalStretch: boolean;
  };
}

export interface RunSession {
  startedAt: number | null;
  route: LocationObject[];
  distanceMeters: number;
  currentPaceSecPerMile: number;
  elapsedSeconds: number;
  isRunning: boolean;
}

interface RunStore {
  config: RunConfig | null;
  session: RunSession;
  units: Units;
  setConfig: (config: RunConfig) => void;
  setUnits: (units: Units) => void;
  updateSession: (partial: Partial<RunSession>) => void;
  resetSession: () => void;
}

const defaultSession: RunSession = {
  startedAt: null,
  route: [],
  distanceMeters: 0,
  currentPaceSecPerMile: 0,
  elapsedSeconds: 0,
  isRunning: false,
};

export const useRunStore = create<RunStore>((set) => ({
  config: null,
  session: defaultSession,
  units: 'miles',
  setConfig: (config) => set({ config }),
  setUnits: (units) => set({ units }),
  updateSession: (partial) =>
    set((state) => ({ session: { ...state.session, ...partial } })),
  resetSession: () => set({ session: defaultSession }),
}));
