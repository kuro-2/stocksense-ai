'use client';

import Link from 'next/link';
import { Menu, History as HistoryIcon } from 'lucide-react';
import { QuickSearch } from './QuickSearch';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { ProfileMenu } from './ProfileMenu';

export function PlatformTopbar({ onHamburgerClick }: { onHamburgerClick: () => void }) {
  return (
    <header
      className="sticky top-0 z-30 flex items-center gap-3 px-4 sm:px-6 lg:pl-3 border-b border-(--sidebar-border)"
      style={{ height: 66, background: 'var(--sidebar-bg)', backdropFilter: 'blur(16px)' }}
    >
      <button
        onClick={onHamburgerClick}
        className="icon-btn shrink-0"
        aria-label="Toggle menu"
      >
        <Menu width={20} height={20} />
      </button>

      <div className="flex-1 flex justify-start">
        <QuickSearch />
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <Link
          href="/history"
          title="Analysis history"
          className="icon-btn"
        >
          <HistoryIcon width={18} height={18} />
        </Link>
        <ThemeToggle />
        <ProfileMenu />
      </div>
    </header>
  );
}
