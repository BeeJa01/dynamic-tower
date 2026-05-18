'use client';

// app/admin/dashboard/page.jsx
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  collection, onSnapshot, doc, updateDoc, deleteDoc, setDoc, getDocs
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import { useAdminGuard } from '@/hooks/useAdminGuard';
import { FOOD_ITEMS } from '@/data/FoodData';

const LOW_STOCK_THRESHOLD = 10; // products with stock ≤ this are flagged

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

const emptyProduct = () => ({ name: '', price: '', category: '', description: '', image: '', variants: [] });
const emptyVariant = () => ({ label: '', weight: '', price: '', image: '' });

// ── Revenue Chart (pure SVG, no library needed) ──────────────────
function RevenueChart({ orders }) {
  const [period, setPeriod] = useState('7d');

  const chartData = (() => {
    const now   = new Date();
    const days  = period === '7d' ? 7 : period === '30d' ? 30 : 12;
    const isMonthly = period === '12m';

    if (isMonthly) {
      // Last 12 months
      return Array.from({ length: 12 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
        const label = d.toLocaleString('default', { month: 'short' });
        const revenue = orders
          .filter((o) => {
            if (!o.createdAt?.seconds) return false;
            const od = new Date(o.createdAt.seconds * 1000);
            return od.getFullYear() === d.getFullYear() && od.getMonth() === d.getMonth();
          })
          .reduce((s, o) => s + (o.total || 0), 0);
        return { label, revenue };
      });
    }

    // Last N days
    return Array.from({ length: days }, (_, i) => {
      const d = new Date(now);
      d.setDate(now.getDate() - (days - 1 - i));
      const label = period === '7d'
        ? d.toLocaleString('default', { weekday: 'short' })
        : `${d.getDate()}/${d.getMonth() + 1}`;
      const revenue = orders
        .filter((o) => {
          if (!o.createdAt?.seconds) return false;
          const od = new Date(o.createdAt.seconds * 1000);
          return od.toDateString() === d.toDateString();
        })
        .reduce((s, o) => s + (o.total || 0), 0);
      return { label, revenue };
    });
  })();

  const maxRevenue = Math.max(...chartData.map((d) => d.revenue), 1);
  const totalPeriod = chartData.reduce((s, d) => s + d.revenue, 0);
  const avgPerDay   = Math.round(totalPeriod / chartData.length);
  const bestDay     = chartData.reduce((a, b) => (b.revenue > a.revenue ? b : a), chartData[0]);

  // SVG chart dimensions
  const W = 600, H = 160, PAD = 10;
  const colW = W / chartData.length;

  const points = chartData.map((d, i) => {
    const x = i * colW + colW / 2;
    const y = H - PAD - ((d.revenue / maxRevenue) * (H - PAD * 2));
    return { x, y, ...d };
  });

  const polyline = points.map((p) => `${p.x},${p.y}`).join(' ');
  const area = `${points[0]?.x},${H} ${polyline} ${points[points.length - 1]?.x},${H}`;

  return (
    <div className="bg-[#1e293b] rounded-2xl border border-gray-700 p-5 mb-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h2 className="font-bold text-white text-base">Revenue Chart</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Total: <span className="text-[#E87121] font-bold">₦{totalPeriod.toLocaleString()}</span>
            <span className="ml-3">Avg: <span className="text-green-400 font-bold">₦{avgPerDay.toLocaleString()}</span></span>
          </p>
        </div>
        {/* Period toggle */}
        <div className="flex gap-1 bg-[#0f172a] rounded-xl p-1">
          {[
            { value: '7d',  label: '7D'  },
            { value: '30d', label: '30D' },
            { value: '12m', label: '12M' },
          ].map((p) => (
            <button key={p.value} onClick={() => setPeriod(p.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all
                ${period === p.value
                  ? 'bg-[#E87121] text-white'
                  : 'text-gray-400 hover:text-white'}`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Chart */}
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H + 30}`} className="w-full min-w-75" style={{ height: 180 }}>
          <defs>
            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#E87121" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#E87121" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0.25, 0.5, 0.75, 1].map((t) => {
            const y = H - PAD - t * (H - PAD * 2);
            return (
              <g key={t}>
                <line x1={0} y1={y} x2={W} y2={y} stroke="#1e3a5f" strokeWidth="1" strokeDasharray="4,4" />
                <text x={2} y={y - 3} fill="#4b6280" fontSize="9">
                  ₦{(maxRevenue * t / 1000).toFixed(0)}k
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          {points.length > 1 && (
            <polygon points={area} fill="url(#revenueGrad)" />
          )}

          {/* Line */}
          {points.length > 1 && (
            <polyline
              points={polyline}
              fill="none"
              stroke="#E87121"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data points & labels */}
          {points.map((p, i) => (
            <g key={i}>
              {/* Bar (subtle) */}
              <rect
                x={p.x - colW * 0.3}
                y={p.y}
                width={colW * 0.6}
                height={H - PAD - p.y}
                fill="#E87121"
                opacity="0.07"
                rx="2"
              />
              {/* Dot */}
              <circle cx={p.x} cy={p.y} r={p.revenue > 0 ? 3 : 2}
                fill={p.revenue > 0 ? '#E87121' : '#374151'}
                stroke="#0f172a" strokeWidth="1.5" />
              {/* X-axis label */}
              <text x={p.x} y={H + 20} textAnchor="middle" fill="#6b7280" fontSize="9">
                {p.label}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-2 mt-3">
        <div className="bg-[#0f172a] rounded-xl p-3 text-center">
          <p className="text-xs text-gray-500 mb-1">Best Day</p>
          <p className="text-xs font-bold text-white truncate">{bestDay?.label}</p>
          <p className="text-xs text-[#E87121] font-bold">₦{(bestDay?.revenue || 0).toLocaleString()}</p>
        </div>
        <div className="bg-[#0f172a] rounded-xl p-3 text-center">
          <p className="text-xs text-gray-500 mb-1">Period Total</p>
          <p className="text-sm font-bold text-green-400">₦{totalPeriod.toLocaleString()}</p>
        </div>
        <div className="bg-[#0f172a] rounded-xl p-3 text-center">
          <p className="text-xs text-gray-500 mb-1">Daily Avg</p>
          <p className="text-sm font-bold text-blue-400">₦{avgPerDay.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}


// ── Print Receipt Modal ──────────────────────────────────────────
function PrintReceiptModal({ order, onClose }) {
  const printRef = useRef();

  const handlePrint = () => {
    const content = printRef.current?.innerHTML;
    if (!content) return;
    const win = window.open('', '_blank', 'width=480,height=700');
    win.document.write(`<!DOCTYPE html><html><head><title>Receipt - ${order.orderId || order.id}</title><style>* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: 'Courier New', monospace; font-size: 12px; color: #000; background: #fff; padding: 20px; max-width: 380px; margin: 0 auto; } .dashed { border-bottom: 1px dashed #aaa; margin: 8px 0; padding-bottom: 8px; } .row { display: flex; justify-content: space-between; margin-bottom: 3px; } .total-row { display: flex; justify-content: space-between; font-weight: bold; font-size: 14px; border-top: 2px solid #000; padding-top: 8px; margin-top: 4px; } .center { text-align: center; } .muted { color: #555; font-size: 10px; } .item-name { flex: 1; margin-right: 8px; }</style></head><body>${content}</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 400);
  };

  const orderDate = order.createdAt?.seconds
    ? new Date(order.createdAt.seconds * 1000).toLocaleString()
    : 'N/A';
  const subtotal = order.items?.reduce((s, i) => s + (i.total || 0), 0) || order.total || 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
        <div className="bg-[#1e293b] px-4 py-3 flex items-center justify-between">
          <p className="text-white font-bold text-sm">🧾 Receipt Preview</p>
          <div className="flex gap-2">
            <button onClick={handlePrint}
              className="bg-[#E87121] hover:bg-orange-600 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition-all">
              🖨️ Print
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-white text-lg leading-none px-1">✕</button>
          </div>
        </div>
        <div ref={printRef} className="p-5 font-mono text-xs text-black bg-white">
          <div className="center mb-3 pb-3" style={{borderBottom:'2px dashed #aaa'}}>
            <div style={{fontSize:16,fontWeight:'bold',letterSpacing:3}}>DYNAMIC TOWER</div>
            <div className="muted">Multipurpose LTD</div>
            <div className="muted">Tel: 08000000000</div>
            <div className="muted" style={{marginTop:4}}>━━━━━━━━━━━━━━━━━━━━━━</div>
            <div style={{fontWeight:'bold',marginTop:4}}>ORDER RECEIPT</div>
          </div>
          <div className="dashed">
            <div className="row"><span className="muted">Order #</span><span style={{fontWeight:'bold'}}>{order.orderId || order.id}</span></div>
            <div className="row"><span className="muted">Date</span><span>{orderDate}</span></div>
            <div className="row"><span className="muted">Customer</span><span style={{fontWeight:'500'}}>{order.customerName || 'Guest'}</span></div>
            {order.customerPhone && <div className="row"><span className="muted">Phone</span><span>{order.customerPhone}</span></div>}
            <div className="row"><span className="muted">Status</span><span style={{fontWeight:'bold',textTransform:'uppercase'}}>{order.status || 'paid'}</span></div>
          </div>
          <div className="dashed">
            <div className="muted" style={{textTransform:'uppercase',letterSpacing:1,marginBottom:6}}>Items Ordered</div>
            {order.items?.map((item, i) => (
              <div key={i} style={{marginBottom:6}}>
                <div className="row"><span className="item-name" style={{fontWeight:'500'}}>{item.name}</span><span style={{fontWeight:'bold'}}>₦{(item.total||0).toLocaleString()}</span></div>
                <div className="muted">{item.selectedVariant ? `(${item.selectedVariant}) ` : ''}x{item.qty||1} @ ₦{(item.price||0).toLocaleString()}</div>
              </div>
            ))}
          </div>
          <div style={{marginTop:8}}>
            <div className="row"><span className="muted">Subtotal</span><span>₦{subtotal.toLocaleString()}</span></div>
            <div className="row"><span className="muted">Delivery Fee</span><span style={{color:'green',fontWeight:'500'}}>FREE</span></div>
            <div className="total-row"><span>TOTAL PAID</span><span>₦{(order.total||subtotal).toLocaleString()}</span></div>
          </div>
          <div className="center muted" style={{marginTop:14,paddingTop:10,borderTop:'1px dashed #aaa'}}>
            <div>━━━━━━━━━━━━━━━━━━━━━━</div>
            <div style={{fontWeight:'bold',fontSize:13,marginTop:4}}>Thank you for your order! 🙏</div>
            <div>We hope to serve you again soon.</div>
            <div style={{marginTop:4}}>Powered by Dynamic Tower</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Low Stock Alerts Tab ─────────────────────────────────────────
function LowStockTab({ products }) {
  const [stockMap, setStockMap]   = useState({});
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving]       = useState(false);
  const [threshold, setThreshold] = useState(LOW_STOCK_THRESHOLD);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'stock'), (snap) => {
      const map = {};
      snap.docs.forEach((d) => { map[d.id] = d.data().quantity ?? 0; });
      setStockMap(map);
    });
    return unsub;
  }, []);

  const getStock = (id) => {
    const val = stockMap[String(id)];
    return val !== undefined ? val : null;
  };

  const lowStockProducts  = products.filter((p) => { const s = getStock(p.id); return s !== null && s <= threshold; });
  const okProducts        = products.filter((p) => { const s = getStock(p.id); return s !== null && s > threshold; });
  const untrackedProducts = products.filter((p) => getStock(p.id) === null);

  const startEdit = (product) => {
    setEditingId(String(product.id));
    setEditValue(String(getStock(product.id) ?? ''));
  };

  const saveStock = async (productId) => {
    const qty = parseInt(editValue, 10);
    if (isNaN(qty) || qty < 0) return;
    setSaving(true);
    try {
      await setDoc(doc(db, 'stock', String(productId)), { quantity: qty, productId: String(productId), updatedAt: new Date() }, { merge: true });
      setEditingId(null);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const StockRow = ({ product }) => {
    const stock      = getStock(product.id);
    const isEditing  = editingId === String(product.id);
    const isCritical = stock !== null && stock <= 3;
    const isLow      = stock !== null && stock <= threshold && !isCritical;

    return (
      <div className={`bg-[#1e293b] rounded-2xl p-4 border flex items-center gap-3 transition-all
        ${isCritical ? 'border-red-500/50' : isLow ? 'border-yellow-500/40' : 'border-gray-700'}`}>
        <img src={product.image} alt={product.name} className="w-12 h-12 rounded-xl object-cover bg-gray-700 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white truncate">{product.name}</p>
          <p className="text-xs text-gray-400">{product.category}</p>
          {stock !== null
            ? <span className={`text-xs font-bold px-2 py-0.5 rounded-full mt-1 inline-block
                ${isCritical ? 'bg-red-900/40 text-red-400' : isLow ? 'bg-yellow-900/30 text-yellow-400' : 'bg-green-900/30 text-green-400'}`}>
                {isCritical ? '🔴 Critical' : isLow ? '🟡 Low' : '🟢 OK'} — {stock} left
              </span>
            : <span className="text-xs text-gray-600 mt-1 inline-block">Not tracked yet</span>
          }
        </div>
        <div className="shrink-0 flex items-center gap-2">
          {isEditing ? (
            <>
              <input type="number" min="0" value={editValue} autoFocus
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && saveStock(product.id)}
                className="w-16 bg-[#0f172a] border border-[#E87121] text-white text-xs rounded-lg px-2 py-1.5 text-center focus:outline-none" />
              <button onClick={() => saveStock(product.id)} disabled={saving}
                className="text-xs bg-[#E87121] text-white px-3 py-1.5 rounded-lg font-bold hover:bg-orange-600 transition-all disabled:opacity-50">
                {saving ? '…' : '✓'}
              </button>
              <button onClick={() => setEditingId(null)} className="text-xs text-gray-500 hover:text-gray-300">✕</button>
            </>
          ) : (
            <button onClick={() => startEdit(product)}
              className="text-xs text-[#E87121] px-3 py-1.5 bg-[#E87121]/10 rounded-lg hover:bg-[#E87121]/20 transition-all font-medium whitespace-nowrap">
              {stock === null ? '+ Set Stock' : '✏️ Update'}
            </button>
          )}
        </div>
      </div>
    );
  };

  const criticalCount = lowStockProducts.filter((p) => (getStock(p.id) ?? 0) <= 3).length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            Stock Alerts
            {lowStockProducts.length > 0 && (
              <span className="text-sm bg-red-900/40 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full">
                {lowStockProducts.length} low
              </span>
            )}
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">Track inventory and get alerted when stock runs low</p>
        </div>
        <div className="flex items-center gap-2 bg-[#1e293b] border border-gray-700 rounded-xl px-3 py-2">
          <span className="text-xs text-gray-400">Alert when ≤</span>
          <input type="number" min="1" max="50" value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="w-12 bg-[#0f172a] border border-gray-700 text-white text-xs rounded-lg px-2 py-1 text-center focus:outline-none focus:border-[#E87121]" />
          <span className="text-xs text-gray-400">units</span>
        </div>
      </div>

      {lowStockProducts.length > 0 && (
        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-2xl p-4 mb-5 flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="text-yellow-400 font-bold text-sm">
              {criticalCount > 0
                ? `🔴 ${criticalCount} product(s) critically low (3 or fewer units)!`
                : `${lowStockProducts.length} product(s) running low`}
            </p>
            <p className="text-xs text-yellow-500/70 mt-0.5">Update stock counts below or restock soon.</p>
          </div>
        </div>
      )}

      {lowStockProducts.length === 0 && untrackedProducts.length === 0 && (
        <div className="bg-[#1e293b] rounded-2xl p-8 text-center text-green-400 border border-green-900/30 mb-5">
          <p className="text-3xl mb-2">✅</p>
          <p className="font-bold">All stocked up!</p>
          <p className="text-xs text-gray-400 mt-1">No products below the alert threshold.</p>
        </div>
      )}

      {lowStockProducts.length > 0 && (
        <div className="mb-6">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">⚠️ Needs Attention</p>
          <div className="flex flex-col gap-3">
            {lowStockProducts.map((p) => <StockRow key={p.id} product={p} />)}
          </div>
        </div>
      )}

      {okProducts.length > 0 && (
        <div className="mb-6">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">🟢 In Stock</p>
          <div className="flex flex-col gap-3">
            {okProducts.map((p) => <StockRow key={p.id} product={p} />)}
          </div>
        </div>
      )}

      {untrackedProducts.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">📦 Not Yet Tracked</p>
          <div className="flex flex-col gap-3">
            {untrackedProducts.map((p) => <StockRow key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
const AdminDashboard = () => {
  const router = useRouter();
  const { isAdmin, checking } = useAdminGuard();

  const [activeTab, setActiveTab]     = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orders, setOrders]           = useState([]);
  const [customers, setCustomers]     = useState([]);

  const [products, setProducts]       = useState(FOOD_ITEMS);
  const [editingIdx, setEditingIdx]   = useState(null);
  const [form, setForm]               = useState(emptyProduct());
  const [saving, setSaving]           = useState(false);
  const [saveMsg, setSaveMsg]         = useState('');
  const imageInputRef                 = useRef();

  useEffect(() => {
    if (!isAdmin) return;

    const mergeProducts = (firestoreDocs) => {
      const firestoreProducts = firestoreDocs.map((d) => ({ ...d.data(), id: d.id }));
      const hardcodedIds = new Set(FOOD_ITEMS.map((p) => String(p.id)));
      const newOnly = firestoreProducts.filter((p) => !hardcodedIds.has(String(p.id)));
      setProducts([...FOOD_ITEMS, ...newOnly]);
    };

    const unsubProducts  = onSnapshot(collection(db, 'products'), (snap) => mergeProducts(snap.docs));
    const unsubOrders    = onSnapshot(collection(db, 'orders'), (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setOrders(data);
    });
    const unsubCustomers = onSnapshot(collection(db, 'users'), (snap) => {
      setCustomers(snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((u) => u.role !== 'admin'));
    });

    return () => { unsubProducts(); unsubOrders(); unsubCustomers(); };
  }, [isAdmin]);

  const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0);
  const activeOrders = orders.filter((o) => ['paid','preparing','delivery'].includes(o.status)).length;
  const delivered    = orders.filter((o) => o.status === 'delivered').length;

  const updateOrderStatus = async (orderId, status) => updateDoc(doc(db, 'orders', orderId), { status });
  const deleteOrder = async (orderId) => {
    if (!window.confirm('Delete this order?')) return;
    await deleteDoc(doc(db, 'orders', orderId));
  };

  const openEdit = (idx) => {
    if (idx === -1) { setForm(emptyProduct()); }
    else {
      const p = products[idx];
      setForm({ name: p.name || '', price: p.price || '', category: p.category || '',
                description: p.description || '', image: p.image || '',
                variants: (p.variants || []).map((v) => ({ ...v })) });
    }
    setEditingIdx(idx); setSaveMsg('');
  };
  const closeEdit = () => { setEditingIdx(null); setSaveMsg(''); };

  const handleImageUpload = async (e, variantIdx = null) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1_000_000) { alert('Image too large. Use an image under 1MB.'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      if (variantIdx !== null) {
        setForm((f) => ({ ...f, variants: f.variants.map((v, i) => i === variantIdx ? { ...v, image: dataUrl } : v) }));
      } else {
        setForm((f) => ({ ...f, image: dataUrl }));
      }
    };
    reader.readAsDataURL(file);
  };

  const updateVariant = (idx, key, value) =>
    setForm((f) => ({ ...f, variants: f.variants.map((v, i) => i === idx ? { ...v, [key]: value } : v) }));
  const addVariant    = () => setForm((f) => ({ ...f, variants: [...f.variants, emptyVariant()] }));
  const removeVariant = (idx) => setForm((f) => ({ ...f, variants: f.variants.filter((_, i) => i !== idx) }));

  const saveProduct = async () => {
    if (!form.name || !form.price) { setSaveMsg('Name and price are required.'); return; }
    setSaving(true); setSaveMsg('');
    const updated = { ...form, price: Number(form.price), variants: form.variants.map((v) => ({ ...v, price: Number(v.price) || 0 })) };
    try {
      if (editingIdx === -1) {
        const newId = Date.now();
        await setDoc(doc(db, 'products', String(newId)), { id: newId, ...updated });
      } else {
        const product = products[editingIdx];
        await setDoc(doc(db, 'products', String(product.id)), { id: product.id, ...updated }, { merge: true });
      }
      setSaveMsg('✅ Saved successfully!');
      setTimeout(closeEdit, 1200);
    } catch (err) { console.error(err); setSaveMsg('❌ Save failed.'); }
    finally { setSaving(false); }
  };

  const [printOrder, setPrintOrder] = useState(null);

  const handleLogout    = async () => { await signOut(auth); router.push('/admin'); };
  const handleTabChange = (tabId) => { setActiveTab(tabId); setSidebarOpen(false); };

  if (checking) return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
      <p className="text-gray-400">Verifying admin access...</p>
    </div>
  );

  const tabs = [
    { id: 'overview',  label: 'Overview',     icon: '📊' },
    { id: 'orders',    label: 'Orders',        icon: '📦' },
    { id: 'products',  label: 'Products',      icon: '🍔' },
    { id: 'customers', label: 'Customers',     icon: '👥' },
    { id: 'alerts',    label: 'Stock Alerts',  icon: '⚠️' },
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-30 bg-[#1e293b] border-b border-gray-700
                         flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#0f172a] text-white">
            {sidebarOpen ? '✕' : '☰'}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#E87121] rounded-lg flex items-center justify-center font-bold text-xs">DT</div>
            <p className="font-bold text-white text-sm">Admin Panel</p>
          </div>
        </div>
        <button onClick={handleLogout} className="text-xs text-red-400 bg-red-900/20 px-3 py-1.5 rounded-lg">
          🚪 Logout
        </button>
      </header>

      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-20 bg-black/60" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex min-h-screen">

        {/* Sidebar */}
        <aside className={`fixed h-full z-20 bg-[#1e293b] border-r border-gray-700 flex flex-col
          transition-transform duration-300 ease-in-out w-56 md:translate-x-0 top-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-5 border-b border-gray-700 flex items-center gap-3">
            <div className="w-9 h-9 bg-[#E87121] rounded-xl flex items-center justify-center font-bold text-sm">DT</div>
            <div>
              <p className="font-bold text-white text-sm">Dynamic Tower</p>
              <p className="text-xs text-gray-400">Admin Panel</p>
            </div>
          </div>
          <nav className="flex-1 p-4 flex flex-col gap-1">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => handleTabChange(tab.id)}
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

        <main className="flex-1 md:ml-56 p-4 md:p-6 pt-20 md:pt-6">

          {/* ══ OVERVIEW ══ */}
          {activeTab === 'overview' && (
            <div>
              <h1 className="text-xl font-bold text-white mb-6">Dashboard Overview</h1>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
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

              {/* ── Revenue Chart ── */}
              <RevenueChart orders={orders} />

              {/* Recent Orders */}
              <div className="bg-[#1e293b] rounded-2xl border border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                  <h2 className="font-bold text-white">Recent Orders</h2>
                  <button onClick={() => setActiveTab('orders')} className="text-xs text-[#E87121] hover:underline">View all</button>
                </div>
                <div className="divide-y divide-gray-700">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="p-4 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">#{order.id?.slice(0, 10)}</p>
                        <p className="text-xs text-gray-400 truncate">{order.customerName || 'Customer'}</p>
                      </div>
                      <div className="text-right shrink-0">
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
                    <div className="flex justify-between items-start mb-3 gap-2">
                      <div className="min-w-0">
                        <p className="font-bold text-white text-sm truncate">#{order.id}</p>
                        <p className="text-xs text-gray-400 mt-0.5 truncate">{order.customerName || 'Unknown'} • {order.customerPhone || ''}</p>
                        <p className="text-xs text-gray-500 truncate">{order.customerEmail || ''}</p>
                        {order.createdAt && (
                          <p className="text-xs text-gray-600 mt-0.5">
                            {new Date(order.createdAt.seconds * 1000).toLocaleString()}
                          </p>
                        )}
                      </div>
                      <p className="font-bold text-[#E87121] shrink-0">₦{(order.total || 0).toLocaleString()}</p>
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
                      <button onClick={() => setPrintOrder(order)}
                        className="text-xs text-blue-400 hover:text-blue-300 bg-blue-900/20 px-3 py-1.5 rounded-lg transition-colors">
                        🖨️ Receipt
                      </button>
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

              {editingIdx !== null && (
                <div className="fixed inset-0 z-50 bg-black/70 flex items-start justify-center p-4 overflow-y-auto">
                  <div className="bg-[#1e293b] rounded-2xl border border-gray-700 w-full max-w-2xl my-6">
                    <div className="flex items-center justify-between p-5 border-b border-gray-700">
                      <h2 className="font-bold text-white text-lg">
                        {editingIdx === -1 ? '➕ Add New Product' : '✏️ Edit Product'}
                      </h2>
                      <button onClick={closeEdit} className="text-gray-400 hover:text-white text-xl">✕</button>
                    </div>
                    <div className="p-4 md:p-5 flex flex-col gap-4 max-h-[75vh] overflow-y-auto">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                          { label: 'Product Name',   key: 'name',     type: 'text',   placeholder: 'e.g. Jollof Rice' },
                          { label: 'Base Price (₦)', key: 'price',    type: 'number', placeholder: 'e.g. 3000'        },
                          { label: 'Category',       key: 'category', type: 'text',   placeholder: 'e.g. Rice'        },
                        ].map(({ label, key, type, placeholder }) => (
                          <div key={key}>
                            <label className="text-xs text-gray-400 uppercase tracking-widest mb-1 block">{label}</label>
                            <input type={type} placeholder={placeholder} value={form[key]}
                              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                              className="w-full px-3 py-2.5 rounded-xl bg-[#0f172a] border border-gray-700
                                         text-white text-sm focus:outline-none focus:border-[#E87121]" />
                          </div>
                        ))}
                        <div className="md:col-span-2">
                          <label className="text-xs text-gray-400 uppercase tracking-widest mb-1 block">Description</label>
                          <textarea rows={2} placeholder="Short description..." value={form.description}
                            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                            className="w-full px-3 py-2.5 rounded-xl bg-[#0f172a] border border-gray-700
                                       text-white text-sm focus:outline-none focus:border-[#E87121] resize-none" />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 uppercase tracking-widest mb-2 block">Main Product Image</label>
                        <div className="flex items-center gap-3">
                          <div className="w-20 h-20 rounded-xl bg-[#0f172a] border border-gray-700 overflow-hidden shrink-0 flex items-center justify-center">
                            {form.image
                              ? <img src={form.image} alt="preview" className="w-full h-full object-cover" />
                              : <span className="text-gray-600 text-xs text-center px-1">No image</span>
                            }
                          </div>
                          <div className="flex-1 flex flex-col gap-2">
                            <button onClick={() => imageInputRef.current?.click()}
                              className="bg-[#0f172a] border border-dashed border-gray-600 hover:border-[#E87121]
                                         text-gray-400 hover:text-white text-xs px-3 py-2 rounded-xl transition-all text-left">
                              📁 Upload image from device
                            </button>
                            <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e)} />
                            <input type="text" placeholder="or type /public path e.g. /food.webp"
                              value={form.image.startsWith('data:') ? '' : form.image}
                              onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                              className="w-full px-3 py-2 rounded-xl bg-[#0f172a] border border-gray-700
                                         text-white text-xs focus:outline-none focus:border-[#E87121]" />
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-xs text-gray-400 uppercase tracking-widest">Variants ({form.variants.length})</label>
                          <button onClick={addVariant}
                            className="text-xs bg-[#E87121]/20 text-[#E87121] border border-[#E87121]/30 px-3 py-1 rounded-lg hover:bg-[#E87121]/30 transition-all">
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
                                <button onClick={() => removeVariant(i)} className="text-xs text-red-400 hover:text-red-300">✕ Remove</button>
                              </div>
                              <div className="grid grid-cols-2 gap-2 mb-2">
                                {[
                                  { label: 'Label', key: 'label', type: 'text', placeholder: 'e.g. Small' },
                                  { label: 'Weight/Size', key: 'weight', type: 'text', placeholder: 'e.g. 500g' },
                                  { label: 'Price (₦)', key: 'price', type: 'number', placeholder: 'e.g. 3000' },
                                  { label: 'Image Path', key: 'image', type: 'text', placeholder: '/image.webp' },
                                ].map(({ label, key, type, placeholder }) => (
                                  <div key={key}>
                                    <label className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 block">{label}</label>
                                    <input type={type} placeholder={placeholder}
                                      value={key === 'image' ? (v.image?.startsWith('data:') ? '' : v.image) : v[key]}
                                      onChange={(e) => updateVariant(i, key, e.target.value)}
                                      className="w-full px-2 py-1.5 rounded-lg bg-[#1e293b] border border-gray-700
                                                 text-white text-xs focus:outline-none focus:border-[#E87121]" />
                                  </div>
                                ))}
                              </div>
                              <div className="flex items-center gap-2">
                                {v.image && <img src={v.image} alt={v.label} className="w-10 h-10 rounded-lg object-cover border border-gray-700 shrink-0" />}
                                <label className="flex-1 cursor-pointer bg-[#1e293b] border border-dashed border-gray-600
                                                  hover:border-[#E87121] text-gray-500 hover:text-gray-300 text-xs px-2 py-1.5 rounded-lg transition-all">
                                  📁 Upload variant image
                                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, i)} />
                                </label>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      {saveMsg && (
                        <p className={`text-sm text-center font-medium ${saveMsg.startsWith('✅') ? 'text-green-400' : 'text-red-400'}`}>
                          {saveMsg}
                        </p>
                      )}
                      <div className="flex gap-3 pt-2">
                        <button onClick={saveProduct} disabled={saving}
                          className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all
                            ${saving ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-[#E87121] hover:bg-orange-600 text-white'}`}>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {products.map((product, i) => (
                  <div key={product.id} className="bg-[#1e293b] rounded-2xl p-4 border border-gray-700 flex items-center gap-4">
                    <img src={product.image} alt={product.name} className="w-16 h-16 rounded-xl object-cover bg-gray-700 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-sm truncate">{product.name}</p>
                      <p className="text-xs text-gray-400">{product.category}</p>
                      <p className="text-sm font-bold text-[#E87121] mt-0.5">₦{product.price?.toLocaleString()}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{product.variants?.length || 0} variant{product.variants?.length !== 1 ? 's' : ''}</p>
                    </div>
                    <button onClick={() => openEdit(i)}
                      className="text-xs text-[#E87121] shrink-0 px-3 py-1.5 bg-[#E87121]/10 rounded-lg hover:bg-[#E87121]/20 transition-all">
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
                  <div key={customer.id} className="bg-[#1e293b] rounded-2xl p-4 border border-gray-700 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-orange-900/30 flex items-center justify-center text-[#E87121] font-bold shrink-0">
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

          {/* ══ STOCK ALERTS ══ */}
          {activeTab === 'alerts' && (
            <LowStockTab products={products} />
          )}

        </main>
      </div>

      {/* ── Print Receipt Modal (rendered outside main layout) ── */}
      {printOrder && (
        <PrintReceiptModal order={printOrder} onClose={() => setPrintOrder(null)} />
      )}
    </div>
  );
};

export default AdminDashboard;
