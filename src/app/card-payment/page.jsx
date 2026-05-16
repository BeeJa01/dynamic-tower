'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { useCart } from '@/hooks/useCart';

const PAYSTACK_PUBLIC_KEY = 'pk_test_71a87c3aa724e5dfeeedb1a7caeca2c9495e6404';

export default function CardPayment() {
  const router = useRouter();
  const { cartItems, cartTotal, clearCart } = useCart();
  const [email, setEmail]       = useState('');
  const [phone, setPhone]       = useState('');
  const [fullName, setFullName] = useState('');
  const [errors, setErrors]     = useState({});
  const [scriptReady, setScriptReady] = useState(false);

  const validate = () => {
    const e = {};
    if (!fullName.trim()) e.fullName = 'Please enter your full name';
    if (!email.trim()) e.email = 'Please enter your email';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email';
    if (!phone.trim()) e.phone = 'Please enter your phone number';
    else if (phone.length < 10) e.phone = 'Enter a valid phone number';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePay = () => {
    if (!validate()) return;
    if (!scriptReady || !window.PaystackPop) {
      alert('Payment is still loading, please try again in a moment.');
      return;
    }
    const handler = window.PaystackPop.setup({
      key:      PAYSTACK_PUBLIC_KEY,
      email,
      amount:   cartTotal * 100,
      currency: 'NGN',
      ref:      `DT-${new Date().getTime()}`,
      metadata: {
        custom_fields: [
          { display_name: 'Full Name',     variable_name: 'full_name',     value: fullName },
          { display_name: 'Phone Number',  variable_name: 'phone_number',  value: phone   },
        ],
      },
      callback: () => { clearCart(); router.push('/order-confirmation'); },
      onClose:  () => console.log('Payment popup closed'),
    });
    handler.openIframe();
  };

  const inputClass = (field) =>
    `w-full px-4 py-3 rounded-xl border text-sm dark:bg-gray-900 dark:text-white
     focus:outline-none focus:border-orange-400 transition-all
     ${errors[field] ? 'border-red-400 bg-red-50 dark:bg-red-900/10' : 'border-gray-200 dark:border-gray-700'}`;

  if (cartItems.length === 0) return (
    <div className="min-h-screen flex flex-col items-center justify-center
                    bg-gray-50 dark:bg-gray-950 px-4 text-center">
      <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">Your cart is empty</h2>
      <button onClick={() => router.push('/')}
        className="mt-4 bg-orange-500 text-white px-6 py-3 rounded-full text-sm font-bold
                   hover:bg-orange-600 transition-all">
        Browse Menu →
      </button>
    </div>
  );

  return (
    <>
      {/* ✅ Load Paystack script properly in Next.js */}
      <Script
        src="https://js.paystack.co/v1/inline.js"
        onReady={() => setScriptReady(true)}
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4">
        <div className="max-w-lg mx-auto flex flex-col gap-5">

          <div>
            <button onClick={() => router.push('/cart')}
              className="flex items-center gap-1 text-orange-500 font-semibold text-sm
                         mb-4 hover:text-orange-600 transition-colors">
              ← Back to Cart
            </button>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Card Payment</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Secure payment powered by Paystack
            </p>
          </div>

          {/* Amount */}
          <div className="bg-orange-500 rounded-2xl p-5 text-center text-white
                          shadow-lg shadow-orange-500/25">
            <p className="text-sm text-orange-100 mb-1">Amount to Pay</p>
            <p className="text-4xl font-black">₦{cartTotal.toLocaleString()}</p>
          </div>

          {/* Details form */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5
                          border border-gray-100 dark:border-gray-700 shadow-sm">
            <h2 className="font-black text-gray-900 dark:text-white mb-4">👤 Your Details</h2>

            <div className="mb-4">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1.5 block">
                Full Name
              </label>
              <input type="text" placeholder="e.g. Adaeze Okonkwo" value={fullName}
                onChange={(e) => setFullName(e.target.value)} className={inputClass('fullName')} />
              {errors.fullName && <p className="text-red-400 text-xs mt-1">{errors.fullName}</p>}
            </div>

            <div className="mb-4">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1.5 block">
                Email Address
              </label>
              <input type="email" placeholder="e.g. adaeze@gmail.com" value={email}
                onChange={(e) => setEmail(e.target.value)} className={inputClass('email')} />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1.5 block">
                Phone Number
              </label>
              <input type="tel" placeholder="e.g. 08012345678" value={phone}
                onChange={(e) => setPhone(e.target.value)} className={inputClass('phone')} />
              {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-gray-400 text-xs">
            <span>🔒</span>
            <span>Secured by Paystack — 256-bit SSL encryption</span>
          </div>

          <button
            onClick={handlePay}
            disabled={!scriptReady}
            className={`w-full py-4 rounded-xl font-black text-sm tracking-wide transition-all
                        shadow-lg shadow-orange-500/30
                        ${scriptReady
                          ? 'bg-orange-500 hover:bg-orange-600 active:scale-95 text-white'
                          : 'bg-gray-300 text-gray-400 cursor-not-allowed'
                        }`}
          >
            {scriptReady ? `💳 Pay ₦${cartTotal.toLocaleString()} Securely` : 'Loading payment...'}
          </button>

        </div>
      </div>
    </>
  );
}
