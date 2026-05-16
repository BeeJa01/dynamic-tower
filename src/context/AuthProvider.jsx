'use client';

// context/AuthProvider.jsx
import { useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/lib/firebase';
import { AuthContext } from '@/context/AuthContext';

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Watch auth state ─────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const docRef  = doc(db, 'users', firebaseUser.uid);
        const docSnap = await getDoc(docRef);
        setUser({ ...firebaseUser, ...docSnap.data() });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  // ── Create user doc in Firestore ─────────────────────────────
  const createUserDoc = async (firebaseUser, extra = {}) => {
    const ref  = doc(db, 'users', firebaseUser.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        uid:          firebaseUser.uid,
        name:         firebaseUser.displayName || extra.name || '',
        email:        firebaseUser.email,
        phone:        extra.phone || '',
        photoURL:     firebaseUser.photoURL || '',
        createdAt:    serverTimestamp(),
        savedAddress: null,
        orderHistory: [],
      });
    }
  };

  // ── Sign up with email & password ────────────────────────────
  const signUp = async ({ name, email, password, phone }) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    await createUserDoc(cred.user, { name, phone });
    return cred.user;
  };

  // ── Sign in with email & password ────────────────────────────
  const signIn = async ({ email, password }) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
  };

  // ── Sign in with Google ──────────────────────────────────────
  const signInWithGoogle = async () => {
    const cred = await signInWithPopup(auth, googleProvider);
    await createUserDoc(cred.user);
    return cred.user;
  };

  // ── Sign out ─────────────────────────────────────────────────
  const logOut = () => signOut(auth);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signUp,
      signIn,
      signInWithGoogle,
      logOut,
    }}>
      { children}
    </AuthContext.Provider>
  );
};
