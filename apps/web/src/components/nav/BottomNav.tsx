'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, Dumbbell, UtensilsCrossed, BarChart3, User } from 'lucide-react';
import { cn } from '@/lib/cn';

const items = [
  { href: '/', label: 'Hoje', icon: Calendar },
  { href: '/treino', label: 'Treino', icon: Dumbbell },
  { href: '/dieta', label: 'Dieta', icon: UtensilsCrossed },
  { href: '/relatorios', label: 'Relatórios', icon: BarChart3 },
  { href: '/perfil', label: 'Perfil', icon: User },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-smoke bg-obsidian/95 backdrop-blur supports-[backdrop-filter]:bg-obsidian/80 pb-[env(safe-area-inset-bottom)]">
      <ul className="grid grid-cols-5 max-w-md mx-auto">
        {items.map((it) => {
          const Icon = it.icon;
          const active = it.href === '/' ? pathname === '/' : pathname.startsWith(it.href);
          return (
            <li key={it.href}>
              <Link
                href={it.href as never}
                className={cn(
                  'flex flex-col items-center justify-center py-3 gap-1 transition-colors',
                  active ? 'text-ember' : 'text-mute hover:text-ash',
                )}
              >
                <Icon className="size-5" strokeWidth={active ? 2.4 : 1.8} />
                <span className="text-[10px] uppercase tracking-widest">{it.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
