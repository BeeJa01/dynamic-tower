'use client';

// hooks/useAdminGuard.js
// ── Protects admin pages — redirects non-admins away ────────────
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export const useAdminGuard = () => {
  const router = useRouter();
  const [isAdmin, setIsAdmin]   = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/admin');
        return;
      }
      const snap = await getDoc(doc(db, 'users', user.uid));
      const data = snap.data();
      if (data?.role === 'admin') {
        setIsAdmin(true);
      } else {
        router.push('/admin');
      }
      setChecking(false);
    });
    return unsub;
  }, []);

  return { isAdmin, checking };
};
