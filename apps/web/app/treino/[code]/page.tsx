import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { workoutDays } from '@/data/protocol';
import { WorkoutDayLoader } from '@/features/execution/WorkoutDayLoader';

export function generateStaticParams() {
  return workoutDays.map((d) => ({ code: d.code.toLowerCase() }));
}

export default async function WorkoutDayPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const valid = workoutDays.some((d) => d.code.toLowerCase() === code);
  if (!valid) return notFound();

  return (
    <AppShell>
      <Link
        href="/treino"
        className="inline-flex items-center gap-1 text-mute text-xs uppercase tracking-widest hover:text-ash mb-3"
      >
        <ChevronLeft className="size-4" />
        treino
      </Link>
      <WorkoutDayLoader code={code} />
    </AppShell>
  );
}
