'use client';

import Link from 'next/link';
import { Menu, History as HistoryIcon } from 'lucide-react';
import { QuickSearch } from './QuickSearch';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { ProfileMenu } from './ProfileMenu';

export function PlatformTopbar({ onOpenMobileSidebar }: { onOpenMobileSidebar: () => void }) {
  return (
    <header className="sticky top-0 z-30 h-16 glass-panel flex items-center gap-3 px-4 sm:px-6">
      <button
        onClick={onOpenMobileSidebar}
        className="lg:hidden p-2 rounded-lg text-(--muted) hover:text-emerald hover:bg-(--surface-hover) transition-colors flex-shrink-0"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex-1 flex justify-center sm:justify-start">
        <QuickSearch />
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <Link
          href="/history"
          title="Analysis history"
          className="inline-flex items-center justify-center w-9 h-9 rounded-lg glass-card glass-card-hover transition-colors text-slate-600 dark:text-slate-300 hover:text-emerald"
        >
          <HistoryIcon className="w-4 h-4" />
        </Link>
        <ThemeToggle />
        <ProfileMenu />
      </div>
    </header>
  );
}
