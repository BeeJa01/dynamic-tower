import './globals.css';
import { AuthProvider } from '@/context/AuthProvider';
import { CartProvider } from '@/context/CartProvider';
import ConditionalLayout from '@/components/ConditionalLayout';

export const metadata = {
  title: 'DYNAMIC TOWER MULTIPURPOSE LTD',
  description: 'Dynamic Tower - Hot meals delivered to your door in an hour or less.',
};

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
      </body>
    </html>
  );
}
