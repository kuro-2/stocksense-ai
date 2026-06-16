'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, TrendingUp } from 'lucide-react';
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
      router.push('/dashboard');
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4" style={{ paddingBlock: 'var(--s9)' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          {/* Brand mark */}
          <div style={{ textAlign: 'center', marginBottom: 'var(--s7)' }}>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
              <span className="mark" style={{ width: 38, height: 38, borderRadius: 11, background: 'var(--accent-soft)', color: 'var(--accent-deep)', display: 'grid', placeItems: 'center', border: '1px solid var(--accent-soft)' }}>
                <TrendingUp width={20} height={20} strokeWidth={2.5} />
              </span>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 20, letterSpacing: '-0.01em', color: 'var(--foreground)' }}>
                StockSense AI
              </span>
            </Link>
            <p style={{ marginTop: 'var(--s3)', color: 'var(--ink-soft)', fontSize: 15 }}>Sign in to your account</p>
          </div>

          {/* Form card */}
          <div className="panel" style={{ padding: 'var(--s7)' }}>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s4)' }}>
              {error && (
                <div style={{ padding: '12px 14px', background: 'rgba(200,60,60,0.1)', border: '1px solid rgba(200,60,60,0.25)', borderRadius: 10, fontSize: 14, color: 'var(--down)' }}>
                  {error}
                </div>
              )}

              <div className="field">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                />
              </div>

              <div className="field">
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', marginTop: 'var(--s2)', opacity: loading ? 0.6 : 1 }}
              >
                {loading && <Loader2 width={16} height={16} style={{ animation: 'spin 1s linear infinite' }} />}
                Sign in
              </button>
            </form>

            <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--ink-mute)', marginTop: 'var(--s5)' }}>
              Don&apos;t have an account?{' '}
              <Link href="/signup" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign up free</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
