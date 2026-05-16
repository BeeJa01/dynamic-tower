'use client';
// app/login/page.jsx

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Login() {
  const router = useRouter();
  const { signIn, signUp, signInWithGoogle } = useAuth();

  const [isSignUp, setIsSignUp]   = useState(false);
  const [form, setForm]           = useState({ name: '', email: '', password: '', phone: '' });
  const [errors, setErrors]       = useState({});
  const [loading, setLoading]     = useState(false);
  const [firebaseError, setFirebaseError] = useState('');
  const [showPassword, setShowPassword]   = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
    setFirebaseError('');
  };

  const validate = () => {
    const e = {};
    if (isSignUp && !form.name.trim())          e.name     = 'Full name is required';
    if (!form.email.trim())                     e.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email    = 'Enter a valid email';
    if (!form.password)                         e.password = 'Password is required';
    else if (form.password.length < 6)          e.password = 'Password must be at least 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const friendlyError = (code) => {
    const map = {
      'auth/user-not-found':       'No account found with this email.',
      'auth/wrong-password':       'Incorrect password. Please try again.',
      'auth/email-already-in-use': 'An account already exists with this email.',
      'auth/too-many-requests':    'Too many attempts. Please try again later.',
      'auth/invalid-credential':   'Invalid email or password.',
    };
    return map[code] || 'Something went wrong. Please try again.';
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(form);
      } else {
        await signIn({ email: form.email, password: form.password });
      }
      router.push('/profile');
    } catch (err) {
      setFirebaseError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      router.push('/profile');
    } catch (err) {
      setFirebaseError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-3 rounded-xl border text-sm dark:bg-gray-900 dark:text-white
     focus:outline-none focus:border-[#E87121] transition-colors
     ${errors[field] ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'}`;

  return (
    <div className="min-h-screen bg-amber-50 dark:bg-gray-950 flex items-center
                    justify-center px-4 py-10">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/sticker.webp" alt="Dynamic Tower" width={64} height={64}
            className="mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {isSignUp
              ? 'Sign up to track your orders and save your address'
              : 'Login to your Dynamic Tower account'}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm
                        border border-gray-100 dark:border-gray-700">

          {/* Google Button */}
          <button onClick={handleGoogle} disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4
                       rounded-xl border border-gray-200 dark:border-gray-700
                       bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800
                       text-gray-700 dark:text-gray-300 text-sm font-medium transition-all mb-4">
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
              <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
              <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18z"/>
              <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            <span className="text-xs text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          </div>

          {/* Name (sign up only) */}
          {isSignUp && (
            <div className="mb-4">
              <label className="text-xs font-semibold uppercase tracking-widest
                                 text-gray-400 mb-1.5 block">Full Name</label>
              <input type="text" name="name" placeholder="e.g. Adaeze Okonkwo"
                value={form.name} onChange={handleChange} className={inputClass('name')} />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>
          )}

          {/* Phone (sign up only) */}
          {isSignUp && (
            <div className="mb-4">
              <label className="text-xs font-semibold uppercase tracking-widest
                                 text-gray-400 mb-1.5 block">
                Phone Number <span className="normal-case font-normal">(optional)</span>
              </label>
              <input type="tel" name="phone" placeholder="e.g. 08012345678"
                value={form.phone} onChange={handleChange} className={inputClass('phone')} />
            </div>
          )}

          {/* Email */}
          <div className="mb-4">
            <label className="text-xs font-semibold uppercase tracking-widest
                               text-gray-400 mb-1.5 block">Email Address</label>
            <input type="email" name="email" placeholder="e.g. adaeze@gmail.com"
              value={form.email} onChange={handleChange} className={inputClass('email')} />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="text-xs font-semibold uppercase tracking-widest
                               text-gray-400 mb-1.5 block">Password</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} name="password"
                placeholder={isSignUp ? 'Min. 6 characters' : 'Your password'}
                value={form.password} onChange={handleChange} className={inputClass('password')} />
              <button type="button" onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2
                           text-gray-400 hover:text-gray-600 text-xs">
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
          </div>

          {/* Firebase error */}
          {firebaseError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200
                            dark:border-red-500/30 rounded-xl px-4 py-3 mb-4">
              <p className="text-red-500 text-sm">{firebaseError}</p>
            </div>
          )}

          {/* Submit */}
          <button onClick={handleSubmit} disabled={loading}
            className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all active:scale-95
              ${loading
                ? 'bg-gray-300 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-[#E87121] hover:bg-orange-600 text-white'}`}>
            {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Login'}
          </button>

          {/* Toggle */}
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button onClick={() => { setIsSignUp((p) => !p); setErrors({}); setFirebaseError(''); }}
              className="text-[#E87121] font-semibold hover:underline">
              {isSignUp ? 'Login' : 'Sign Up'}
            </button>
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          By continuing you agree to Dynamic Tower`s Terms of Service
        </p>
      </div>
    </div>
  );
}
