'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import axios from 'axios';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setUser } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'https://secondhand-product-marketplace.onrender.com'}/api/auth/login`, { email, password });
      setUser(data);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "appearance-none block w-full px-4 py-3 border-2 border-gray-300 rounded focus:outline-none focus:border-[#00a49f] text-[#002f34] bg-white transition-colors";
  const labelClass = "block text-sm font-bold text-[#002f34] mb-1";

  return (
    <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-white text-[#002f34]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full space-y-8 bg-white p-8 rounded border border-gray-300 shadow-[0_0_8px_rgba(0,0,0,0.1)]"
      >
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-[#002f34]">Welcome back</h2>
          <p className="mt-2 text-center text-sm text-[#406367]">Sign in to your account to continue</p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded text-sm text-center font-medium">
              {error}
            </div>
          )}

          <div>
            <label className={labelClass} htmlFor="email">Email Address</label>
            <input id="email" name="email" type="email" autoComplete="email" required
              value={email} onChange={e => setEmail(e.target.value)}
              className={inputClass} placeholder="you@example.com" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className={labelClass} htmlFor="password">Password</label>
              <a href="#" className="text-sm font-bold text-[#406367] hover:text-[#002f34] hover:underline">
                Forgot password?
              </a>
            </div>
            <input id="password" name="password" type="password" autoComplete="current-password" required
              value={password} onChange={e => setPassword(e.target.value)}
              className={inputClass} placeholder="••••••••" />
          </div>

          <button type="submit" disabled={loading}
            className="w-full flex justify-center py-3 px-4 font-bold rounded text-white bg-[#002f34] hover:bg-[#00a49f] disabled:opacity-70 transition-colors">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-[#406367]">
            Don't have an account?{' '}
            <Link href="/register" className="font-bold text-[#002f34] hover:underline">Sign up</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
