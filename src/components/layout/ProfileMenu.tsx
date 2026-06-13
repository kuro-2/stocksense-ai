'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, LogOut, LogIn, UserPlus, ChevronDown } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export function ProfileMenu() {
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    setOpen(false);
    router.push('/');
    router.refresh();
  }

  if (loading) {
    return <div className="w-9 h-9 rounded-lg glass-card animate-pulse" />;
  }

  return (
    <div ref={wrapperRef} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 h-9 px-2.5 rounded-lg glass-card glass-card-hover transition-colors text-slate-600 dark:text-slate-300 hover:text-emerald"
      >
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald to-emerald-light flex items-center justify-center flex-shrink-0">
          <User className="w-3.5 h-3.5 text-white" />
        </div>
        {user && <span className="hidden sm:inline text-sm font-medium max-w-32 truncate">{user.email}</span>}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 glass-strong rounded-xl shadow-lg overflow-hidden z-50 py-1.5">
          {user ? (
            <>
              <div className="px-3.5 py-2.5 border-b border-(--surface-border)">
                <p className="text-xs text-(--muted)">Signed in as</p>
                <p className="text-sm font-medium text-(--foreground) truncate">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-(--surface-hover) hover:text-red-500 transition-colors text-left"
              >
                <LogOut className="w-4 h-4" /> Log out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-(--surface-hover) hover:text-emerald transition-colors"
              >
                <LogIn className="w-4 h-4" /> Log in
              </Link>
              <Link
                href="/signup"
                onClick={() => setOpen(false)}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-(--surface-hover) hover:text-emerald transition-colors"
              >
                <UserPlus className="w-4 h-4" /> Sign up
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
