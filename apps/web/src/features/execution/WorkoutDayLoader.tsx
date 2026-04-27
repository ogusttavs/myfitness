'use client';

import { Loader2 } from 'lucide-react';
import { useActiveWorkspace } from '@/lib/supabase/useWorkspace';
import { workoutDays as seedWorkoutDays, totalSetsInDay, estimatedDurationMinutes } from '@/data/protocol';
import type { WorkoutDay } from '@/data/protocol';
import { useActiveWorkoutPlan } from './queries';
import { WorkoutDayClient } from './WorkoutDayClient';

export function WorkoutDayLoader({ code }: { code: string }) {
  const { workspace } = useActiveWorkspace();
  const planQuery = useActiveWorkoutPlan(workspace?.id);

  const upper = code.toUpperCase();
  const fromDb = planQuery.data?.find((d) => d.code === upper);
  const fromSeed = seedWorkoutDays.find((d) => d.code === upper);
  const day: WorkoutDay | undefined = fromDb ?? fromSeed;

  if (planQuery.isLoading && !fromSeed) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="size-5 text-ember animate-spin" />
      </div>
    );
  }

  if (!day) {
    return <p className="text-mute text-sm py-10 text-center">Dia não encontrado.</p>;
  }

  return (
    <>
      <DayHeader day={day} />
      <WorkoutDayClient day={day} />
    </>
  );
}

function DayHeader({ day }: { day: WorkoutDay }) {
  return (
    <header className="mb-5">
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
  );
}
