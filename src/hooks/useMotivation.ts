import { useEffect, useRef } from 'react';
import { speak } from '../services/tts';
import { getPaceDelta } from '../utils/paceCalculator';
import { TriggerKey } from '../utils/motivationMessages';
import { RunConfig } from '../store/useRunStore';

interface MotivationInput {
  config: RunConfig;
  distanceMeters: number;
  currentPaceSecPerMile: number;
  elapsedSeconds: number;
  isRunning: boolean;
}

const COOLDOWN_MS = 60_000; // 60 seconds between repeatable triggers

export function useMotivation({
  config,
  distanceMeters,
  currentPaceSecPerMile,
  elapsedSeconds,
  isRunning,
}: MotivationInput) {
  const firedOnce = useRef<Set<TriggerKey>>(new Set());
  const lastFired = useRef<Partial<Record<TriggerKey, number>>>({});
  const startFiredRef = useRef(false);

  const intensity = (config.motivationIntensity ?? 3) as 1 | 2 | 3 | 4 | 5;
  const { triggers, distanceMeters: goalDistance, targetPaceSecPerMile } = config;

  function canFire(trigger: TriggerKey, once = false): boolean {
    if (once) return !firedOnce.current.has(trigger);
    const last = lastFired.current[trigger] ?? 0;
    return Date.now() - last >= COOLDOWN_MS;
  }

  function fire(trigger: TriggerKey, once = false) {
    speak(trigger, intensity);
    if (once) {
      firedOnce.current.add(trigger);
    } else {
      lastFired.current[trigger] = Date.now();
    }
  }

  // Trigger: Run start
  useEffect(() => {
    if (isRunning && !startFiredRef.current && triggers.onStart) {
      startFiredRef.current = true;
      fire('onStart', true);
    }
  }, [isRunning]);

  // Trigger: pace + milestone checks
  useEffect(() => {
    if (!isRunning || currentPaceSecPerMile <= 0) return;

    const delta = getPaceDelta(currentPaceSecPerMile, targetPaceSecPerMile);

    // Falling behind: more than 10 sec/mile over target
    if (triggers.fallingBehind && delta > 10 && canFire('fallingBehind')) {
      fire('fallingBehind');
    }

    // Back on pace: within 5 sec/mile of target
    if (triggers.backOnPace && Math.abs(delta) <= 5 && canFire('backOnPace')) {
      fire('backOnPace');
    }

    // Halfway point
    if (
      triggers.halfwayPoint &&
      distanceMeters >= goalDistance * 0.5 &&
      canFire('halfwayPoint', true)
    ) {
      fire('halfwayPoint', true);
    }

    // Final stretch (85%)
    if (
      triggers.finalStretch &&
      distanceMeters >= goalDistance * 0.85 &&
      canFire('finalStretch', true)
    ) {
      fire('finalStretch', true);
    }
  }, [distanceMeters, currentPaceSecPerMile]);

  function reset() {
    firedOnce.current.clear();
    lastFired.current = {};
    startFiredRef.current = false;
  }

  return { reset };
}
