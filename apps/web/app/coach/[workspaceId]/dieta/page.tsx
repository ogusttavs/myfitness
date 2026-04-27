'use client';

import { use } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { AuthGuard } from '@/components/AuthGuard';
import { MealPlanEditor } from '@/features/coach/diet/MealPlanEditor';

export default function CoachDietEditPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = use(params);

  return (
    <AuthGuard>
      <div className="min-h-dvh">
        <main
          className="max-w-md w-full mx-auto px-5 pt-6"
          style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }}
        >
          <Link
            href={`/coach/${workspaceId}` as never}
            className="inline-flex items-center gap-1 text-mute text-xs uppercase tracking-widest hover:text-ash mb-3"
          >
            <ChevronLeft className="size-4" />
            voltar
          </Link>

          <header className="mb-6">
            <p className="text-mute text-xs uppercase tracking-widest">editor coach</p>
            <h1 className="text-bone text-3xl font-display tracking-wider mt-1">DIETA</h1>
            <p className="text-ash text-sm mt-1">Edite refeições, itens e macros. Salva ao tirar o foco do campo.</p>
          </header>

          <MealPlanEditor workspaceId={workspaceId} />
        </main>
      </div>
    </AuthGuard>
  );
}
