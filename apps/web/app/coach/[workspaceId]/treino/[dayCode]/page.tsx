'use client';

import { use } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { AuthGuard } from '@/components/AuthGuard';
import { DayEditor } from '@/features/coach/workout/DayEditor';

export default function CoachWorkoutDayEditPage({
  params,
}: {
  params: Promise<{ workspaceId: string; dayCode: string }>;
}) {
  const { workspaceId, dayCode } = use(params);
  const upperCode = dayCode.toUpperCase();

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
            <h1 className="text-bone text-3xl font-display tracking-wider mt-1">{upperCode}</h1>
            <p className="text-ash text-sm mt-1">Edite séries, reps e descanso. Salva ao tirar o foco do campo.</p>
          </header>

          <DayEditor workspaceId={workspaceId} dayCode={upperCode} />
        </main>
      </div>
    </AuthGuard>
  );
}
