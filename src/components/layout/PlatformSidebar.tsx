'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Star, Wallet, Globe2, SlidersHorizontal,
  Bell, FlaskConical, LineChart, ChevronsLeft, ChevronsRight, X, GitCompare, Rocket,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, match: (p: string) => p === '/dashboard' },
  { href: '/analysis', label: 'Analysis', icon: LineChart, match: (p: string) => p.startsWith('/analysis') },
  { href: '/compare', label: 'Compare', icon: GitCompare, match: (p: string) => p.startsWith('/compare') },
  { href: '/watchlist', label: 'Watchlist', icon: Star, match: (p: string) => p.startsWith('/watchlist') },
  { href: '/portfolio', label: 'Portfolio', icon: Wallet, match: (p: string) => p.startsWith('/portfolio') },
  { href: '/markets', label: 'Markets', icon: Globe2, match: (p: string) => p.startsWith('/markets') },
  { href: '/screener', label: 'Screener', icon: SlidersHorizontal, match: (p: string) => p.startsWith('/screener') },
  { href: '/ipo', label: 'IPO Tracker', icon: Rocket, match: (p: string) => p.startsWith('/ipo') },
  { href: '/alerts', label: 'Alerts', icon: Bell, match: (p: string) => p.startsWith('/alerts') },
  { href: '/backtest', label: 'Backtest', icon: FlaskConical, match: (p: string) => p.startsWith('/backtest') },
];

interface PlatformSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function PlatformSidebar({ collapsed, onToggleCollapse, mobileOpen, onCloseMobile }: PlatformSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full glass-panel flex flex-col transition-all duration-300 ease-in-out',
          'lg:translate-x-0',
          collapsed ? 'w-[76px]' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo / brand */}
        <div className={cn('flex items-center h-16 px-4 border-b border-(--sidebar-border)', collapsed ? 'justify-center' : 'justify-between')}>
          <Link href="/dashboard" className="flex items-center gap-2.5 font-display font-bold text-lg text-(--foreground) overflow-hidden">
            <Image src="/logo.svg" alt="StockSense AI" width={26} height={26} className="flex-shrink-0" />
            {!collapsed && <span className="whitespace-nowrap">StockSense AI</span>}
          </Link>
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-(--muted) hover:text-emerald hover:bg-(--surface-hover) transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto thin-scrollbar py-4 px-3 space-y-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon, match }) => {
            const active = match(pathname);
            return (
              <Link
                key={href}
                href={href}
                onClick={onCloseMobile}
                title={collapsed ? label : undefined}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all group relative',
                  collapsed && 'justify-center',
                  active
                    ? 'bg-gradient-to-r from-emerald to-emerald-light text-white shadow-md shadow-emerald/20'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-(--surface-hover) hover:text-(--foreground)'
                )}
              >
                <Icon className={cn('w-5 h-5 flex-shrink-0', active ? 'text-white' : 'text-slate-400 group-hover:text-emerald')} />
                {!collapsed && <span className="truncate">{label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle (desktop only) */}
        <div className="hidden lg:flex border-t border-(--sidebar-border) p-3">
          <button
            onClick={onToggleCollapse}
            className={cn(
              'flex items-center gap-2 w-full rounded-xl px-3 py-2.5 text-sm font-medium text-(--muted) hover:bg-(--surface-hover) hover:text-emerald transition-colors',
              collapsed && 'justify-center'
            )}
          >
            {collapsed ? <ChevronsRight className="w-5 h-5" /> : <><ChevronsLeft className="w-5 h-5" /> <span>Collapse</span></>}
          </button>
        </div>
      </aside>
    </>
  );
}
