'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCart } from '@/hooks/useCart';

const BANK_DETAILS = { bankName: 'Opay', accountName: 'Oluwatimilehin Adekunle Adenike', accountNumber: '8107191319', whatsappNumber: '2348107191319' };

export default function BankTransfer() {
  const router = useRouter();
  const { cartItems, cartTotal, clearCart } = useCart();
  const [copied, setCopied] = useState(false);
  const [proofPreview, setProofPreview] = useState(null);
  const [senderName, setSenderName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  const handleCopy = () => { navigator.clipboard.writeText(BANK_DETAILS.accountNumber); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const handleFileChange = (e) => { const file = e.target.files[0]; if (!file) return; setProofPreview(URL.createObjectURL(file)); };
  const handleConfirm = () => {
    if (!senderName.trim()) { alert('Please enter the name used for the transfer.'); return; }
    setLoading(true);
    const itemDetails = cartItems.map((item) => `• ${item.name}${item.selectedVariant ? ` (${item.selectedVariant})` : ''} x${item.qty} — ₦${item.total.toLocaleString()}`).join('\n');
    const message = `💳 *Bank Transfer Payment — Dynamic Tower Foods*\n\n👤 *Sender Name:* ${senderName}\n🏦 *Bank:* ${BANK_DETAILS.bankName}\n💰 *Amount Paid:* ₦${cartTotal.toLocaleString()}\n\n🛍️ *Order Details:*\n${itemDetails}\n\n📸 Please find payment proof attached.\n\nKindly confirm and process my order. Thank you!`;
    window.open(`https://wa.me/${BANK_DETAILS.whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
    setTimeout(() => { setLoading(false); setSubmitted(true); clearCart(); setTimeout(() => router.push('/order-confirmation'), 1500); }, 1000);
  };

  if (submitted) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-10 text-center max-w-sm w-full shadow-lg border border-gray-100 dark:border-gray-700">
        <div className="w-20 h-20 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">✅</div>
        <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">Payment Sent!</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Redirecting to order confirmation...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4">
      <div className="max-w-lg mx-auto flex flex-col gap-5">
        <div>
          <button onClick={() => router.push('/cart')} className="flex items-center gap-1 text-orange-500 font-semibold text-sm mb-4 hover:text-orange-600 transition-colors">← Back to Cart</button>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Bank Transfer</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Transfer the exact amount below to complete your order</p>
        </div>
        <div className="bg-orange-500 rounded-2xl p-6 text-center text-white shadow-lg shadow-orange-500/25">
          <p className="text-sm text-orange-100 mb-1">Amount to Transfer</p>
          <p className="text-5xl font-black">₦{cartTotal.toLocaleString()}</p>
          <p className="text-xs text-orange-200 mt-2">Transfer this exact amount to avoid delays</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <h2 className="font-black text-gray-900 dark:text-white mb-4">🏦 Bank Details</h2>
          {[{ label: 'Bank', value: BANK_DETAILS.bankName }, { label: 'Account Name', value: BANK_DETAILS.accountName }].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
              <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
              <span className="font-black text-gray-900 dark:text-white text-sm">{value}</span>
            </div>
          ))}
          <div className="flex justify-between items-center py-3">
            <span className="text-sm text-gray-500 dark:text-gray-400">Account Number</span>
            <div className="flex items-center gap-3">
              <span className="font-black text-gray-900 dark:text-white tracking-widest text-lg">{BANK_DETAILS.accountNumber}</span>
              <button onClick={handleCopy} className={`text-xs px-3 py-1.5 rounded-full font-black transition-all active:scale-95 ${copied ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-orange-50 text-orange-500 border border-orange-200 hover:bg-orange-100'}`}>{copied ? '✓ Copied!' : 'Copy'}</button>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 block">Name used for transfer</label>
          <input type="text" placeholder="e.g. Adaeze Okonkwo" value={senderName} onChange={(e) => setSenderName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:outline-none focus:border-orange-400 text-sm transition-all" />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <h2 className="font-black text-gray-900 dark:text-white mb-1">📸 Upload Payment Proof</h2>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          {proofPreview ? (
            <div className="relative">
              <Image src={proofPreview} alt="Payment proof" className="w-full rounded-2xl object-cover max-h-48 border border-gray-100 dark:border-gray-700" />
              <button onClick={() => setProofPreview(null)} className="absolute top-2 right-2 bg-red-500 text-white w-7 h-7 rounded-full text-sm flex items-center justify-center shadow-md hover:bg-red-600 transition-colors">✕</button>
            </div>
          ) : (
            <button onClick={() => fileRef.current.click()} className="w-full py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl text-gray-400 hover:border-orange-400 hover:text-orange-500 transition-all text-sm flex flex-col items-center gap-2">
              <span className="text-3xl">📁</span> Tap to upload receipt
            </button>
          )}
        </div>
        <button onClick={handleConfirm} disabled={loading || !senderName.trim()}
          className={`w-full py-4 rounded-xl font-black text-sm tracking-wide transition-all active:scale-95 ${loading || !senderName.trim() ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/30'}`}>
          {loading ? 'Sending confirmation...' : '✅ I Have Paid — Confirm via WhatsApp'}
        </button>
      </div>
    </div>
  );
}
