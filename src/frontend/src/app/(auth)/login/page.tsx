'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Coins, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { user, accessToken, refreshToken } = await api.login(email, password);
      setAuth(user, accessToken, refreshToken);
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E0FF00] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md brutalist-card p-8"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="h-12 w-12 bg-black flex items-center justify-center border-3 border-black">
            <Coins className="h-6 w-6 text-[#E0FF00]" />
          </div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">
            Equilibrium<span className="text-[#FF00F5]">.</span>
          </h1>
        </div>

        <h2 className="text-xl font-black uppercase mb-6">Sign In</h2>

        {error && (
          <div className="mb-4 flex items-center gap-2 bg-[#FF00F5] border-3 border-black p-3 text-white text-xs font-black uppercase">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com"
              required
              className="brutalist-input"
            />
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-widest mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="brutalist-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="brutalist-btn w-full bg-black text-[#E0FF00] hover:bg-[#FF00F5] hover:text-white mt-2"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-xs font-bold text-center">
          No account?{' '}
          <Link href="/register" className="font-black text-[#FF00F5] hover:underline">
            Register
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
