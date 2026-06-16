'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Star, Wallet, Globe2, SlidersHorizontal,
  Bell, FlaskConical, LineChart, PanelLeftClose, PanelLeft, X, GitCompare, Rocket, TrendingUp,
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
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full flex flex-col transition-all duration-300 ease-in-out',
          'border-r border-(--sidebar-border)',
          'lg:translate-x-0',
          collapsed ? 'w-[72px]' : 'w-60',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
        style={{ background: 'var(--sidebar-bg)', backdropFilter: 'blur(16px)' }}
      >
        {/* Brand */}
        <div
          className={cn(
            'flex items-center px-3 border-b border-(--sidebar-border)',
            collapsed ? 'justify-center' : 'justify-between'
          )}
          style={{ height: 66 }}
        >
          <Link href="/dashboard" className="sb-brand overflow-hidden" title="StockSense AI">
            <span className="mark" style={{ flexShrink: 0 }}>
              <TrendingUp width={18} height={18} strokeWidth={2.5} />
            </span>
            {!collapsed && <span className="truncate">StockSense AI</span>}
          </Link>

          {!collapsed && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden sb-collapse"
              aria-label="Close menu"
            >
              <X width={18} height={18} />
            </button>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto thin-scrollbar py-3 px-2 flex flex-col gap-0.5">
          {NAV_ITEMS.map(({ href, label, icon: Icon, match }) => {
            const active = match(pathname);
            return (
              <Link
                key={href}
                href={href}
                onClick={onCloseMobile}
                title={collapsed ? label : undefined}
                className={cn('sb-item', active && 'active', collapsed && 'justify-center px-2')}
              >
                <Icon width={19} height={19} style={{ flexShrink: 0 }} />
                {!collapsed && <span className="truncate">{label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle — desktop only */}
        <div className="hidden lg:block border-t border-(--sidebar-border) p-2">
          <button
            onClick={onToggleCollapse}
            className={cn('sb-item w-full', collapsed && 'justify-center px-2')}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed
              ? <PanelLeft width={19} height={19} />
              : <><PanelLeftClose width={19} height={19} /><span>Collapse</span></>
            }
          </button>
        </div>
      </aside>
    </>
  );
}
