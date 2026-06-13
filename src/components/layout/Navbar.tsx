'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Menu, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import type { User } from '@supabase/supabase-js';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/features', label: 'Features' },
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/who-its-for', label: "Who It's For" },
  { href: '/get-started', label: 'Get Started' },
];

export function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/');
    router.refresh();
  }

  return (
    <nav className="sticky top-0 z-50 glass-panel">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5 font-display font-bold text-xl text-(--foreground)">
            <Image src="/logo.svg" alt="StockSense AI" width={28} height={28} priority />
            <span>StockSense AI</span>
          </Link>

          <div className="hidden md:flex items-center gap-7 text-sm font-medium text-(--muted)">
            {NAV_LINKS.map(link => (
              <Link key={link.href} href={link.href} className="hover:text-emerald transition-colors">
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle className="hidden sm:inline-flex" />
            {!loading && user ? (
              <>
                <Link
                  href="/dashboard"
                  className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold bg-gradient-to-r from-emerald to-emerald-light text-white px-4 py-2 rounded-lg shadow-md shadow-emerald/20 hover:opacity-90 transition-opacity"
                >
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="hidden sm:inline text-sm font-medium text-(--muted) hover:text-emerald transition-colors"
                >
                  Log out
                </button>
              </>
            ) : !loading ? (
              <>
                <Link
                  href="/login"
                  className="hidden sm:inline text-sm font-medium text-(--muted) hover:text-emerald transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="hidden sm:inline-flex text-sm font-semibold bg-gradient-to-r from-emerald to-emerald-light text-white px-4 py-2 rounded-lg shadow-md shadow-emerald/20 hover:opacity-90 transition-opacity"
                >
                  Get Started
                </Link>
              </>
            ) : null}

            <button
              onClick={() => setMobileOpen(v => !v)}
              className="md:hidden p-2 rounded-lg text-(--muted) hover:text-emerald hover:bg-(--surface-hover) transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-1">
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-(--muted) hover:text-emerald hover:bg-(--surface-hover) transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="flex items-center gap-3 px-3 pt-2">
              <ThemeToggle />
              {!loading && user ? (
                <>
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="flex-1 text-center text-sm font-semibold bg-gradient-to-r from-emerald to-emerald-light text-white px-4 py-2 rounded-lg">
                    Dashboard
                  </Link>
                  <button onClick={handleLogout} className="text-sm font-medium text-(--muted) hover:text-emerald transition-colors">
                    Log out
                  </button>
                </>
              ) : !loading ? (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-(--muted) hover:text-emerald transition-colors">
                    Login
                  </Link>
                  <Link href="/signup" onClick={() => setMobileOpen(false)} className="flex-1 text-center text-sm font-semibold bg-gradient-to-r from-emerald to-emerald-light text-white px-4 py-2 rounded-lg">
                    Get Started
                  </Link>
                </>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
