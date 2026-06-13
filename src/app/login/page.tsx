'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Navbar } from '@/components/layout/Navbar';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/');
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2.5 font-display font-bold text-2xl text-(--foreground)">
              <Image src="/logo.svg" alt="StockSense AI" width={32} height={32} priority />
              <span>StockSense AI</span>
            </Link>
            <p className="text-(--muted) mt-2">Sign in to your account</p>
          </div>

          <div className="glass-card rounded-2xl p-8">
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">{error}</div>
              )}
              <div>
                <label className="block text-sm font-medium text-(--foreground) mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full bg-(--surface) border border-(--surface-border) rounded-lg px-3 py-2.5 text-sm text-(--foreground) placeholder:text-(--muted) focus:outline-none focus:border-emerald transition-colors"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-(--foreground) mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full bg-(--surface) border border-(--surface-border) rounded-lg px-3 py-2.5 text-sm text-(--foreground) placeholder:text-(--muted) focus:outline-none focus:border-emerald transition-colors"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald to-emerald-light text-white rounded-lg px-4 py-2.5 text-sm font-semibold shadow-md shadow-emerald/20 hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Sign in
              </button>
            </form>

            <p className="text-center text-sm text-(--muted) mt-6">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-emerald font-medium hover:underline">Sign up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
