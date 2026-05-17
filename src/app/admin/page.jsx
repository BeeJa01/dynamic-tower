'use client';

// app/admin/page.jsx
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

const AdminLogin = () => {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
      const userData = userDoc.data();

      if (!userData?.role || userData.role !== 'admin') {
        await auth.signOut();
        setError('Access denied. You are not an admin.');
        setLoading(false);
        return;
      }

      router.push('/admin/dashboard');
    } catch (err) {
      const map = {
        'auth/user-not-found':    'No account found with this email.',
        'auth/wrong-password':    'Incorrect password.',
        'auth/invalid-credential':'Invalid email or password.',
        'auth/too-many-requests': 'Too many attempts. Try again later.',
      };
      setError(map[err.code] || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-48 h-28 rounded-3xl overflow-hidden mx-auto mb-5
                           shadow-2xl shadow-orange-900/40">
            <img
              src="/logo.webp"
              alt="Dynamic Tower"
              className="w-full h-full object-cover object-center"
            />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
          <p className="text-gray-400 text-sm mt-1">Dynamic Tower Multipurpose LTD</p>
        </div>

        <div className="bg-[#1e293b] rounded-2xl p-6 border border-gray-700">

          {/* Email */}
          <div className="mb-4">
            <label className="text-xs font-semibold uppercase tracking-widest
                               text-gray-400 mb-1.5 block">
              Admin Email
            </label>
            <input
              type="email"
              placeholder="admin@dynamictower.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              className="w-full px-4 py-3 rounded-xl bg-[#0f172a] border border-gray-700
                         text-white placeholder-gray-500 focus:outline-none
                         focus:border-[#E87121] text-sm transition-colors"
            />
          </div>

          {/* Password */}
          <div className="mb-5">
            <label className="text-xs font-semibold uppercase tracking-widest
                               text-gray-400 mb-1.5 block">
              Password
            </label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Your admin password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full px-4 py-3 rounded-xl bg-[#0f172a] border border-gray-700
                           text-white placeholder-gray-500 focus:outline-none
                           focus:border-[#E87121] text-sm transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPass((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2
                           text-gray-500 hover:text-gray-300 text-xs"
              >
                {showPass ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-900/30 border border-red-500/40 rounded-xl px-4 py-3 mb-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Login Button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all
                        active:scale-95
                        ${loading
                          ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                          : 'bg-[#E87121] hover:bg-orange-600 text-white'
                        }`}
          >
            {loading ? 'Verifying...' : '🔐 Login as Admin'}
          </button>

          <p className="text-center text-xs text-gray-600 mt-4">
            This portal is restricted to authorized personnel only.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
