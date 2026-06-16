'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Mail, TrendingUp } from 'lucide-react';
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

  const brand = (
    <div style={{ textAlign: 'center', marginBottom: 'var(--s7)' }}>
      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
        <span className="mark" style={{ width: 38, height: 38, borderRadius: 11, background: 'var(--accent-soft)', color: 'var(--accent-deep)', display: 'grid', placeItems: 'center', border: '1px solid var(--accent-soft)' }}>
          <TrendingUp width={20} height={20} strokeWidth={2.5} />
        </span>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 20, letterSpacing: '-0.01em', color: 'var(--foreground)' }}>
          StockSense AI
        </span>
      </Link>
    </div>
  );

  if (success) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4" style={{ paddingBlock: 'var(--s9)' }}>
          <div style={{ width: '100%', maxWidth: 400 }}>
            {brand}
            <div className="panel" style={{ padding: 'var(--s7)', textAlign: 'center' }}>
              <div className="e-ic" style={{ margin: '0 auto var(--s5)' }}>
                <Mail width={30} height={30} />
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 22, letterSpacing: '-0.01em' }}>Check your email</h2>
              <p style={{ color: 'var(--ink-soft)', fontSize: 15, marginTop: 'var(--s3)', lineHeight: 1.6 }}>
                We sent a confirmation link to{' '}
                <strong style={{ color: 'var(--foreground)' }}>{email}</strong>.{' '}
                Click it to activate your account.
              </p>
              <div style={{ marginTop: 'var(--s5)' }}>
                <Link href="/login" style={{ color: 'var(--accent)', fontWeight: 600, fontSize: 14 }}>
                  Back to login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4" style={{ paddingBlock: 'var(--s9)' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          {brand}
          <p style={{ textAlign: 'center', marginTop: 'calc(-1 * var(--s4))', marginBottom: 'var(--s6)', color: 'var(--ink-soft)', fontSize: 15 }}>
            Create your free account
          </p>

          <div className="panel" style={{ padding: 'var(--s7)' }}>
            <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s4)' }}>
              {error && (
                <div style={{ padding: '12px 14px', background: 'rgba(200,60,60,0.1)', border: '1px solid rgba(200,60,60,0.25)', borderRadius: 10, fontSize: 14, color: 'var(--down)' }}>
                  {error}
                </div>
              )}

              <div className="field">
                <label>Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  placeholder="Your name"
                />
              </div>

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
                  placeholder="Min 8 characters"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', marginTop: 'var(--s2)', opacity: loading ? 0.6 : 1 }}
              >
                {loading && <Loader2 width={16} height={16} style={{ animation: 'spin 1s linear infinite' }} />}
                Create account
              </button>
            </form>

            <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--ink-mute)', marginTop: 'var(--s5)' }}>
              Already have an account?{' '}
              <Link href="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in</Link>
            </p>
          </div>

          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--ink-mute)', marginTop: 'var(--s4)', lineHeight: 1.5 }}>
            By signing up you agree to our{' '}
            <Link href="/legal/terms" style={{ color: 'var(--ink-soft)' }}>Terms</Link>
            {' '}and{' '}
            <Link href="/legal/privacy" style={{ color: 'var(--ink-soft)' }}>Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
