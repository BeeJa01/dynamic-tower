'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { Trash, Plus, Minus, ShoppingBag } from "@/components/Icons";

export default function Cart() {
  const router = useRouter();
  const { cartItems, removeFromCart, updateQty, cartTotal, clearCart, websiteFee } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 bg-white dark:bg-gray-950">
        <div className="w-24 h-24 bg-orange-50 dark:bg-orange-900/20 rounded-full flex items-center justify-center mb-5">
          <ShoppingBag size={40} className="text-orange-300" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Your Cart is Empty</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 max-w-xs">Add some delicious meals to get started!</p>
        <Link href="/product" className="bg-orange-500 hover:bg-orange-600 active:scale-95 text-white px-7 py-3 rounded-full text-sm font-bold shadow-lg shadow-orange-500/30 transition-all">
          Browse Menu →
        </Link>
      </div>
    );
  }

  const handleCheckout = (platform) => {
    const whatsappNumber = "2348107191319";
    const telegramUsername = "Dynamictower001";
    const itemDetails = cartItems.map((item) => `• ${item.name}${item.selectedVariant ? ` (${item.selectedVariant})` : ''} x${item.qty} — ₦${item.total.toLocaleString()}`).join("\n");
    const message = `🛍️ *New Order from Dynamic Tower Foods*\n\n${itemDetails}\n\n💰 *Total: ₦${cartTotal.toLocaleString()}*\n\nPlease confirm my order!`;
    const encodedMessage = encodeURIComponent(message);
    if (platform === 'whatsapp') window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, "_blank");
    else window.open(`https://t.me/${telegramUsername}?text=${encodedMessage}`, "_blank");
    setTimeout(() => router.push('/order-confirmation'), 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4">
      <div className="max-w-2xl mx-auto flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Your Cart</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={() => clearCart()} className="text-xs text-red-400 hover:text-red-500 font-medium transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">Clear all</button>
        </div>

        <div className="flex flex-col gap-3">
          {cartItems.map((item) => (
            <div key={`${item.id}-${item.selectedVariant}`} className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:border-orange-200 dark:hover:border-orange-800 transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-16 w-16 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 shrink-0">
                  {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xl font-black text-orange-300">{item.name[0]}</div>}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm">{item.name}</h3>
                  {item.selectedVariant && <p className="text-xs text-gray-400">{item.selectedVariant}</p>}
                  <p className="text-orange-500 font-black text-sm mt-0.5">₦{item.price.toLocaleString()} each</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => updateQty(item.productKey, item.variant?.size || item.selectedVariant, item.qty - 1)} className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"><Minus size={13} /></button>
                <span className="font-black text-gray-900 dark:text-white w-6 text-center text-sm">{item.qty}</span>
                <button onClick={() => updateQty(item.productKey, item.variant?.size || item.selectedVariant, item.qty + 1)} className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"><Plus size={13} /></button>
                <button onClick={() => removeFromCart(item.productKey, item.variant?.size || item.selectedVariant)} className="ml-1 p-1.5 text-red-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"><Trash size={15} /></button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <h2 className="font-black text-gray-900 dark:text-white text-base mb-4">Order Summary</h2>
          {cartItems.map((item) => (
            <div key={`${item.id}-summary`} className="flex justify-between items-center mb-3 pb-3 border-b border-gray-100 dark:border-gray-700 last:border-0 last:mb-0 last:pb-0">
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-white">{item.name}{item.selectedVariant && <span className="text-xs text-gray-400 ml-1">({item.selectedVariant})</span>}</p>
                <p className="text-xs text-gray-400">×{item.qty}</p>
              </div>
              <span className="font-bold text-gray-800 dark:text-white text-sm">₦{item.total.toLocaleString()}</span>
            </div>
          ))}
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex flex-col gap-2">
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400"><span>Website fee</span><span>₦{websiteFee.toLocaleString()}</span></div>
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400"><span>Delivery fee</span><span className="text-green-500 font-semibold">Free</span></div>
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
              <span className="font-black text-gray-900 dark:text-white">Total</span>
              <span className="font-black text-xl text-orange-500">₦{cartTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-xs text-gray-400 dark:text-gray-500 font-medium text-center uppercase tracking-widest">Complete your order via</p>
          <div className="flex gap-4">
            <button onClick={() => handleCheckout('whatsapp')} className="w-full bg-green-500 hover:bg-green-600 active:scale-95 text-white px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-green-500/20">📱 Order on WhatsApp</button>
            <button onClick={() => handleCheckout('telegram')} className="w-full bg-sky-500 hover:bg-sky-600 active:scale-95 text-white px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-sky-500/20">✈️ Order on Telegram</button>
          </div>
          <button onClick={() => router.push('/delivery-address')} className="w-full bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 active:scale-95 text-white dark:text-gray-900 px-6 py-4 rounded-xl font-bold transition-all">🏦 Checkout</button>
        </div>
      </div>
    </div>
  );
}
