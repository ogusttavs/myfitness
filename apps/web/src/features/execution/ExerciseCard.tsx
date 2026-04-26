'use client';

import { useState } from 'react';
import { Check, Plus, Minus, Pause, Play, SkipForward, Timer, Undo2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { Exercise } from '@/data/protocol';
import { useTimer } from '@/lib/timer/useTimer';
import { Button } from '@ui/button';
import { useWorkoutSession, setsForExercise } from '@/stores/workoutSession';

interface ExerciseCardProps {
  exercise: Exercise;
  dayCode: string;
}

export function ExerciseCard({ exercise, dayCode }: ExerciseCardProps) {
  const exerciseKey = `${dayCode}::${exercise.name}`;

  const active = useWorkoutSession((s) => s.active);
  const logSet = useWorkoutSession((s) => s.logSet);
  const removeLastSet = useWorkoutSession((s) => s.removeLastSet);

  const sessionActive = !!active && !active.finishedAt;
  const loggedSets = active ? setsForExercise(active, exerciseKey) : [];
  const completedCount = loggedSets.length;

  const targetReps = parseInt(exercise.reps, 10) || 10;
  const lastSet = loggedSets[loggedSets.length - 1];
  const [pendingWeight, setPendingWeight] = useState<number>(lastSet?.weightKg ?? 20);
  const [pendingReps, setPendingReps] = useState<number>(targetReps);

  const [showTimer, setShowTimer] = useState(false);
  const [activeSetNumber, setActiveSetNumber] = useState<number | null>(null);

  const { snapshot, start, pause, resume, skip, reset, adjust } = useTimer({
    durationMs: exercise.restSeconds * 1000,
    onFinish: playFinishBeep,
  });

  const allDone = completedCount >= exercise.sets;

  const confirmSet = () => {
    if (!sessionActive) return;
    const setNumber = completedCount + 1;
    logSet({
      exerciseKey,
      exerciseName: exercise.name,
      setNumber,
      weightKg: pendingWeight,
      reps: pendingReps,
    });
    setActiveSetNumber(setNumber);
    setShowTimer(true);
    reset();
    start();
  };

  const undoLast = () => {
    removeLastSet(exerciseKey);
    setShowTimer(false);
  };

  const closeTimer = () => {
    setShowTimer(false);
    setActiveSetNumber(null);
    reset();
  };

  return (
    <div className={cn(
      'rounded-lg bg-cave border overflow-hidden transition-colors',
      allDone && sessionActive ? 'border-moss/40' : 'border-smoke',
    )}>
      {/* Header */}
      <div className="p-4 border-b border-smoke">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-bone font-medium leading-tight">{exercise.name}</h3>
            <p className="text-mute text-xs mt-1">
              {exercise.sets} × {exercise.reps} · descanso {exercise.restSeconds}s
            </p>
          </div>
          <div className="text-right">
            <p className={cn('font-display text-xl tracking-wider', allDone ? 'text-moss' : 'text-ember')}>
              {completedCount}/{exercise.sets}
            </p>
          </div>
        </div>
      </div>

      {/* Logged sets */}
      {loggedSets.length > 0 ? (
        <div className="divide-y divide-smoke">
          {loggedSets.map((s) => (
            <div key={s.setNumber} className="px-4 py-2.5 flex items-center justify-between text-sm">
              <span className="font-display tracking-widest text-mute w-6">{s.setNumber}</span>
              <span className="text-bone flex-1">
                <span className="font-medium">{s.weightKg}</span>
                <span className="text-mute text-xs"> kg</span>
                <span className="text-mute mx-2">×</span>
                <span className="font-medium">{s.reps}</span>
                <span className="text-mute text-xs"> reps</span>
              </span>
              <Check className="size-4 text-moss" strokeWidth={3} />
            </div>
          ))}
        </div>
      ) : null}

      {/* Pending set input */}
      {sessionActive && !allDone ? (
        <div className="p-3 flex items-center gap-2 border-t border-smoke">
          <span className="font-display tracking-widest text-sm text-ember w-6">{completedCount + 1}</span>

          <Stepper value={pendingWeight} step={2.5} unit="kg" onChange={setPendingWeight} />
          <Stepper value={pendingReps} step={1} unit={`/${exercise.reps}`} onChange={setPendingReps} />

          <button
            type="button"
            onClick={confirmSet}
            className="size-10 shrink-0 rounded-full flex items-center justify-center bg-ember text-obsidian active:opacity-80"
            aria-label="confirmar série"
          >
            <Check className="size-5" strokeWidth={3} />
          </button>
        </div>
      ) : null}

      {/* No session yet */}
      {!sessionActive && completedCount === 0 ? (
        <div className="p-3 text-center">
          <p className="text-mute text-xs">Inicie o treino para registrar séries.</p>
        </div>
      ) : null}

      {/* Timer */}
      {showTimer ? (
        <div className="p-5 bg-elevated border-t border-smoke">
          <div className="flex items-center justify-between mb-4">
            <span className="text-mute text-xs uppercase tracking-widest flex items-center gap-1.5">
              <Timer className="size-3" />
              descanso
              {activeSetNumber !== null ? ` · série ${activeSetNumber}` : ''}
            </span>
            <button onClick={closeTimer} className="text-mute text-xs hover:text-ash">
              fechar
            </button>
          </div>

          <InlineTimer
            remainingMs={snapshot.remainingMs}
            durationMs={snapshot.durationMs}
            state={snapshot.state}
          />

          <div className="flex items-center justify-center gap-3 mt-5">
            <Button variant="secondary" size="sm" onClick={() => adjust(-15_000)}>−15s</Button>
            {snapshot.state === 'running' ? (
              <Button variant="primary" size="md" onClick={pause} aria-label="Pausar">
                <Pause className="size-4" />
              </Button>
            ) : snapshot.state === 'finished' ? (
              <Button variant="primary" size="md" onClick={() => { reset(); start(); }}>
                <Play className="size-4" />
              </Button>
            ) : (
              <Button variant="primary" size="md" onClick={resume} aria-label="Continuar">
                <Play className="size-4" />
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={() => adjust(15_000)}>+15s</Button>
            <Button variant="ghost" size="sm" onClick={() => { skip(); closeTimer(); }} aria-label="Pular">
              <SkipForward className="size-4" />
            </Button>
          </div>
        </div>
      ) : null}

      {/* Footer actions */}
      {completedCount > 0 ? (
        <div className="p-3 flex items-center justify-between border-t border-smoke">
          {allDone ? (
            <span className="text-moss text-xs font-medium uppercase tracking-widest">
              ✓ exercício completo
            </span>
          ) : (
            <span className="text-mute text-xs">{exercise.sets - completedCount} séries restantes</span>
          )}
          <button
            onClick={undoLast}
            className="text-mute text-xs hover:text-ash flex items-center gap-1"
            aria-label="desfazer última série"
          >
            <Undo2 className="size-3" /> desfazer
          </button>
        </div>
      ) : null}
    </div>
  );
}

// ── Stepper ──────────────────────────────────────────────

function Stepper({
  value,
  step,
  unit,
  onChange,
}: {
  value: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex-1 flex items-center justify-between bg-elevated border border-smoke rounded-md h-11 transition-colors hover:border-mute">
      <button
        type="button"
        onClick={() => onChange(Math.max(0, value - step))}
        className="size-11 flex items-center justify-center text-ash active:text-ember active:scale-90 transition-transform"
        aria-label="diminuir"
      >
        <Minus className="size-5" strokeWidth={2.5} />
      </button>
      <div className="text-center min-w-0 flex-1 px-1">
        <p className="text-bone font-display text-base leading-none">{value}</p>
        <p className="text-mute text-[9px] uppercase tracking-widest leading-none mt-0.5">{unit}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(value + step)}
        className="size-11 flex items-center justify-center text-ash active:text-ember active:scale-90 transition-transform"
        aria-label="aumentar"
      >
        <Plus className="size-5" strokeWidth={2.5} />
      </button>
    </div>
  );
}

function InlineTimer({ remainingMs, durationMs, state }: { remainingMs: number; durationMs: number; state: string }) {
  const seconds = Math.ceil(remainingMs / 1000);
  const progress = durationMs > 0 ? Math.max(0, Math.min(1, remainingMs / durationMs)) : 0;
  const lastFive = state === 'running' && remainingMs <= 5_000;
  const finished = state === 'finished';

  return (
    <div className="flex flex-col items-center">
      <p
        className={cn(
          'font-display tracking-wider leading-none transition-all duration-300',
          finished
            ? 'text-moss text-6xl drop-shadow-[0_0_24px_rgba(74,222,128,0.6)] animate-pulse'
            : lastFive
              ? 'text-ember-glow text-7xl animate-pulseTimer drop-shadow-[0_0_16px_rgba(255,107,26,0.5)]'
              : 'text-bone text-7xl',
        )}
      >
        {finished ? 'GO!' : seconds}
      </p>
      <div className="w-full h-1 bg-smoke rounded-full overflow-hidden mt-3">
        <div
          className={cn('h-full', finished ? 'bg-moss' : 'bg-ember')}
          style={{ width: `${progress * 100}%`, transition: 'width 200ms linear, background 240ms' }}
        />
      </div>
    </div>
  );
}

function playFinishBeep() {
  if (typeof window === 'undefined') return;
  // vibração (Android funciona; iOS Safari ignora silenciosamente)
  navigator.vibrate?.([200, 100, 200, 100, 400]);
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    [880, 880, 1320].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq;
      osc.type = 'sine';
      const start = ctx.currentTime + i * 0.18;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.4, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.16);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.18);
    });
  } catch { /* sem áudio */ }
}
