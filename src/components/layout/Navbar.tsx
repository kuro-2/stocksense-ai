'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5 font-display font-bold text-xl text-(--ink)">
            <Image src="/logo.svg" alt="StockSense AI" width={28} height={28} priority />
            <span>StockSense AI</span>
          </Link>
          <div className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <Link href="/" className="hover:text-(--emerald) transition-colors">Home</Link>
            <Link href="/about" className="hover:text-(--emerald) transition-colors">How It Works</Link>
            <Link href="/watchlist" className="hover:text-(--emerald) transition-colors">Watchlist</Link>
            <Link href="/portfolio" className="hover:text-(--emerald) transition-colors">Portfolio</Link>
            <Link href="/markets" className="hover:text-(--emerald) transition-colors">Markets</Link>
            <Link href="/screener" className="hover:text-(--emerald) transition-colors">Screener</Link>
            <Link href="/history" className="hover:text-(--emerald) transition-colors">History</Link>
            <Link href="/alerts" className="hover:text-(--emerald) transition-colors">Alerts</Link>
            <Link href="/backtest" className="hover:text-(--emerald) transition-colors">Backtest</Link>
          </div>
          <div className="flex items-center gap-3">
            {!loading && user ? (
              <>
                <span className="hidden sm:inline text-sm text-slate-500 truncate max-w-40">{user.email}</span>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-slate-600 hover:text-(--emerald) transition-colors"
                >
                  Log out
                </button>
              </>
            ) : !loading ? (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-slate-600 hover:text-(--emerald) transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="text-sm font-semibold bg-(--ink) text-white px-4 py-2 rounded-lg hover:bg-(--ink-2) transition-colors"
                >
                  Sign up
                </Link>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  );
}
