'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2, Mail } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Navbar } from '@/components/layout/Navbar';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else if (data.session) {
      router.push('/dashboard');
    } else {
      setSuccess(true);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md text-center glass-card rounded-2xl p-8">
            <div className="w-12 h-12 rounded-full bg-emerald/10 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-emerald" />
            </div>
            <h2 className="text-xl font-bold text-(--foreground) mb-2">Check your email</h2>
            <p className="text-(--muted) text-sm mb-6">
              We sent a confirmation link to <strong className="text-(--foreground)">{email}</strong>. Click it to activate your account.
            </p>
            <Link href="/login" className="text-emerald text-sm font-medium hover:underline">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    );
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
            <p className="text-(--muted) mt-2">Create your free account</p>
          </div>

          <div className="glass-card rounded-2xl p-8">
            <form onSubmit={handleSignup} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">{error}</div>
              )}
              <div>
                <label className="block text-sm font-medium text-(--foreground) mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  className="w-full bg-(--surface) border border-(--surface-border) rounded-lg px-3 py-2.5 text-sm text-(--foreground) placeholder:text-(--muted) focus:outline-none focus:border-emerald transition-colors"
                  placeholder="Your name"
                />
              </div>
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
                  placeholder="Min 8 characters"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald to-emerald-light text-white rounded-lg px-4 py-2.5 text-sm font-semibold shadow-md shadow-emerald/20 hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Create account
              </button>
            </form>

            <p className="text-center text-sm text-(--muted) mt-6">
              Already have an account?{' '}
              <Link href="/login" className="text-emerald font-medium hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
