import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={cn('bg-white border border-slate-200 rounded-xl p-4 shadow-sm', className)}>
      {children}
    </div>
  );
}
