import { cn } from '@/lib/cn';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-md bg-elevated/60 animate-pulse',
        className,
      )}
    />
  );
}
