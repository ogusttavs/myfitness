'use client';

import { useMemo } from 'react';
import type { TimerSnapshot } from '@/lib/timer/RestTimer';
import { cn } from '@/lib/cn';
import { Button } from '@ui/button';

interface RestTimerRingProps {
  snapshot: TimerSnapshot;
  onPause: () => void;
  onResume: () => void;
  onSkip: () => void;
  onAdjust: (deltaMs: number) => void;
  nextLabel?: string;
  size?: number;
}

const STROKE = 12;

export function RestTimerRing({
  snapshot,
  onPause,
  onResume,
  onSkip,
  onAdjust,
  nextLabel,
  size = 280,
}: RestTimerRingProps) {
  const radius = (size - STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress =
    snapshot.durationMs <= 0 ? 0 : Math.max(0, Math.min(1, snapshot.remainingMs / snapshot.durationMs));
  const offset = circumference * (1 - progress);

  const seconds = Math.ceil(snapshot.remainingMs / 1000);
  const totalSeconds = Math.ceil(snapshot.durationMs / 1000);
  const lastFiveSeconds = snapshot.state === 'running' && snapshot.remainingMs <= 5_000;

  const ringColor = useMemo(() => {
    if (snapshot.state === 'finished') return '#4ADE80';
    if (lastFiveSeconds) return '#FFB084';
    return '#FF6B1A';
  }, [snapshot.state, lastFiveSeconds]);

  return (
    <div className="flex flex-col items-center">
      <span className="text-ash text-xs uppercase tracking-widest mb-3">descanso</span>

      <div
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <svg
          width={size}
          height={size}
          className="absolute inset-0 -rotate-90"
          aria-hidden
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#2A2A2E"
            strokeWidth={STROKE}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={ringColor}
            strokeWidth={STROKE}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 200ms linear, stroke 240ms ease' }}
          />
        </svg>

        <div className={cn('flex flex-col items-center', lastFiveSeconds && 'animate-pulseTimer')}>
          <span className="font-display text-bone text-timer leading-none">
            {seconds}
          </span>
          <span className="text-mute text-xs mt-1">{totalSeconds}s total</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 mt-8">
        <Button variant="secondary" size="icon" onClick={() => onAdjust(-15_000)} aria-label="−15 segundos">
          −15s
        </Button>
        {snapshot.state === 'running' ? (
          <Button variant="primary" size="iconLg" onClick={onPause} aria-label="Pausar">
            ‖
          </Button>
        ) : (
          <Button variant="primary" size="iconLg" onClick={onResume} aria-label="Continuar">
            ▶
          </Button>
        )}
        <Button variant="secondary" size="icon" onClick={() => onAdjust(15_000)} aria-label="+15 segundos">
          +15s
        </Button>
      </div>

      <button
        type="button"
        onClick={onSkip}
        className="mt-6 px-4 py-2 text-ash text-sm uppercase tracking-widest hover:text-bone transition-colors"
      >
        pular
      </button>

      {nextLabel ? (
        <p className="text-mute text-xs mt-4">próxima: {nextLabel}</p>
      ) : null}
    </div>
  );
}
