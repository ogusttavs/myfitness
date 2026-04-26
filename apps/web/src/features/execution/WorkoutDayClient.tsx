'use client';

import { useState } from 'react';
import { Bike } from 'lucide-react';
import type { WorkoutDay } from '@/data/protocol';
import { ExerciseCard } from './ExerciseCard';
import { SessionBar } from './SessionBar';
import { SessionSummary } from './SessionSummary';

export function WorkoutDayClient({ day }: { day: WorkoutDay }) {
  const [summary, setSummary] = useState<{
    open: boolean;
    totalKg: number;
    durationMs: number;
    sets: number;
  }>({ open: false, totalKg: 0, durationMs: 0, sets: 0 });

  return (
    <>
      <SessionBar
        dayCode={day.code}
        onFinish={(totalKg, durationMs, sets) =>
          setSummary({ open: true, totalKg, durationMs, sets })
        }
      />

      <div className="space-y-3">
        {day.exercises.map((ex, idx) => (
          <ExerciseCard key={idx} exercise={ex} dayCode={day.code} />
        ))}

        <div className="rounded-lg bg-cave border border-smoke p-5">
          <div className="flex items-center gap-2 mb-1">
            <Bike className="size-4 text-ember" />
            <span className="text-mute text-xs uppercase tracking-widest">cardio</span>
          </div>
          <p className="text-bone font-medium">{day.cardioMinutes} min</p>
          <p className="text-ash text-sm mt-1">{day.cardioOptions}</p>
        </div>
      </div>

      <SessionSummary
        open={summary.open}
        dayCode={day.code}
        totalKg={summary.totalKg}
        durationMs={summary.durationMs}
        setsCount={summary.sets}
        onClose={() => setSummary((s) => ({ ...s, open: false }))}
      />
    </>
  );
}
