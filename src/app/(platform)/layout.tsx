'use client';

import { useEffect, useRef, useState } from 'react';
import { PlatformSidebar } from '@/components/layout/PlatformSidebar';
import { PlatformTopbar } from '@/components/layout/PlatformTopbar';
import { cn } from '@/lib/utils';

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const skipNextWrite = useRef(true);

  useEffect(() => {
    setCollapsed(localStorage.getItem('sidebarCollapsed') === 'true');
  }, []);

  useEffect(() => {
    if (skipNextWrite.current) {
      skipNextWrite.current = false;
      return;
    }
    localStorage.setItem('sidebarCollapsed', String(collapsed));
  }, [collapsed]);

  return (
    <div className="min-h-screen">
      <PlatformSidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className={cn('transition-[padding] duration-300 ease-in-out', collapsed ? 'lg:pl-18' : 'lg:pl-60')}>
        <PlatformTopbar onHamburgerClick={() => {
          if (window.innerWidth < 1024) setMobileOpen(v => !v);
          else setCollapsed(v => !v);
        }} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {children}
        </main>
      </div>
    </div>
  );
}
