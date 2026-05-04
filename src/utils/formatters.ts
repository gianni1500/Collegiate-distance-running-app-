/**
 * Format seconds into M:SS string (e.g. 309 → "5:09")
 */
export function formatPace(secPerMile: number): string {
  if (!secPerMile || secPerMile <= 0) return '--:--';
  const mins = Math.floor(secPerMile / 60);
  const secs = Math.round(secPerMile % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format elapsed seconds into H:MM:SS or M:SS
 */
export function formatElapsed(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Format meters into a display string based on units preference.
 */
export function formatDistance(meters: number, units: 'miles' | 'km'): string {
  if (units === 'miles') {
    const miles = meters / 1609.344;
    return `${miles.toFixed(2)} mi`;
  }
  const km = meters / 1000;
  return `${km.toFixed(2)} km`;
}

/**
 * Format a pace delta (sec/mile) into a "+X" or "-X" string with label.
 */
export function formatPaceDelta(delta: number): string {
  const abs = Math.abs(Math.round(delta));
  const sign = delta >= 0 ? '+' : '-';
  return `${sign}${abs}s/mi`;
}

/**
 * Convert seconds to a "Xh Ym Zs" goal time string.
 */
export function formatGoalTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const parts: string[] = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  if (s > 0) parts.push(`${s}s`);
  return parts.join(' ');
}
