'use client';

import { cn } from '@/shared/lib';

export const LoadingSkeleton = () => {
  return (
    <div className={cn('animate-pulse space-y-6 py-6')}>
      {[1, 2, 3].map((i) => (
        <div key={i} className={cn('flex gap-3 px-4', i % 2 === 0 && 'bg-muted/30 py-6')}>
          <div className={cn('h-8 w-8 shrink-0 rounded-full bg-muted')} />
          <div className={cn('flex-1 space-y-3')}>
            <div className={cn('h-4 w-20 rounded bg-muted')} />
            <div className={cn('space-y-2')}>
              <div className={cn('h-3 w-full rounded bg-muted')} />
              <div className={cn('h-3 w-4/5 rounded bg-muted')} />
              <div className={cn('h-3 w-3/5 rounded bg-muted')} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
