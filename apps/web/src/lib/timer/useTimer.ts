import { useEffect, useRef, useState } from 'react';
import { RestTimer, type TimerSnapshot } from './RestTimer';

export interface UseTimerOptions {
  durationMs: number;
  /** Disparado uma vez quando o timer chega a zero. */
  onFinish?: () => void;
  tickIntervalMs?: number;
}

/**
 * Hook React em volta de RestTimer. Mantém referência estável e expõe snapshot reativo.
 */
export function useTimer(opts: UseTimerOptions) {
  const timerRef = useRef<RestTimer | null>(null);
  if (timerRef.current === null) {
    timerRef.current = new RestTimer({
      durationMs: opts.durationMs,
      ...(opts.tickIntervalMs !== undefined ? { tickIntervalMs: opts.tickIntervalMs } : {}),
    });
  }
  const timer = timerRef.current;

  const [snapshot, setSnapshot] = useState<TimerSnapshot>(() => timer.snapshot());
  const finishedNotifiedRef = useRef(false);

  useEffect(() => {
    const unsub = timer.subscribe((s) => {
      setSnapshot(s);
      if (s.state === 'finished' && !finishedNotifiedRef.current) {
        finishedNotifiedRef.current = true;
        opts.onFinish?.();
      }
      if (s.state !== 'finished') {
        finishedNotifiedRef.current = false;
      }
    });
    return () => {
      unsub();
      timer.destroy();
      timerRef.current = null;
    };
    // intentionally empty deps — timer mantém referência estável durante o ciclo de vida do hook
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    snapshot,
    start: () => timer.start(),
    pause: () => timer.pause(),
    resume: () => timer.resume(),
    skip: () => timer.skip(),
    reset: () => timer.reset(),
    adjust: (deltaMs: number) => timer.adjust(deltaMs),
    restore: (s: TimerSnapshot) => timer.restore(s),
  };
}
