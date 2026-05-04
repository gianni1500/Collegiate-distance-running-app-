/**
 * seedTestData.ts
 * Call seedRunsForUser(uid) once from the app to populate Firestore with
 * realistic test run records so History / Home screens have something to show.
 */

import { saveRun, updatePersonalBest, RunRecord } from '../services/authService';

// Lightweight straight-line route near a standard NCAA track (Notre Dame stadium area)
function makeRoute(
  startLat: number,
  startLng: number,
  steps: number
): Array<{ latitude: number; longitude: number; timestamp: number }> {
  const route = [];
  const now = Date.now();
  for (let i = 0; i < steps; i++) {
    route.push({
      latitude: startLat + i * 0.0001,
      longitude: startLng + i * 0.00008,
      timestamp: now - (steps - i) * 6000,
    });
  }
  return route;
}

interface SeedRun {
  label: string;
  distanceMeters: number;
  elapsedSeconds: number;
  targetPaceSecPerMile: number;
  goalAchieved: boolean;
  daysAgo: number;
}

const TEST_RUNS: SeedRun[] = [
  {
    label: '5K — personal best',
    distanceMeters: 5000,
    elapsedSeconds: 16 * 60 + 10,   // 16:10
    targetPaceSecPerMile: 5 * 60 + 9, // 5:09/mi target for 16:00
    goalAchieved: false,
    daysAgo: 1,
  },
  {
    label: '5K — goal achieved',
    distanceMeters: 5000,
    elapsedSeconds: 15 * 60 + 52,   // 15:52 — beat 16:00 goal
    targetPaceSecPerMile: 5 * 60 + 9,
    goalAchieved: true,
    daysAgo: 5,
  },
  {
    label: '10K — solid effort',
    distanceMeters: 10000,
    elapsedSeconds: 33 * 60 + 45,   // 33:45
    targetPaceSecPerMile: 5 * 60 + 22, // ~5:22/mi
    goalAchieved: true,
    daysAgo: 9,
  },
  {
    label: '8K — tempo',
    distanceMeters: 8000,
    elapsedSeconds: 27 * 60 + 20,   // 27:20
    targetPaceSecPerMile: 5 * 60 + 30,
    goalAchieved: false,
    daysAgo: 14,
  },
  {
    label: '5K — early season',
    distanceMeters: 5000,
    elapsedSeconds: 16 * 60 + 55,   // 16:55
    targetPaceSecPerMile: 5 * 60 + 25,
    goalAchieved: true,
    daysAgo: 21,
  },
];

export async function seedRunsForUser(uid: string): Promise<void> {
  const now = Date.now();
  const DAY_MS = 24 * 60 * 60 * 1000;

  for (const seed of TEST_RUNS) {
    const finishedAt = now - seed.daysAgo * DAY_MS;
    const startedAt = finishedAt - seed.elapsedSeconds * 1000;
    const avgPace = seed.elapsedSeconds / (seed.distanceMeters / 1609.344);

    const run: RunRecord = {
      uid,
      startedAt,
      finishedAt,
      distanceMeters: seed.distanceMeters,
      elapsedSeconds: seed.elapsedSeconds,
      targetPaceSecPerMile: seed.targetPaceSecPerMile,
      averagePaceSecPerMile: Math.round(avgPace),
      route: makeRoute(41.6986, -86.2347, 40),
      goalAchieved: seed.goalAchieved,
      isPersonalBest: false,
    };

    await saveRun(run);
    await updatePersonalBest(uid, seed.distanceMeters, seed.elapsedSeconds);
  }

  console.log('✅ Test data seeded for uid:', uid);
}
