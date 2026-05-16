'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/useCart';

const NIGERIAN_STATES = ['Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno','Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT - Abuja','Gombe','Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba','Yobe','Zamfara'];
const STEPS = ['Address', 'Payment', 'Confirmation'];

export default function DeliveryAddress() {
  const router = useRouter();
  const { cartItems, cartTotal } = useCart();
  const [form, setForm] = useState({ fullName: '', phone: '', altPhone: '', email: '', state: '', city: '', area: '', address: '', landmark: '', deliveryNote: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => { const { name, value } = e.target; setForm((prev) => ({ ...prev, [name]: value })); if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Full name is required';
    if (!form.phone.trim()) e.phone = 'Phone number is required';
    else if (form.phone.length < 10) e.phone = 'Enter a valid phone number';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.state) e.state = 'Please select your state';
    if (!form.city.trim()) e.city = 'City / LGA is required';
    if (!form.address.trim()) e.address = 'Street address is required';
    setErrors(e); return Object.keys(e).length === 0;
  };

  const handleContinue = () => {
    if (!validate()) return;
    setLoading(true);
    sessionStorage.setItem('dt_delivery_address', JSON.stringify(form));
    setTimeout(() => { setLoading(false); router.push('/checkout'); }, 500);
  };

  const inputClass = (field) => `w-full px-4 py-3 rounded-xl border text-sm dark:bg-gray-900 dark:text-white focus:outline-none focus:border-orange-400 transition-all ${errors[field] ? 'border-red-400 bg-red-50 dark:bg-red-900/10' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900'}`;

  if (cartItems.length === 0) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 text-center">
      <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">Your cart is empty</h2>
      <button onClick={() => router.push('/')} className="mt-4 bg-orange-500 text-white px-6 py-3 rounded-full text-sm font-bold hover:bg-orange-600 transition-all">Browse Menu →</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4">
      <div className="max-w-lg mx-auto flex flex-col gap-5">
        <div>
          <button onClick={() => router.push('/cart')} className="flex items-center gap-1 text-orange-500 font-semibold text-sm mb-4 hover:text-orange-600 transition-colors">← Back to Cart</button>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Delivery Address</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">We deliver anywhere in Nigeria 🇳🇬</p>
        </div>
        <div className="bg-orange-500 rounded-2xl p-4 text-white flex justify-between items-center">
          <div>
            <p className="font-black text-base">{cartItems.length} item{cartItems.length > 1 ? 's' : ''}</p>
            <p className="text-orange-100 text-xs mt-0.5 line-clamp-1">{cartItems.map((i) => i.name).join(', ')}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-orange-200">Total</p>
            <p className="text-xl font-black">₦{cartTotal.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <h2 className="font-black text-gray-900 dark:text-white mb-5">👤 Contact Details</h2>
          {[{ label: 'Full Name', name: 'fullName', type: 'text', placeholder: 'e.g. Adaeze Okonkwo', required: true }, { label: 'Phone Number', name: 'phone', type: 'tel', placeholder: 'e.g. 08012345678', required: true }, { label: 'Alternative Phone', name: 'altPhone', type: 'tel', placeholder: 'e.g. 09098765432', required: false }, { label: 'Email Address', name: 'email', type: 'email', placeholder: 'e.g. adaeze@gmail.com', required: true }].map(({ label, name, type, placeholder, required }) => (
            <div key={name} className="mb-4 last:mb-0">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1.5 block">{label}</label>
              <input type={type} name={name} placeholder={placeholder} value={form[name]} onChange={handleChange} className={inputClass(name)} />
              {errors[name] && <p className="text-red-400 text-xs mt-1">{errors[name]}</p>}
            </div>
          ))}
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <h2 className="font-black text-gray-900 dark:text-white mb-5">📍 Delivery Location</h2>
          <div className="mb-4">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1.5 block">State *</label>
            <select name="state" value={form.state} onChange={handleChange} className={`${inputClass('state')} appearance-none`}>
              <option value="">Select your state</option>
              {NIGERIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            {errors.state && <p className="text-red-400 text-xs mt-1">{errors.state}</p>}
          </div>
          <div className="mb-4">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1.5 block">City / LGA *</label>
            <input type="text" name="city" placeholder="e.g. Ikeja, Surulere" value={form.city} onChange={handleChange} className={inputClass('city')} />
            {errors.city && <p className="text-red-400 text-xs mt-1">{errors.city}</p>}
          </div>
          <div className="mb-4">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1.5 block">Street Address *</label>
            <textarea name="address" placeholder="e.g. 12 Adeola Odeku Street" value={form.address} onChange={handleChange} rows={2} className={`${inputClass('address')} resize-none`} />
            {errors.address && <p className="text-red-400 text-xs mt-1">{errors.address}</p>}
          </div>
        </div>
        <button onClick={handleContinue} disabled={loading}
          className={`w-full py-4 rounded-xl font-black text-sm tracking-wide transition-all active:scale-95 shadow-lg ${loading ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/30'}`}>
          {loading ? 'Saving...' : 'Continue to Payment →'}
        </button>
      </div>
    </div>
  );
}
