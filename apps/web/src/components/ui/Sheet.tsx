'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Título no topo do sheet — opcional. */
  title?: string;
}

/**
 * Bottom sheet animado. Mobile-first; em telas largas vira modal centralizado.
 */
export function Sheet({ open, onClose, children, title }: SheetProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-obsidian/85 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div
        className={cn(
          'relative w-full max-w-md bg-cave border border-smoke',
          'rounded-t-2xl md:rounded-2xl',
          'max-h-[88dvh] md:max-h-[80dvh] flex flex-col',
          'animate-in slide-in-from-bottom-4 md:zoom-in-95 duration-300',
        )}
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {/* drag handle */}
        <div className="md:hidden flex justify-center pt-2.5 pb-1">
          <div className="w-10 h-1 rounded-full bg-smoke" />
        </div>

        {title ? (
          <div className="flex items-center justify-between px-5 pt-3 pb-3 border-b border-smoke">
            <h2 className="text-mute text-xs uppercase tracking-widest">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="size-8 rounded-full flex items-center justify-center text-mute hover:text-bone transition-colors"
              aria-label="fechar"
            >
              <X className="size-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 size-8 rounded-full flex items-center justify-center text-mute hover:text-bone bg-elevated/60 backdrop-blur z-10"
            aria-label="fechar"
          >
            <X className="size-4" />
          </button>
        )}

        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
