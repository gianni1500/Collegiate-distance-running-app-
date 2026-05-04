import { calcTargetPace } from '../utils/paceCalculator';
import { RunConfig } from '../store/useRunStore';

/**
 * Returns derived pace information from the current run config.
 */
export function usePaceCalculator(config: RunConfig | null) {
  if (!config) return { targetPaceSecPerMile: 0, targetPaceDisplay: '--:--' };

  const targetPaceSecPerMile = calcTargetPace(
    config.distanceMeters,
    config.goalSeconds
  );

  const mins = Math.floor(targetPaceSecPerMile / 60);
  const secs = Math.round(targetPaceSecPerMile % 60);
  const targetPaceDisplay = `${mins}:${secs.toString().padStart(2, '0')}/mi`;

  return { targetPaceSecPerMile, targetPaceDisplay };
}
