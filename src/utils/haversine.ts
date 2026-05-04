/**
 * Haversine formula — returns distance in meters between two GPS coordinates.
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Accumulate total distance in meters from an ordered array of {latitude, longitude} coordinates.
 */
export function totalDistanceFromCoords(
  coords: Array<{ latitude: number; longitude: number }>
): number {
  let total = 0;
  for (let i = 1; i < coords.length; i++) {
    total += haversineDistance(
      coords[i - 1].latitude,
      coords[i - 1].longitude,
      coords[i].latitude,
      coords[i].longitude
    );
  }
  return total;
}
