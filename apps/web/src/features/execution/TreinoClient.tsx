'use client';

import Link from 'next/link';
import { ArrowRight, Check, Loader2 } from 'lucide-react';
import { workoutDays as seedWorkoutDays, totalSetsInDay, estimatedDurationMinutes, getTodayWorkout } from '@/data/protocol';
import { useWorkoutSession } from '@/stores/workoutSession';
import { useHydrated } from '@/lib/useHydrated';
import { useActiveWorkspace } from '@/lib/supabase/useWorkspace';
import { useActiveWorkoutPlan } from './queries';
import { cn } from '@/lib/cn';

export function TreinoClient() {
  const hydrated = useHydrated();
  const today = getTodayWorkout();
  const history = useWorkoutSession((s) => s.history);
  const { workspace } = useActiveWorkspace();
  const planQuery = useActiveWorkoutPlan(workspace?.id);

  // dia foi feito esta semana?
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const doneThisWeek = new Set(
    hydrated
      ? history.filter((h) => h.startedAt >= sevenDaysAgo && h.finishedAt).map((h) => h.dayCode)
      : [],
  );

  // Fonte: banco se tem plano ativo, fallback no seed enquanto carrega ou se workspace vazio
  const days = planQuery.data && planQuery.data.length > 0 ? planQuery.data : seedWorkoutDays;
  const loading = !!workspace?.id && planQuery.isLoading;

  return (
    <>
      <header className="mb-6">
        <p className="text-mute text-xs uppercase tracking-widest">5x por semana</p>
        <h1 className="text-bone text-4xl font-display tracking-wider mt-1">TREINO</h1>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="size-5 text-ember animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {days.map((day) => {
            const isToday = today?.code === day.code;
            const wasDoneThisWeek = doneThisWeek.has(day.code);
            return (
              <Link
                key={day.code}
                href={`/treino/${day.code.toLowerCase()}` as never}
                className={cn(
                  'block rounded-lg bg-cave border p-5 transition-all duration-200 active:opacity-80 active:scale-[0.99]',
                  isToday ? 'border-ember/40' : wasDoneThisWeek ? 'border-moss/30 bg-moss/[0.03]' : 'border-smoke',
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-mute text-[10px] uppercase tracking-widest">
                        Dia {day.index + 1}
                      </span>
                      {isToday ? (
                        <span className="text-[10px] uppercase tracking-widest text-ember bg-ember/10 px-2 py-0.5 rounded-full">
                          hoje
                        </span>
                      ) : null}
                      {wasDoneThisWeek && !isToday ? (
                        <span className="text-[10px] uppercase tracking-widest text-moss bg-moss/10 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <Check className="size-2.5" strokeWidth={3} /> feito
                        </span>
                      ) : null}
                    </div>
                    <h2 className="text-bone text-2xl font-display tracking-wider">{day.code}</h2>
                    <p className="text-ash text-sm mt-1">{day.focus}</p>
                  </div>
                  <ArrowRight className="size-4 text-mute mt-2" />
                </div>

                <div className="flex items-center gap-3 mt-4 pt-3 border-t border-smoke text-xs text-mute">
                  <span>{day.exercises.length} exerc.</span>
                  <span className="size-1 rounded-full bg-smoke" />
                  <span>{totalSetsInDay(day)} séries</span>
                  <span className="size-1 rounded-full bg-smoke" />
                  <span>+{day.cardioMinutes}min cardio</span>
                  <span className="size-1 rounded-full bg-smoke" />
                  <span>~{estimatedDurationMinutes(day)}min</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
