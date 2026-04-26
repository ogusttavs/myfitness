import type { LucideIcon } from 'lucide-react';

export function EmptyState({
  icon: Icon,
  title,
  subtext,
  action,
}: {
  icon: LucideIcon;
  title: string;
  subtext?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-dashed border-smoke bg-cave/40 p-8 flex flex-col items-center text-center gap-3">
      <div className="size-12 rounded-full bg-elevated flex items-center justify-center">
        <Icon className="size-5 text-mute" strokeWidth={1.6} />
      </div>
      <div>
        <p className="text-bone font-medium text-sm">{title}</p>
        {subtext ? <p className="text-mute text-xs mt-1.5 max-w-xs">{subtext}</p> : null}
      </div>
      {action}
    </div>
  );
}
