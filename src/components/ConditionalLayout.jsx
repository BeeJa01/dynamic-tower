'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';

export default function ConditionalLayout({ children }) {
  const pathname = usePathname();

  // Hide Navbar and Footer on all /admin routes
  const isAdminPage = pathname?.startsWith('/admin');

  return (
    <>
      {!isAdminPage && <Navbar />}
      <ScrollToTop />
      {children}
      {!isAdminPage && <Footer />}
    </>
  );
}
