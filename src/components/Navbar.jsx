'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/hooks/useCart';
import DarkModeToggle from '@/components/DarkModeToggle';
import { useAuth } from '@/context/AuthContext';

const Navbar = () => {
  const router = useRouter();
  const { cartCount } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      router.push(`/search?q=${encodeURIComponent(q)}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch(e);
  };

  const handleNavClick = (path) => {
    router.push(path);
    setMobileMenuOpen(false);
  };

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300
        ${scrolled
          ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg shadow-orange-500/5 border-b border-orange-100 dark:border-gray-800'
          : 'bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800'
        }`}
    >
      {/* ─── Top Bar ─── */}
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

        {/* Logo + Brand */}
        <button
          onClick={() => handleNavClick('/')}
          className="flex items-center gap-2.5 shrink-0 group"
        >
          <Image src="/logo.webp" alt="Dynamic Tower" width={112} height={44} className="h-11 w-auto dark:brightness-0 dark:invert transition-transform group-hover:scale-105" />
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="font-black text-sm text-gray-900 dark:text-white tracking-tight">DYNAMIC TOWER</span>
            <span className="text-[10px] text-orange-500 font-semibold tracking-widest uppercase">Multipurpose Ltd</span>
          </div>
        </button>

        {/* Search Bar — desktop */}
        <form onSubmit={handleSearch} className="relative flex-1 max-w-sm hidden md:flex">
          <input
            type="text"
            placeholder="Search meals, snacks..."
            className="w-full pl-4 pr-10 py-2 rounded-full border border-gray-200 dark:border-gray-700
                       bg-gray-50 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500
                       focus:outline-none focus:border-orange-400 focus:bg-white dark:focus:bg-gray-700
                       text-sm transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </form>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1 text-sm font-medium">
          {[['Home', '/'], ['About', '/aboutus'], ['Services', '/services']].map(([label, path]) => (
            <button
              key={path}
              onClick={() => handleNavClick(path)}
              className="px-3 py-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:text-orange-500
                         hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all"
            >
              {label}
            </button>
          ))}
        </div>

        {/* Right: DarkMode + Profile + Cart + Hamburger */}
        <div className="flex items-center gap-2">
          <DarkModeToggle />

          <button
            onClick={() => router.push(user ? '/profile' : '/login')}
            className="hidden sm:flex items-center gap-1.5 text-sm font-medium
                       text-gray-600 dark:text-gray-300 hover:text-orange-500
                       px-3 py-1.5 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
            {user ? 'Profile' : 'Login'}
          </button>

          {/* Cart */}
          <button
            onClick={() => handleNavClick('/cart')}
            className="relative flex items-center gap-2 bg-orange-500 hover:bg-orange-600
                       active:scale-95 text-white px-4 py-2 rounded-full text-sm font-bold
                       transition-all shadow-md shadow-orange-500/30"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white text-orange-500
                               text-[10px] font-black rounded-full flex items-center justify-center
                               shadow-sm">
                {cartCount}
              </span>
            )}
          </button>

          {/* Hamburger */}
          <button
            onClick={() => setMobileMenuOpen((p) => !p)}
            className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300
                       hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {mobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* ─── Mobile Drawer ─── */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out
                       ${mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800
                        px-4 pt-3 pb-5 flex flex-col gap-3">

          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="relative w-full">
            <input
              type="text"
              placeholder="Search meals, snacks..."
              className="w-full pl-4 pr-10 py-2.5 rounded-full border border-gray-200 dark:border-gray-700
                         bg-gray-50 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500
                         focus:outline-none focus:border-orange-400 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </form>

          {/* Mobile Nav Links */}
          <div className="flex flex-col gap-1">
            {[['Home', '/'], ['About', '/aboutus'], ['Services', '/services'],
              [user ? 'Profile' : 'Login', user ? '/profile' : '/login']].map(([label, path]) => (
              <button
                key={path}
                onClick={() => handleNavClick(path)}
                className="text-left w-full px-4 py-3 rounded-xl text-sm font-medium
                           text-gray-700 dark:text-gray-200
                           hover:bg-orange-50 dark:hover:bg-gray-800
                           hover:text-orange-500 transition-colors"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
