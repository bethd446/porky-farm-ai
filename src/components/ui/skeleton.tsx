import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-lg bg-gray-200', className)}
      {...props}
    />
  );
}

// Composant CardSkeleton
function CardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <Skeleton className="h-4 w-1/3 mb-4" />
      <Skeleton className="h-8 w-1/2 mb-2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}

// Composant StatCardSkeleton
function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <Skeleton className="h-4 w-24 mb-4" />
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-3 w-40" />
        </div>
        <Skeleton className="w-12 h-12 rounded-lg" />
      </div>
    </div>
  );
}

export { Skeleton, CardSkeleton, StatCardSkeleton };
