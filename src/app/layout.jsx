import './globals.css';
import { AuthProvider } from '@/context/AuthProvider';
import { CartProvider } from '@/context/CartProvider';
import ConditionalLayout from '@/components/ConditionalLayout';
import WhatsAppButton from '@/components/WhatsAppButton';
import { baseMetadata } from '@/lib/metadata';
import JsonLd from '@/components/JsonLd';

export const metadata = baseMetadata;

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <AuthProvider>
          <CartProvider>
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
          </CartProvider>
        </AuthProvider>
        <WhatsAppButton />
        <JsonLd />
      </body>
    </html>
  );
}
