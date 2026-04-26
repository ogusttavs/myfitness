'use client';

import { useEffect, useState } from 'react';
import { Bike } from 'lucide-react';
import type { WorkoutDay } from '@/data/protocol';
import { ExerciseCard } from './ExerciseCard';
import { SessionBar } from './SessionBar';
import { SessionSummary } from './SessionSummary';
import { useActiveWorkspace } from '@/lib/supabase/useWorkspace';
import { useWorkoutSession } from '@/stores/workoutSession';
import { syncStartSession, syncFinishSession } from './syncSession';

export function WorkoutDayClient({ day }: { day: WorkoutDay }) {
  const { workspace } = useActiveWorkspace();
  const active = useWorkoutSession((s) => s.active);
  const setRemoteId = useWorkoutSession((s) => s.setRemoteId);

  const [summary, setSummary] = useState<{
    open: boolean;
    totalKg: number;
    durationMs: number;
    sets: number;
  }>({ open: false, totalKg: 0, durationMs: 0, sets: 0 });

  // Sync: ao iniciar sessão local, cria sessão correspondente no Supabase
  useEffect(() => {
    if (!workspace?.id || !active) return;
    if (active.dayCode !== day.code) return;
    if (active.remoteSessionId) return; // já sincronizado
    if (active.finishedAt) return;
    let cancelled = false;
    syncStartSession(workspace.id, day).then((remoteId) => {
      if (!cancelled && remoteId) setRemoteId(remoteId);
    });
    return () => { cancelled = true; };
  }, [workspace?.id, active?.id, active?.remoteSessionId, active?.dayCode, active?.finishedAt, day, setRemoteId]);

  return (
    <>
      <SessionBar
        dayCode={day.code}
        onFinish={(totalKg, durationMs, sets) => {
          setSummary({ open: true, totalKg, durationMs, sets });
          // Background: marca sessão como finalizada no Supabase
          const recent = useWorkoutSession.getState().history[0];
          if (recent?.remoteSessionId) {
            void syncFinishSession(recent.remoteSessionId, recent);
          }
        }}
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
