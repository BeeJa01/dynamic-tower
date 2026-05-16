'use client';

import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/useCart';

const STEPS = ['Address', 'Payment', 'Confirmation'];

export default function Checkout() {
  const router = useRouter();
  const { cartTotal, cartItems } = useCart();
  const address = typeof window !== 'undefined' ? JSON.parse(sessionStorage.getItem('dt_delivery_address') || '{}') : {};

  const paymentMethods = [
    { icon: '💳', bg: 'bg-orange-50 dark:bg-orange-900/20', label: 'Card Payment', sub: 'Visa, Mastercard, Verve, USSD — via Paystack', route: '/card-payment' },
    { icon: '🏦', bg: 'bg-green-50 dark:bg-green-900/20', label: 'Bank Transfer (Opay)', sub: 'Transfer directly to our Opay account', route: '/bank-transfer' },
  ];

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
          <button onClick={() => router.push('/delivery-address')} className="flex items-center gap-1 text-orange-500 font-semibold text-sm mb-4 hover:text-orange-600 transition-colors">← Back to Address</button>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Payment</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Choose how you want to pay</p>
        </div>
        <div className="bg-orange-500 rounded-2xl p-5 text-center text-white shadow-lg shadow-orange-500/25">
          <p className="text-sm text-orange-100 mb-1">Total Amount</p>
          <p className="text-4xl font-black">₦{cartTotal.toLocaleString()}</p>
          <p className="text-xs text-orange-200 mt-2">🚚 Delivery fee: Free</p>
        </div>
        {address.fullName && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
            <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Delivering to</p>
            <p className="text-sm font-black text-gray-900 dark:text-white">{address.fullName}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{address.address}, {address.city}, {address.state}</p>
          </div>
        )}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <h2 className="font-black text-gray-900 dark:text-white mb-4">Select Payment Method</h2>
          <div className="flex flex-col gap-3">
            {paymentMethods.map((method) => (
              <button key={method.route} onClick={() => router.push(method.route)}
                className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 hover:border-orange-400 dark:hover:border-orange-500 hover:bg-orange-50/50 transition-all text-left group">
                <div className={`w-11 h-11 ${method.bg} rounded-xl flex items-center justify-center text-xl shrink-0 border border-gray-100 dark:border-gray-700`}>{method.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-gray-900 dark:text-white text-sm">{method.label}</p>
                  <p className="text-xs text-gray-400 truncate">{method.sub}</p>
                </div>
                <span className="text-gray-300 group-hover:text-orange-500 transition-colors text-lg font-bold shrink-0">→</span>
              </button>
            ))}
          </div>
        </div>
        <p className="text-xs text-center text-gray-400 pb-6 flex items-center justify-center gap-1"><span>🔒</span> All payments are secure and encrypted</p>
      </div>
    </div>
  );
}
