const METERS_PER_MILE = 1609.344;
const METERS_PER_KM = 1000;

/**
 * Calculate required target pace in seconds per mile.
 * @param distanceMeters - race distance in meters
 * @param goalSeconds    - goal finish time in seconds
 */
export function calcTargetPace(
  distanceMeters: number,
  goalSeconds: number
): number {
  const miles = distanceMeters / METERS_PER_MILE;
  return goalSeconds / miles; // sec/mile
}

/**
 * Calculate current pace in seconds per mile from recent GPS coords.
 * Requires at least 2 points and the elapsed time between them.
 * @param distanceCoveredMeters - meters traveled in the recent window
 * @param windowSeconds         - seconds elapsed for that distance window
 */
export function calcCurrentPace(
  distanceCoveredMeters: number,
  windowSeconds: number
): number {
  if (distanceCoveredMeters <= 0 || windowSeconds <= 0) return 0;
  const miles = distanceCoveredMeters / METERS_PER_MILE;
  return windowSeconds / miles; // sec/mile
}

/**
 * Returns how many seconds/mile the runner is off from target.
 * Positive = slower than target (falling behind)
 * Negative = faster than target (ahead of pace)
 */
export function getPaceDelta(
  currentPaceSecPerMile: number,
  targetPaceSecPerMile: number
): number {
  return currentPaceSecPerMile - targetPaceSecPerMile;
}

/** Convert sec/mile to sec/km */
export function paceToKm(secPerMile: number): number {
  return secPerMile / (METERS_PER_MILE / METERS_PER_KM);
}

/** Meters to miles */
export function metersToMiles(m: number): number {
  return m / METERS_PER_MILE;
}

/** Meters to km */
export function metersToKm(m: number): number {
  return m / METERS_PER_KM;
}
