'use client';
// components/WhatsAppButton.jsx

import { useState } from 'react';

const WHATSAPP_NUMBER = '2348107191319'; // without +
const DEFAULT_MESSAGE = "Hi! I'd like to place an order from Dynamic Tower Multipurpose LTD 🍔";

export default function WhatsAppButton() {
  const [hovered, setHovered] = useState(false);

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="fixed bottom-6 right-5 z-50 flex items-center gap-3 group"
      aria-label="Chat with us on WhatsApp"
    >
      {/* Tooltip */}
      <div className={`transition-all duration-300 bg-white dark:bg-gray-800 text-gray-800
                       dark:text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-lg
                       border border-gray-100 dark:border-gray-700 whitespace-nowrap
                       ${hovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2 pointer-events-none'}`}>
        Chat with us 💬
      </div>

      {/* Button */}
      <div className="relative w-14 h-14 bg-[#25D366] hover:bg-[#20BA5A] rounded-full
                      flex items-center justify-center shadow-xl shadow-green-500/40
                      transition-all duration-300 hover:scale-110 active:scale-95">
        {/* Ping animation */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30" />

        {/* WhatsApp SVG icon */}
        <svg viewBox="0 0 32 32" className="w-8 h-8 fill-white" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 0C7.163 0 0 7.163 0 16c0 2.833.738 5.49 2.028 7.8L0 32l8.437-2.007A15.93 15.93 0 0 0 16 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm0 29.333a13.27 13.27 0 0 1-6.787-1.856l-.487-.29-5.01 1.193 1.22-4.877-.317-.5A13.24 13.24 0 0 1 2.667 16C2.667 8.636 8.636 2.667 16 2.667S29.333 8.636 29.333 16 23.364 29.333 16 29.333zm7.27-9.907c-.397-.198-2.347-1.158-2.712-1.29-.364-.13-.63-.197-.895.198-.265.396-1.03 1.29-1.262 1.555-.232.264-.464.297-.861.099-.397-.198-1.676-.618-3.192-1.97-1.18-1.052-1.977-2.35-2.209-2.748-.232-.397-.025-.611.174-.808.179-.178.397-.464.596-.695.198-.232.265-.397.397-.662.132-.264.066-.496-.033-.695-.099-.198-.895-2.157-1.226-2.952-.322-.775-.65-.67-.895-.682l-.762-.013c-.265 0-.695.099-1.06.496-.364.397-1.39 1.358-1.39 3.317s1.423 3.845 1.621 4.11c.198.264 2.8 4.275 6.784 5.994.948.41 1.688.654 2.265.837.951.303 1.817.26 2.501.158.763-.114 2.347-.959 2.678-1.885.33-.926.33-1.72.232-1.885-.099-.165-.364-.264-.762-.463z"/>
        </svg>
      </div>
    </a>
  );
}
