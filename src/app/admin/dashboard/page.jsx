'use client';

// app/admin/dashboard/page.jsx
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  collection, onSnapshot, doc, updateDoc, deleteDoc, setDoc
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import { useAdminGuard } from '@/hooks/useAdminGuard';
import { FOOD_ITEMS } from '@/data/FoodData';

// ── Status config ────────────────────────────────────────────────
const ORDER_STATUSES = [
  { value: 'paid',      label: 'Payment Confirmed' },
  { value: 'preparing', label: 'Being Prepared'    },
  { value: 'delivery',  label: 'Out for Delivery'  },
  { value: 'delivered', label: 'Delivered'         },
  { value: 'cancelled', label: 'Cancelled'         },
];

const statusColor = (status) => ({
  paid:      'bg-blue-900/30 text-blue-400',
  preparing: 'bg-yellow-900/30 text-yellow-400',
  delivery:  'bg-purple-900/30 text-purple-400',
  delivered: 'bg-green-900/30 text-green-400',
  cancelled: 'bg-red-900/30 text-red-400',
}[status] || 'bg-gray-700 text-gray-400');

const statusLabel = (status) =>
  ORDER_STATUSES.find((s) => s.value === status)?.label || status || 'Unknown';

// ── Empty product template ───────────────────────────────────────
const emptyProduct = () => ({
  name: '', price: '', category: '', description: '', image: '', variants: [],
});

const emptyVariant = () => ({ label: '', weight: '', price: '', image: '' });

// ════════════════════════════════════════════════════════════════
const AdminDashboard = () => {
  const router = useRouter();
  const { isAdmin, checking } = useAdminGuard();

  const [activeTab, setActiveTab] = useState('overview');
  const [orders, setOrders]       = useState([]);
  const [customers, setCustomers] = useState([]);

  // ── Products state ───────────────────────────────────────────
  const [products, setProducts]   = useState(FOOD_ITEMS);
  const [editingIdx, setEditingIdx] = useState(null); // null = closed, -1 = new
  const [form, setForm]           = useState(emptyProduct());
  const [saving, setSaving]       = useState(false);
  const [saveMsg, setSaveMsg]     = useState('');
  const imageInputRef             = useRef();

  // ── Real-time Firestore listeners ────────────────────────────
  useEffect(() => {
    if (!isAdmin) return;
    const u1 = onSnapshot(collection(db, 'orders'), (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setOrders(data);
    });
    const u2 = onSnapshot(collection(db, 'users'), (snap) => {
      setCustomers(snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((u) => u.role !== 'admin'));
    });
    return () => { u1(); u2(); };
  }, [isAdmin]);

  // ── Stats ────────────────────────────────────────────────────
  const totalRevenue  = orders.reduce((s, o) => s + (o.total || 0), 0);
  const activeOrders  = orders.filter((o) => ['paid','preparing','delivery'].includes(o.status)).length;
  const delivered     = orders.filter((o) => o.status === 'delivered').length;

  // ── Order actions ────────────────────────────────────────────
  const updateOrderStatus = async (orderId, status) => {
    await updateDoc(doc(db, 'orders', orderId), { status });
  };
  const deleteOrder = async (orderId) => {
    if (!window.confirm('Delete this order?')) return;
    await deleteDoc(doc(db, 'orders', orderId));
  };

  // ── Product editor helpers ───────────────────────────────────
  const openEdit = (idx) => {
    if (idx === -1) {
      setForm(emptyProduct());
    } else {
      const p = products[idx];
      setForm({
        name:        p.name        || '',
        price:       p.price       || '',
        category:    p.category    || '',
        description: p.description || '',
        image:       p.image       || '',
        variants:    (p.variants || []).map((v) => ({ ...v })),
      });
    }
    setEditingIdx(idx);
    setSaveMsg('');
  };

  const closeEdit = () => { setEditingIdx(null); setSaveMsg(''); };

  // Image upload → convert to base64 data URL (stored in Firestore)
  // NOTE: for production you'd upload to Firebase Storage instead.
  const handleImageUpload = async (e, variantIdx = null) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 1MB for Firestore)
    if (file.size > 1_000_000) {
      alert('Image too large. Please use an image under 1MB, or use a /public path instead.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      if (variantIdx !== null) {
        // Variant image
        setForm((f) => {
          const variants = f.variants.map((v, i) =>
            i === variantIdx ? { ...v, image: dataUrl } : v
          );
          return { ...f, variants };
        });
      } else {
        // Main product image
        setForm((f) => ({ ...f, image: dataUrl }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Variant field change
  const updateVariant = (idx, key, value) => {
    setForm((f) => ({
      ...f,
      variants: f.variants.map((v, i) => i === idx ? { ...v, [key]: value } : v),
    }));
  };

  const addVariant    = () => setForm((f) => ({ ...f, variants: [...f.variants, emptyVariant()] }));
  const removeVariant = (idx) => setForm((f) => ({
    ...f, variants: f.variants.filter((_, i) => i !== idx),
  }));

  // Save product — updates local state + Firestore products collection
  const saveProduct = async () => {
    if (!form.name || !form.price) { setSaveMsg('Name and price are required.'); return; }
    setSaving(true);
    setSaveMsg('');

    const updated = {
      ...form,
      price:    Number(form.price),
      variants: form.variants.map((v) => ({ ...v, price: Number(v.price) || 0 })),
    };

    try {
      if (editingIdx === -1) {
        // New product
        const newId   = Date.now();
        const newItem = { id: newId, ...updated };
        await setDoc(doc(db, 'products', String(newId)), newItem);
        setProducts((prev) => [...prev, newItem]);
      } else {
        // Edit existing
        const product = products[editingIdx];
        const docRef  = doc(db, 'products', String(product.id));
        await setDoc(docRef, { id: product.id, ...updated }, { merge: true });
        setProducts((prev) =>
          prev.map((p, i) => i === editingIdx ? { ...p, ...updated } : p)
        );
      }
      setSaveMsg('✅ Saved successfully!');
      setTimeout(closeEdit, 1200);
    } catch (err) {
      console.error(err);
      setSaveMsg('❌ Save failed. Check console.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => { await signOut(auth); router.push('/admin'); };

  if (checking) return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
      <p className="text-gray-400">Verifying admin access...</p>
    </div>
  );

  const tabs = [
    { id: 'overview',  label: 'Overview',  icon: '📊' },
    { id: 'orders',    label: 'Orders',    icon: '📦' },
    { id: 'products',  label: 'Products',  icon: '🍔' },
    { id: 'customers', label: 'Customers', icon: '👥' },
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <div className="flex min-h-screen">

        {/* ── Sidebar ── */}
        <aside className="w-56 bg-[#1e293b] border-r border-gray-700 flex flex-col fixed h-full z-10">
          <div className="p-5 border-b border-gray-700 flex items-center gap-3">
            <div className="w-9 h-9 bg-[#E87121] rounded-xl flex items-center justify-center font-bold text-sm">DT</div>
            <div>
              <p className="font-bold text-white text-sm">Dynamic Tower</p>
              <p className="text-xs text-gray-400">Admin Panel</p>
            </div>
          </div>
          <nav className="flex-1 p-4 flex flex-col gap-1">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left
                  ${activeTab === tab.id ? 'bg-[#E87121] text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}>
                <span>{tab.icon}</span>{tab.label}
              </button>
            ))}
          </nav>
          <div className="p-4 border-t border-gray-700">
            <button onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-900/20 transition-all">
              🚪 Logout
            </button>
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="flex-1 md:ml-56 p-4 md:p-6">

          {/* Mobile tabs */}
          <div className="flex gap-2 mb-5 overflow-x-auto md:hidden pb-2">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap shrink-0
                  ${activeTab === tab.id ? 'bg-[#E87121] text-white' : 'bg-[#1e293b] text-gray-400'}`}>
                {tab.icon} {tab.label}
              </button>
            ))}
            <button onClick={handleLogout}
              className="ml-auto px-3 py-2 rounded-xl text-xs text-red-400 bg-[#1e293b] whitespace-nowrap shrink-0">
              🚪 Logout
            </button>
          </div>

          {/* ══ OVERVIEW ══ */}
          {activeTab === 'overview' && (
            <div>
              <h1 className="text-xl font-bold text-white mb-6">Dashboard Overview</h1>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Total Revenue', value: `₦${totalRevenue.toLocaleString()}`, icon: '💰', color: 'text-green-400' },
                  { label: 'Total Orders',  value: orders.length,   icon: '📦', color: 'text-blue-400'   },
                  { label: 'Active Orders', value: activeOrders,    icon: '⏳', color: 'text-yellow-400' },
                  { label: 'Delivered',     value: delivered,       icon: '✅', color: 'text-purple-400' },
                ].map((s) => (
                  <div key={s.label} className="bg-[#1e293b] rounded-2xl p-4 border border-gray-700">
                    <p className="text-2xl mb-1">{s.icon}</p>
                    <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-gray-400 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="bg-[#1e293b] rounded-2xl border border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                  <h2 className="font-bold text-white">Recent Orders</h2>
                  <button onClick={() => setActiveTab('orders')} className="text-xs text-[#E87121] hover:underline">View all</button>
                </div>
                <div className="divide-y divide-gray-700">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-white">#{order.id?.slice(0, 10)}</p>
                        <p className="text-xs text-gray-400">{order.customerName || 'Customer'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-[#E87121]">₦{(order.total || 0).toLocaleString()}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(order.status)}`}>
                          {statusLabel(order.status)}
                        </span>
                      </div>
                    </div>
                  ))}
                  {orders.length === 0 && <div className="p-8 text-center text-gray-500 text-sm">No orders yet</div>}
                </div>
              </div>
            </div>
          )}

          {/* ══ ORDERS ══ */}
          {activeTab === 'orders' && (
            <div>
              <h1 className="text-xl font-bold text-white mb-6">Orders ({orders.length})</h1>
              <div className="flex flex-col gap-3">
                {orders.length === 0 && (
                  <div className="bg-[#1e293b] rounded-2xl p-8 text-center text-gray-500">No orders yet</div>
                )}
                {orders.map((order) => (
                  <div key={order.id} className="bg-[#1e293b] rounded-2xl p-4 border border-gray-700">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-bold text-white text-sm">#{order.id}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{order.customerName || 'Unknown'} • {order.customerPhone || ''}</p>
                        <p className="text-xs text-gray-500">{order.customerEmail || ''}</p>
                        {order.createdAt && (
                          <p className="text-xs text-gray-600 mt-0.5">
                            {new Date(order.createdAt.seconds * 1000).toLocaleString()}
                          </p>
                        )}
                      </div>
                      <p className="font-bold text-[#E87121]">₦{(order.total || 0).toLocaleString()}</p>
                    </div>
                    {order.items?.length > 0 && (
                      <div className="mb-3 bg-[#0f172a] rounded-xl p-3">
                        {order.items.map((item, i) => (
                          <p key={i} className="text-xs text-gray-400">
                            • {item.name}{item.selectedVariant ? ` (${item.selectedVariant})` : ''} x{item.qty}
                            {' '}<span className="text-[#E87121]">₦{item.total?.toLocaleString()}</span>
                          </p>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-2 flex-wrap">
                      <select value={order.status || 'paid'}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="bg-[#0f172a] border border-gray-700 text-white text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#E87121]">
                        {ORDER_STATUSES.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor(order.status)}`}>
                        {statusLabel(order.status)}
                      </span>
                      <button onClick={() => deleteOrder(order.id)}
                        className="ml-auto text-xs text-red-400 hover:text-red-300 transition-colors">
                        🗑 Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ PRODUCTS ══ */}
          {activeTab === 'products' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-bold text-white">Products ({products.length})</h1>
                <button onClick={() => openEdit(-1)}
                  className="bg-[#E87121] hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all">
                  + Add Product
                </button>
              </div>

              {/* ── Product Editor Modal ── */}
              {editingIdx !== null && (
                <div className="fixed inset-0 z-50 bg-black/70 flex items-start justify-center p-4 overflow-y-auto">
                  <div className="bg-[#1e293b] rounded-2xl border border-gray-700 w-full max-w-2xl my-6">

                    {/* Header */}
                    <div className="flex items-center justify-between p-5 border-b border-gray-700">
                      <h2 className="font-bold text-white text-lg">
                        {editingIdx === -1 ? '➕ Add New Product' : '✏️ Edit Product'}
                      </h2>
                      <button onClick={closeEdit} className="text-gray-400 hover:text-white text-xl">✕</button>
                    </div>

                    <div className="p-5 flex flex-col gap-4 max-h-[75vh] overflow-y-auto">

                      {/* Basic fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                          { label: 'Product Name', key: 'name',     type: 'text',   placeholder: 'e.g. Jollof Rice' },
                          { label: 'Base Price (₦)', key: 'price',  type: 'number', placeholder: 'e.g. 3000'        },
                          { label: 'Category',     key: 'category', type: 'text',   placeholder: 'e.g. Rice'        },
                        ].map(({ label, key, type, placeholder }) => (
                          <div key={key}>
                            <label className="text-xs text-gray-400 uppercase tracking-widest mb-1 block">{label}</label>
                            <input type={type} placeholder={placeholder} value={form[key]}
                              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                              className="w-full px-3 py-2.5 rounded-xl bg-[#0f172a] border border-gray-700
                                         text-white text-sm focus:outline-none focus:border-[#E87121]" />
                          </div>
                        ))}

                        {/* Description full width */}
                        <div className="md:col-span-2">
                          <label className="text-xs text-gray-400 uppercase tracking-widest mb-1 block">Description</label>
                          <textarea rows={2} placeholder="Short description..." value={form.description}
                            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                            className="w-full px-3 py-2.5 rounded-xl bg-[#0f172a] border border-gray-700
                                       text-white text-sm focus:outline-none focus:border-[#E87121] resize-none" />
                        </div>
                      </div>

                      {/* ── Main Image ── */}
                      <div>
                        <label className="text-xs text-gray-400 uppercase tracking-widest mb-2 block">
                          Main Product Image
                        </label>
                        <div className="flex items-center gap-3">
                          {/* Preview */}
                          <div className="w-20 h-20 rounded-xl bg-[#0f172a] border border-gray-700
                                          overflow-hidden shrink-0 flex items-center justify-center">
                            {form.image
                              ? <img src={form.image} alt="preview" className="w-full h-full object-cover" />
                              : <span className="text-gray-600 text-xs text-center px-1">No image</span>
                            }
                          </div>
                          <div className="flex-1 flex flex-col gap-2">
                            {/* Upload button */}
                            <button onClick={() => imageInputRef.current?.click()}
                              className="bg-[#0f172a] border border-dashed border-gray-600 hover:border-[#E87121]
                                         text-gray-400 hover:text-white text-xs px-3 py-2 rounded-xl transition-all text-left">
                              📁 Upload image from device
                            </button>
                            <input ref={imageInputRef} type="file" accept="image/*" className="hidden"
                              onChange={(e) => handleImageUpload(e)} />
                            {/* OR type path */}
                            <input type="text" placeholder="or type /public path e.g. /food.webp"
                              value={form.image.startsWith('data:') ? '' : form.image}
                              onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                              className="w-full px-3 py-2 rounded-xl bg-[#0f172a] border border-gray-700
                                         text-white text-xs focus:outline-none focus:border-[#E87121]" />
                          </div>
                        </div>
                      </div>

                      {/* ── Variants ── */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-xs text-gray-400 uppercase tracking-widest">
                            Variants ({form.variants.length})
                          </label>
                          <button onClick={addVariant}
                            className="text-xs bg-[#E87121]/20 text-[#E87121] border border-[#E87121]/30
                                       px-3 py-1 rounded-lg hover:bg-[#E87121]/30 transition-all">
                            + Add Variant
                          </button>
                        </div>

                        {form.variants.length === 0 && (
                          <p className="text-xs text-gray-600 text-center py-4 bg-[#0f172a] rounded-xl">
                            No variants yet. Click `+ Add Variant` to add sizes or options.
                          </p>
                        )}

                        <div className="flex flex-col gap-3">
                          {form.variants.map((v, i) => (
                            <div key={i} className="bg-[#0f172a] rounded-xl p-3 border border-gray-700">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-bold text-gray-300">Variant {i + 1}</p>
                                <button onClick={() => removeVariant(i)}
                                  className="text-xs text-red-400 hover:text-red-300">✕ Remove</button>
                              </div>

                              <div className="grid grid-cols-2 gap-2 mb-2">
                                <div>
                                  <label className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 block">Label</label>
                                  <input type="text" placeholder="e.g. Small" value={v.label}
                                    onChange={(e) => updateVariant(i, 'label', e.target.value)}
                                    className="w-full px-2 py-1.5 rounded-lg bg-[#1e293b] border border-gray-700
                                               text-white text-xs focus:outline-none focus:border-[#E87121]" />
                                </div>
                                <div>
                                  <label className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 block">Weight/Size</label>
                                  <input type="text" placeholder="e.g. 500g" value={v.weight}
                                    onChange={(e) => updateVariant(i, 'weight', e.target.value)}
                                    className="w-full px-2 py-1.5 rounded-lg bg-[#1e293b] border border-gray-700
                                               text-white text-xs focus:outline-none focus:border-[#E87121]" />
                                </div>
                                <div>
                                  <label className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 block">Price (₦)</label>
                                  <input type="number" placeholder="e.g. 3000" value={v.price}
                                    onChange={(e) => updateVariant(i, 'price', e.target.value)}
                                    className="w-full px-2 py-1.5 rounded-lg bg-[#1e293b] border border-gray-700
                                               text-white text-xs focus:outline-none focus:border-[#E87121]" />
                                </div>
                                <div>
                                  <label className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 block">Image Path</label>
                                  <input type="text" placeholder="/image.webp" value={v.image?.startsWith('data:') ? '' : v.image}
                                    onChange={(e) => updateVariant(i, 'image', e.target.value)}
                                    className="w-full px-2 py-1.5 rounded-lg bg-[#1e293b] border border-gray-700
                                               text-white text-xs focus:outline-none focus:border-[#E87121]" />
                                </div>
                              </div>

                              {/* Variant image upload */}
                              <div className="flex items-center gap-2">
                                {v.image && (
                                  <img src={v.image} alt={v.label}
                                    className="w-10 h-10 rounded-lg object-cover border border-gray-700 shrink-0" />
                                )}
                                <label className="flex-1 cursor-pointer bg-[#1e293b] border border-dashed border-gray-600
                                                  hover:border-[#E87121] text-gray-500 hover:text-gray-300
                                                  text-xs px-2 py-1.5 rounded-lg transition-all">
                                  📁 Upload variant image
                                  <input type="file" accept="image/*" className="hidden"
                                    onChange={(e) => handleImageUpload(e, i)} />
                                </label>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Save message */}
                      {saveMsg && (
                        <p className={`text-sm text-center font-medium
                          ${saveMsg.startsWith('✅') ? 'text-green-400' : 'text-red-400'}`}>
                          {saveMsg}
                        </p>
                      )}

                      {/* Actions */}
                      <div className="flex gap-3 pt-2">
                        <button onClick={saveProduct} disabled={saving}
                          className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all
                            ${saving ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                     : 'bg-[#E87121] hover:bg-orange-600 text-white'}`}>
                          {saving ? 'Saving...' : '💾 Save Product'}
                        </button>
                        <button onClick={closeEdit}
                          className="px-5 py-3 rounded-xl text-sm bg-gray-700 text-gray-300 hover:bg-gray-600 transition-all">
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Product grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {products.map((product, i) => (
                  <div key={product.id}
                    className="bg-[#1e293b] rounded-2xl p-4 border border-gray-700 flex items-center gap-4">
                    <img src={product.image} alt={product.name}
                      className="w-16 h-16 rounded-xl object-cover bg-gray-700 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-sm truncate">{product.name}</p>
                      <p className="text-xs text-gray-400">{product.category}</p>
                      <p className="text-sm font-bold text-[#E87121] mt-0.5">
                        ₦{product.price?.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {product.variants?.length || 0} variant{product.variants?.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <button onClick={() => openEdit(i)}
                      className="text-xs text-[#E87121] hover:underline shrink-0 px-3 py-1.5
                                 bg-[#E87121]/10 rounded-lg hover:bg-[#E87121]/20 transition-all">
                      ✏️ Edit
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ CUSTOMERS ══ */}
          {activeTab === 'customers' && (
            <div>
              <h1 className="text-xl font-bold text-white mb-6">Customers ({customers.length})</h1>
              <div className="flex flex-col gap-3">
                {customers.length === 0 && (
                  <div className="bg-[#1e293b] rounded-2xl p-8 text-center text-gray-500">No customers yet</div>
                )}
                {customers.map((customer) => (
                  <div key={customer.id}
                    className="bg-[#1e293b] rounded-2xl p-4 border border-gray-700 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-orange-900/30 flex items-center
                                    justify-center text-[#E87121] font-bold shrink-0">
                      {customer.photoURL
                        ? <img src={customer.photoURL} alt={customer.name} className="w-full h-full rounded-full object-cover" />
                        : (customer.name || customer.email || 'U')[0].toUpperCase()
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-sm truncate">{customer.name || 'No name'}</p>
                      <p className="text-xs text-gray-400 truncate">{customer.email}</p>
                      <p className="text-xs text-gray-500">{customer.phone || 'No phone'}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-gray-400">{customer.orderHistory?.length || 0} orders</p>
                      <span className="text-xs bg-green-900/30 text-green-400 px-2 py-0.5 rounded-full">Active</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
