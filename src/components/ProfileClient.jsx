'use client';
// app/profile/page.jsx

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { doc, updateDoc, collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { db, storage, auth } from '@/lib/firebase';
import NotificationToggle from '@/components/NotificationToggle';

const statusColor = (status) => ({
  delivered: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  delivery:  'bg-purple-100 dark:bg-purple-900/30 text-purple-500 dark:text-purple-400',
  preparing: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
  paid:      'bg-blue-100 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400',
  cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400',
}[status?.toLowerCase()] || 'bg-gray-100 dark:bg-gray-700 text-gray-500');

const statusLabel = (status) => ({
  delivered: '✅ Delivered',
  delivery:  '🛵 Out for Delivery',
  preparing: '👨‍🍳 Being Prepared',
  paid:      '💳 Payment Confirmed',
  cancelled: '❌ Cancelled',
}[status?.toLowerCase()] || status || 'Processing');

export default function ProfileClient() {
  const router           = useRouter();
  const { user, logOut } = useAuth();
  const fileRef          = useRef();

  const [activeTab, setActiveTab] = useState('profile');
  const [editing, setEditing]     = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [expanded, setExpanded]   = useState(null); // expanded order id

  const [orderHistory, setOrderHistory]   = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError]     = useState(null);

  const [form, setForm] = useState({
    name:  user?.displayName || user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
  });

  // ── Fetch orders using 'uid' field (matches order-confirmation save) ──
  useEffect(() => {
    if (!user?.uid || activeTab !== 'orders') return;
    const fetchOrders = async () => {
      setOrdersLoading(true);
      setOrdersError(null);
      try {
        const q = query(
          collection(db, 'orders'),
          where('uid', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        const fetched = snapshot.docs.map((docSnap) => {
          const d = docSnap.data();
          return {
            id:        docSnap.id,
            orderId:   d.orderId || docSnap.id,
            date:      d.createdAt?.toDate?.().toLocaleDateString('en-GB', {
                         day: 'numeric', month: 'long', year: 'numeric',
                         hour: '2-digit', minute: '2-digit',
                       }) ?? '—',
            items:     Array.isArray(d.items) ? d.items : [],
            total:     d.total ?? 0,
            status:    d.status ?? 'paid',
          };
        });
        setOrderHistory(fetched);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        setOrdersError('Could not load orders. Please try again.');
      } finally {
        setOrdersLoading(false);
      }
    };
    fetchOrders();
  }, [user?.uid, activeTab]);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const storageRef = ref(storage, `profile-photos/${user.uid}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await updateProfile(auth.currentUser, { photoURL: url });
      await updateDoc(doc(db, 'users', user.uid), { photoURL: url });
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile(auth.currentUser, { displayName: form.name });
      await updateDoc(doc(db, 'users', user.uid), { name: form.name, phone: form.phone });
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logOut();
    router.push('/');
  };

  const savedAddress =
    user?.savedAddress ||
    (typeof window !== 'undefined'
      ? JSON.parse(sessionStorage.getItem('dt_delivery_address') || 'null')
      : null);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'orders',  label: 'Orders',  icon: '📦' },
    { id: 'address', label: 'Address', icon: '📍' },
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center
                      bg-amber-50 dark:bg-gray-950 px-4 text-center">
        <span className="text-5xl mb-4">🔒</span>
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Please login first</h2>
        <button onClick={() => router.push('/login')}
          className="mt-4 bg-[#E87121] text-white px-6 py-3 rounded-full
                     text-sm font-medium hover:bg-orange-600 transition-all">
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50 dark:bg-gray-950 py-8 px-4">
      <div className="max-w-lg mx-auto flex flex-col gap-5">

        {/* ── Profile Header ── */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6
                        border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-orange-100
                              dark:bg-orange-900/30 flex items-center justify-center">
                {user.photoURL ? (
                  <Image src={user.photoURL} alt="Profile" width={80} height={80}
                    className="w-full h-full object-cover rounded-full" />
                ) : (
                  <span className="text-3xl font-bold text-[#E87121]">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </span>
                )}
              </div>
              <button onClick={() => fileRef.current.click()} disabled={uploading}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full
                           bg-[#E87121] text-white flex items-center justify-center
                           text-xs shadow-md hover:bg-orange-600 transition-all">
                {uploading ? '⏳' : '📷'}
              </button>
              <input ref={fileRef} type="file" accept="image/*"
                onChange={handlePhotoUpload} className="hidden" />
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="font-black text-gray-900 dark:text-white truncate">
                {user.displayName || user.name || 'User'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
              {orderHistory.length > 0 && (
                <p className="text-xs text-[#E87121] font-medium mt-0.5">
                  {orderHistory.length} order{orderHistory.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            <button onClick={handleLogout}
              className="text-xs text-red-400 font-semibold hover:underline shrink-0">
              Logout
            </button>
          </div>

          {/* Tab Bar */}
          <div className="flex gap-2 mt-5">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl
                            text-xs font-bold transition-all
                  ${activeTab === tab.id
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Profile Tab ── */}
        {activeTab === 'profile' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5
                          border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-gray-900 dark:text-white">Personal Info</h2>
              {!editing ? (
                <button onClick={() => setEditing(true)}
                  className="text-xs text-[#E87121] font-semibold hover:underline">Edit</button>
              ) : (
                <button onClick={() => setEditing(false)}
                  className="text-xs text-gray-400 hover:underline">Cancel</button>
              )}
            </div>
            <NotificationToggle />

            {editing ? (
              <div className="flex flex-col gap-4">
                {[
                  { label: 'Full Name', name: 'name',  type: 'text', placeholder: 'Your name'   },
                  { label: 'Phone',     name: 'phone', type: 'tel',  placeholder: '08012345678' },
                ].map(({ label, name, type, placeholder }) => (
                  <div key={name}>
                    <label className="text-xs font-semibold uppercase tracking-widest
                                       text-gray-400 mb-1.5 block">{label}</label>
                    <input type={type} name={name} placeholder={placeholder} value={form[name]}
                      onChange={(e) => setForm((p) => ({ ...p, [name]: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200
                                 dark:border-gray-700 dark:bg-gray-900 dark:text-white
                                 focus:outline-none focus:border-[#E87121] text-sm" />
                  </div>
                ))}
                <button onClick={handleSave} disabled={saving}
                  className="bg-[#E87121] hover:bg-orange-600 text-white py-3
                             rounded-xl font-bold text-sm transition-all active:scale-95">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                {saved && <p className="text-green-500 text-sm text-center">✅ Profile updated!</p>}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {[
                  { label: 'Name',  value: user.displayName || user.name || '—' },
                  { label: 'Email', value: user.email },
                  { label: 'Phone', value: user.phone || '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between py-3
                                              border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Orders Tab ── */}
        {activeTab === 'orders' && (
          <div className="flex flex-col gap-3">
            {ordersLoading ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-10 text-center
                              border border-gray-100 dark:border-gray-700">
                <p className="text-3xl animate-bounce mb-3">📦</p>
                <p className="text-gray-400 text-sm">Loading your orders…</p>
              </div>

            ) : ordersError ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center
                              border border-red-100 dark:border-red-900">
                <p className="text-3xl mb-3">⚠️</p>
                <p className="text-red-400 text-sm">{ordersError}</p>
                <button onClick={() => setActiveTab('orders')}
                  className="mt-3 text-xs text-[#E87121] hover:underline">Try again</button>
              </div>

            ) : orderHistory.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-10 text-center
                              border border-gray-100 dark:border-gray-700">
                <p className="text-5xl mb-3">🍽️</p>
                <p className="font-bold text-gray-700 dark:text-white mb-1">No orders yet</p>
                <p className="text-gray-400 text-sm mb-5">Place your first order and it`ll appear here!</p>
                <button onClick={() => router.push('/product')}
                  className="bg-[#E87121] text-white px-6 py-3 rounded-full
                             text-sm font-bold hover:bg-orange-600 transition-all">
                  Browse Menu 🍔
                </button>
              </div>

            ) : (
              <>
                <p className="text-xs text-gray-400 px-1">{orderHistory.length} order{orderHistory.length !== 1 ? 's' : ''} found</p>
                {orderHistory.map((order) => (
                  <div key={order.id}
                    className="bg-white dark:bg-gray-800 rounded-2xl
                               border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">

                    {/* Order Header */}
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white text-sm">
                            #{order.orderId}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">{order.date}</p>
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0
                                          ${statusColor(order.status)}`}>
                          {statusLabel(order.status)}
                        </span>
                      </div>

                      {/* Item names preview */}
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mb-3">
                        {order.items.map((i) => i.name).join(' • ') || 'No items'}
                      </p>

                      <div className="flex justify-between items-center">
                        <span className="font-black text-[#E87121] text-base">
                          ₦{order.total.toLocaleString()}
                        </span>
                        <button
                          onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                          className="text-xs text-gray-400 hover:text-[#E87121] transition-colors font-medium">
                          {expanded === order.id ? 'Hide details ▲' : 'View details ▼'}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Items */}
                    {expanded === order.id && (
                      <div className="border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4">
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">
                          Items Ordered
                        </p>
                        <div className="flex flex-col gap-2">
                          {order.items.map((item, i) => (
                            <div key={i} className="flex justify-between items-center">
                              <div className="flex items-center gap-2 min-w-0">
                                {item.image && (
                                  <img src={item.image} alt={item.name}
                                    className="w-9 h-9 rounded-lg object-cover shrink-0
                                               border border-gray-200 dark:border-gray-700" />
                                )}
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                                    {item.name}
                                  </p>
                                  {item.selectedVariant && (
                                    <p className="text-xs text-gray-400">{item.selectedVariant}</p>
                                  )}
                                  <p className="text-xs text-gray-400">Qty: {item.qty}</p>
                                </div>
                              </div>
                              <p className="text-sm font-bold text-[#E87121] shrink-0 ml-2">
                                ₦{item.total?.toLocaleString()}
                              </p>
                            </div>
                          ))}
                        </div>

                        {/* Reorder Button */}
                        <button onClick={() => router.push('/product')}
                          className="w-full mt-4 py-2.5 rounded-xl bg-orange-50 dark:bg-orange-900/20
                                     text-[#E87121] text-sm font-bold border border-orange-200
                                     dark:border-orange-700 hover:bg-orange-100 transition-all">
                          🔄 Reorder
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* ── Address Tab ── */}
        {activeTab === 'address' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5
                          border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-gray-900 dark:text-white">Saved Address</h2>
              <button onClick={() => router.push('/delivery-address')}
                className="text-xs text-[#E87121] font-semibold hover:underline">
                {savedAddress ? 'Edit' : '+ Add'}
              </button>
            </div>
            {savedAddress ? (
              <div className="flex flex-col gap-2">
                {[
                  { label: 'Name',     value: savedAddress.fullName  },
                  { label: 'Phone',    value: savedAddress.phone     },
                  { label: 'State',    value: savedAddress.state     },
                  { label: 'City',     value: savedAddress.city      },
                  { label: 'Address',  value: savedAddress.address   },
                  { label: 'Landmark', value: savedAddress.landmark || '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between py-2.5
                                              border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white text-right max-w-[60%]">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <span className="text-4xl mb-3 block">📍</span>
                <p className="text-gray-400 text-sm mb-4">No saved address yet.</p>
                <button onClick={() => router.push('/delivery-address')}
                  className="bg-[#E87121] text-white px-5 py-2.5 rounded-full
                             text-sm font-medium hover:bg-orange-600 transition-all">
                  Add Address
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
