import { useRunStore } from '../store/useRunStore';
import { useGPSTracking } from './useGPSTracking';
import { usePaceCalculator } from './usePaceCalculator';

/**
 * Aggregates GPS tracking + pace calculation into one convenience hook
 * for the Active Run screen.
 */
export function useRunSession() {
  const { config, session, resetSession } = useRunStore();
  const gps = useGPSTracking();
  const { targetPaceSecPerMile, targetPaceDisplay } = usePaceCalculator(config);

  async function startRun() {
    resetSession();
    await gps.start();
  }

  function endRun() {
    gps.stop();
  }

  return {
    config,
    session,
    targetPaceSecPerMile,
    targetPaceDisplay,
    startRun,
    endRun,
    ...gps,
  };
}
