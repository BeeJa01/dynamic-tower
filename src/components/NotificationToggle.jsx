'use client';
// components/NotificationToggle.jsx

import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useAuth } from '@/context/AuthContext';

export default function NotificationToggle() {
  const { user } = useAuth();
  const { permission, token, loading, error, requestPermission, disableNotifications } =
    usePushNotifications(user?.uid);

  const isEnabled = permission === 'granted' && !!token;

  if (!user) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5
                    border border-gray-100 dark:border-gray-700 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl
            ${isEnabled ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
            🔔
          </div>
          <div>
            <p className="font-bold text-gray-900 dark:text-white text-sm">Order Notifications</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {isEnabled
                ? 'You\'ll be notified when your order status changes'
                : 'Get notified when your order is being prepared or delivered'}
            </p>
          </div>
        </div>

        {/* Toggle */}
        <button
          onClick={isEnabled ? disableNotifications : requestPermission}
          disabled={loading || permission === 'denied'}
          className={`relative w-12 h-6 rounded-full transition-all shrink-0
            ${isEnabled
              ? 'bg-orange-500'
              : 'bg-gray-300 dark:bg-gray-600'}
            ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            ${permission === 'denied' ? 'opacity-40 cursor-not-allowed' : ''}`}>
          <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow
                            transition-all duration-200
                            ${isEnabled ? 'left-6' : 'left-0.5'}`} />
        </button>
      </div>

      {/* Status messages */}
      {loading && (
        <p className="text-xs text-orange-500 mt-3 text-center">Enabling notifications...</p>
      )}
      {error && (
        <p className="text-xs text-red-400 mt-3">{error}</p>
      )}
      {permission === 'denied' && (
        <p className="text-xs text-red-400 mt-3">
          Notifications blocked. Enable them in your browser settings.
        </p>
      )}
      {isEnabled && (
        <p className="text-xs text-green-500 mt-3">
          ✅ Notifications enabled! You'll hear from us when your order moves.
        </p>
      )}
    </div>
  );
}
