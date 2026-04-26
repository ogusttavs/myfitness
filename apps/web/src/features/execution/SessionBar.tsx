'use client';

import { useEffect, useState } from 'react';
import { Play, Square, Timer as TimerIcon } from 'lucide-react';
import {
  useWorkoutSession,
  totalVolumeKg,
  sessionDurationMs,
  formatDuration,
} from '@/stores/workoutSession';
import { Button } from '@ui/button';

interface SessionBarProps {
  dayCode: string;
  /** Disparado quando sessão é finalizada — mostra summary modal */
  onFinish: (totalKg: number, durationMs: number, sets: number) => void;
}

export function SessionBar({ dayCode, onFinish }: SessionBarProps) {
  const active = useWorkoutSession((s) => s.active);
  const startSession = useWorkoutSession((s) => s.startSession);
  const finishSession = useWorkoutSession((s) => s.finishSession);
  const cancelSession = useWorkoutSession((s) => s.cancelSession);

  const isActiveHere = active?.dayCode === dayCode && !active.finishedAt;
  const isOtherActive = active && active.dayCode !== dayCode && !active.finishedAt;

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!isActiveHere) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [isActiveHere]);

  if (isActiveHere && active) {
    const elapsed = formatDuration(sessionDurationMs({ ...active, finishedAt: now }));
    const kg = totalVolumeKg(active);
    return (
      <div className="rounded-lg bg-ember/10 border border-ember/40 p-4 mb-4 sticky top-2 z-30 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-10 rounded-full bg-ember/20 flex items-center justify-center shrink-0">
              <TimerIcon className="size-4 text-ember" />
            </div>
            <div className="min-w-0">
              <p className="text-mute text-[10px] uppercase tracking-widest">treino em andamento</p>
              <p className="text-bone font-display text-2xl tracking-wider leading-none mt-0.5">{elapsed}</p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-mute text-[10px] uppercase tracking-widest">volume</p>
            <p className="text-ember font-display text-2xl tracking-wider leading-none mt-0.5">
              {kg.toLocaleString('pt-BR')} kg
            </p>
          </div>
        </div>

        <div className="flex gap-2 mt-3">
          <Button
            variant="primary"
            size="sm"
            className="flex-1"
            onClick={() => {
              const finished = finishSession();
              if (finished) {
                onFinish(totalVolumeKg(finished), sessionDurationMs(finished), finished.setLogs.length);
              }
            }}
          >
            <Square className="size-3 mr-2" /> finalizar
          </Button>
          <Button variant="ghost" size="sm" onClick={cancelSession}>
            cancelar
          </Button>
        </div>
      </div>
    );
  }

  if (isOtherActive) {
    return (
      <div className="rounded-lg bg-amberx/10 border border-amberx/40 p-4 mb-4">
        <p className="text-amberx text-xs uppercase tracking-widest">
          treino {active.dayCode} em andamento
        </p>
        <p className="text-bone text-sm mt-1">Finalize o treino atual antes de iniciar outro.</p>
      </div>
    );
  }

  return (
    <Button
      variant="primary"
      size="lg"
      className="w-full mb-4"
      onClick={() => startSession(dayCode)}
    >
      <Play className="size-4 mr-2" /> iniciar treino
    </Button>
  );
}
