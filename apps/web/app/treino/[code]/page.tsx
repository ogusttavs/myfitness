import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { workoutDays, totalSetsInDay, estimatedDurationMinutes } from '@/data/protocol';
import { WorkoutDayClient } from '@/features/execution/WorkoutDayClient';

export function generateStaticParams() {
  return workoutDays.map((d) => ({ code: d.code.toLowerCase() }));
}

export default async function WorkoutDayPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const day = workoutDays.find((d) => d.code.toLowerCase() === code);
  if (!day) return notFound();

  return (
    <AppShell>
      <header className="mb-5">
        <Link
          href="/treino"
          className="inline-flex items-center gap-1 text-mute text-xs uppercase tracking-widest hover:text-ash mb-3"
        >
          <ChevronLeft className="size-4" />
          treino
        </Link>
        <p className="text-mute text-xs uppercase tracking-widest">Dia {day.index + 1}</p>
        <h1 className="text-bone text-4xl font-display tracking-wider mt-1">{day.code}</h1>
        <p className="text-ash text-sm mt-1">{day.focus}</p>
        <div className="flex items-center gap-3 mt-3 text-xs text-mute">
          <span>{day.exercises.length} exerc.</span>
          <span className="size-1 rounded-full bg-smoke" />
          <span>{totalSetsInDay(day)} séries</span>
          <span className="size-1 rounded-full bg-smoke" />
          <span>~{estimatedDurationMinutes(day)} min</span>
        </div>
      </header>

      <WorkoutDayClient day={day} />
    </AppShell>
  );
}
