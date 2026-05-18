'use client';
// hooks/usePushNotifications.js

import { useEffect, useState } from 'react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const VAPID_KEY = 'BDtRhCCvBqrNKOJRXCy8mJr1fFMGOoV8hn3kj36pStMITGDRwhpIh_xDITtQVjyMsMFRFsLSUs-YdxwRye87tCg';

export function usePushNotifications(userId) {
  const [permission, setPermission] = useState('default');
  const [token, setToken]           = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);

  // Check current permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // Listen for foreground messages (when app is open)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let unsub;
    try {
      const { getApp } = require('firebase/app');
      const messaging = getMessaging(getApp());
      unsub = onMessage(messaging, (payload) => {
        const { title, body } = payload.notification || {};
        // Show browser notification even when app is open
        if (Notification.permission === 'granted') {
          new Notification(title || 'Dynamic Tower', {
            body:  body || 'Your order has been updated!',
            icon:  '/logo.png',
            badge: '/logo.png',
          });
        }
      });
    } catch (err) {
      // messaging not supported in this environment
    }
    return () => unsub?.();
  }, []);

  const requestPermission = async () => {
    if (typeof window === 'undefined') return;
    setLoading(true);
    setError(null);

    try {
      const { getApp }    = await import('firebase/app');
      const { getMessaging, getToken } = await import('firebase/messaging');

      const messaging = getMessaging(getApp());

      // Register service worker
      const swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

      // Request notification permission
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm !== 'granted') {
        setError('Notification permission denied.');
        setLoading(false);
        return;
      }

      // Get FCM token
      const fcmToken = await getToken(messaging, {
        vapidKey:            VAPID_KEY,
        serviceWorkerRegistration: swReg,
      });

      if (fcmToken) {
        setToken(fcmToken);
        // Save token to Firestore so admin can send targeted notifications
        if (userId) {
          await updateDoc(doc(db, 'users', userId), {
            fcmToken,
            notificationsEnabled: true,
          });
        }
      }
    } catch (err) {
      console.error('Push notification error:', err);
      setError('Could not enable notifications. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const disableNotifications = async () => {
    if (userId) {
      await updateDoc(doc(db, 'users', userId), {
        fcmToken:             null,
        notificationsEnabled: false,
      });
    }
    setToken(null);
  };

  return { permission, token, loading, error, requestPermission, disableNotifications };
}
