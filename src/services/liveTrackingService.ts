/**
 * liveTrackingService.ts
 *
 * Writes athlete location to Firestore in real-time during a run so that
 * coaches (or any subscriber) can watch the athlete's position live.
 *
 * Firestore structure:
 *   liveSessions/{uid}  — one doc per athlete, overwritten each run
 */

import {
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  collection,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

export interface LiveLocationPoint {
  latitude: number;
  longitude: number;
  timestamp: number;
}

export interface LiveSessionStats {
  distanceMeters: number;
  elapsedSeconds: number;
  currentPaceSecPerMile: number;
}

export interface LiveSessionData {
  uid: string;
  displayName: string;
  team: string;
  isActive: boolean;
  startedAt: number;
  currentLocation: LiveLocationPoint | null;
  distanceMeters: number;
  elapsedSeconds: number;
  currentPaceSecPerMile: number;
  updatedAt: unknown; // Firestore serverTimestamp
}

/**
 * Called when an athlete starts a run.
 * Creates (or overwrites) the liveSessions/{uid} document.
 */
export async function startLiveSession(
  uid: string,
  displayName: string,
  team: string
): Promise<void> {
  await setDoc(doc(db, 'liveSessions', uid), {
    uid,
    displayName,
    team,
    isActive: true,
    startedAt: Date.now(),
    currentLocation: null,
    distanceMeters: 0,
    elapsedSeconds: 0,
    currentPaceSecPerMile: 0,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Called on every GPS update during the run.
 * Pushes the latest position + stats to Firestore.
 */
export async function updateLiveLocation(
  uid: string,
  location: LiveLocationPoint,
  stats: LiveSessionStats
): Promise<void> {
  await updateDoc(doc(db, 'liveSessions', uid), {
    currentLocation: location,
    distanceMeters: stats.distanceMeters,
    elapsedSeconds: stats.elapsedSeconds,
    currentPaceSecPerMile: stats.currentPaceSecPerMile,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Called when the athlete ends the run.
 * Marks the session as inactive so it is removed from live views.
 */
export async function endLiveSession(uid: string): Promise<void> {
  await updateDoc(doc(db, 'liveSessions', uid), {
    isActive: false,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Subscribe to a single athlete's live session.
 * Returns an unsubscribe function — call it when the component unmounts.
 *
 * Usage:
 *   const unsub = subscribeLiveSession(uid, (data) => { ... });
 *   // later:
 *   unsub();
 */
export function subscribeLiveSession(
  uid: string,
  callback: (data: LiveSessionData | null) => void
): () => void {
  return onSnapshot(doc(db, 'liveSessions', uid), (snap) => {
    callback(snap.exists() ? (snap.data() as LiveSessionData) : null);
  });
}

/**
 * Subscribe to ALL active sessions for a given team.
 * Useful for a coach dashboard showing all runners at once.
 *
 * Requires a composite Firestore index on: team ASC, isActive ASC
 * Firebase console will prompt to create it on first use.
 */
export function subscribeTeamSessions(
  team: string,
  callback: (sessions: LiveSessionData[]) => void
): () => void {
  const q = query(
    collection(db, 'liveSessions'),
    where('team', '==', team),
    where('isActive', '==', true)
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => d.data() as LiveSessionData));
  });
}
