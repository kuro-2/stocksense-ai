import { cn } from '@/lib/utils';

const variants = {
  success: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-400/10 dark:text-green-400 dark:border-green-400/20',
  danger:  'bg-red-100 text-red-800 border-red-200 dark:bg-red-400/10 dark:text-red-400 dark:border-red-400/20',
  warning: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-400/10 dark:text-amber-400 dark:border-amber-400/20',
  info:    'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-400/10 dark:text-blue-400 dark:border-blue-400/20',
  neutral: 'bg-(--surface-strong) text-(--muted) border-(--surface-border)',
};

interface BadgeProps {
  variant?: keyof typeof variants;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'neutral', children, className }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border', variants[variant], className)}>
      {children}
    </span>
  );
}
