'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { cn } from '@/lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className={cn(
        'relative inline-flex items-center justify-center w-9 h-9 rounded-lg glass-card glass-card-hover transition-colors',
        'text-slate-600 dark:text-slate-300 hover:text-emerald',
        className
      )}
    >
      <Sun className={cn('w-4 h-4 absolute transition-all duration-300', theme === 'dark' ? 'opacity-0 -rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100')} />
      <Moon className={cn('w-4 h-4 absolute transition-all duration-300', theme === 'dark' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-50')} />
    </button>
  );
}
