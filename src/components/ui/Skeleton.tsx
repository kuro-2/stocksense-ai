import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: number;
}

export function Skeleton({ className, width, height }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse bg-slate-200 rounded', className)}
      style={{ width, height: height ? `${height}px` : undefined }}
    />
  );
}

export function AnalysisSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton height={60} className="w-full" />
      <Skeleton height={120} className="w-full" />
      <Skeleton height={350} className="w-full" />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton height={80} />
        <Skeleton height={80} />
      </div>
      <Skeleton height={100} className="w-full" />
      <Skeleton height={80} className="w-full" />
    </div>
  );
}
