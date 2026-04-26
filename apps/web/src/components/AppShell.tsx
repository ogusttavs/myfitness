'use client';

import type { ReactNode } from 'react';
import { BottomNav } from './nav/BottomNav';
import { AuthGuard } from './AuthGuard';
import { OnboardingGuard } from './OnboardingGuard';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <OnboardingGuard>
        <div className="min-h-dvh flex flex-col">
          <main
            className="flex-1 max-w-md w-full mx-auto px-5 pt-6"
            style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom))' }}
          >
            {children}
          </main>
          <BottomNav />
        </div>
      </OnboardingGuard>
    </AuthGuard>
  );
}
