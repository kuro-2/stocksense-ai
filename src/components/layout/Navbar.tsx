'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Menu, X, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { cn } from '@/lib/utils';
import type { User } from '@supabase/supabase-js';

const NAV_LINKS = [
  { href: '/features', label: 'Features' },
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/who-its-for', label: "Who It's For" },
  { href: '/get-started', label: 'Get Started' },
];

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/');
    router.refresh();
  }

  return (
    <nav className={cn('site-nav', scrolled && 'scrolled')}>
      <div className="site-nav-in wrap">
        <Link href="/" className="brand" aria-label="StockSense AI home">
          <span className="mark">
            <TrendingUp width={18} height={18} strokeWidth={2.5} />
          </span>
          <span>StockSense AI</span>
        </Link>

        <div className="site-nav-links">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={pathname.startsWith(link.href) ? 'active' : ''}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="site-nav-right">
          <ThemeToggle />

          {!loading && user ? (
            <>
              <Link
                href="/dashboard"
                className="btn btn-primary hidden sm:inline-flex"
                style={{ padding: '9px 18px', fontSize: 14 }}
              >
                <LayoutDashboard width={15} height={15} />
                <span>Dashboard</span>
              </Link>
              <button onClick={handleLogout} className="logout hidden sm:block">Log out</button>
            </>
          ) : !loading ? (
            <>
              <Link href="/login" className="logout hidden sm:block">Login</Link>
              <Link href="/signup" className="btn btn-primary hidden sm:inline-flex">
                Get Started
              </Link>
            </>
          ) : null}

          <button
            onClick={() => setMobileOpen(v => !v)}
            className="icon-btn sm:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen
              ? <X width={20} height={20} />
              : <Menu width={20} height={20} />
            }
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="wrap sm:hidden" style={{ paddingBottom: 20 }}>
          <div style={{ borderTop: '1px solid var(--line)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  padding: '11px 14px',
                  borderRadius: 11,
                  fontSize: 15,
                  fontWeight: 500,
                  color: pathname.startsWith(link.href) ? 'var(--foreground)' : 'var(--ink-soft)',
                  background: pathname.startsWith(link.href) ? 'var(--panel)' : 'transparent',
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
            {!loading && user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="btn btn-primary"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="logout">Log out</button>
              </>
            ) : !loading ? (
              <>
                <Link href="/login" onClick={() => setMobileOpen(false)} className="logout">Login</Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="btn btn-primary"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Get Started
                </Link>
              </>
            ) : null}
          </div>
        </div>
      )}
    </nav>
  );
}
