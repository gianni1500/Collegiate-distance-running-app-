import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { useAuthStore } from '../store/useAuthStore';

// --- Auth state listener (call once at app root) ---
export function initAuthListener() {
  return onAuthStateChanged(auth, (user) => {
    useAuthStore.getState().setUser(user);
    useAuthStore.getState().setLoading(false);
  });
}

// --- Auth operations ---
export async function registerUser(
  email: string,
  password: string,
  displayName: string,
  team: string
) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await setDoc(doc(db, 'users', credential.user.uid), {
    displayName,
    team,
    email,
    units: 'miles',
    createdAt: serverTimestamp(),
  });
  return credential.user;
}

export async function loginUser(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function logoutUser() {
  await signOut(auth);
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email);
}

// --- User profile ---
export async function getUserProfile(uid: string) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
}

export async function updateUserProfile(
  uid: string,
  data: Partial<{ displayName: string; team: string; units: string }>
) {
  await updateDoc(doc(db, 'users', uid), data);
}

// --- Run data ---
export interface RunRecord {
  uid: string;
  startedAt: number;
  finishedAt: number;
  distanceMeters: number;
  elapsedSeconds: number;
  targetPaceSecPerMile: number;
  averagePaceSecPerMile: number;
  route: Array<{ latitude: number; longitude: number; timestamp: number }>;
  goalAchieved: boolean;
  isPersonalBest: boolean;
}

export async function saveRun(run: RunRecord) {
  const ref = doc(db, 'users', run.uid, 'runs', run.startedAt.toString());
  await setDoc(ref, run);
  return ref.id;
}

export async function updatePersonalBest(
  uid: string,
  distanceMeters: number,
  elapsedSeconds: number
) {
  const pbRef = doc(db, 'users', uid, 'personalBests', distanceMeters.toString());
  const snap = await getDoc(pbRef);
  if (!snap.exists() || snap.data().elapsedSeconds > elapsedSeconds) {
    await setDoc(pbRef, { distanceMeters, elapsedSeconds, setAt: serverTimestamp() });
    return true; // new personal best
  }
  return false;
}

export async function getRunHistory(uid: string) {
  const { collection, getDocs, orderBy, query } = await import('firebase/firestore');
  const q = query(
    collection(db, 'users', uid, 'runs'),
    orderBy('startedAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
