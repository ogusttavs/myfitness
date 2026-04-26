'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface SetLog {
  /** Identificador estável do exercício (nome do exercício + dia). */
  exerciseKey: string;
  exerciseName: string;
  setNumber: number;
  weightKg: number;
  reps: number;
  loggedAt: number; // epoch ms
  /** UUID gerado no cliente — idempotência para sync com Supabase. */
  clientId?: string;
}

export interface WorkoutSession {
  id: string;
  dayCode: string;
  startedAt: number;
  finishedAt: number | null;
  setLogs: SetLog[];
  /** ID da sessão correspondente no Supabase, quando sincronizada. */
  remoteSessionId?: string | null;
}

interface WorkoutSessionState {
  active: WorkoutSession | null;
  history: WorkoutSession[];

  startSession: (dayCode: string) => void;
  setRemoteId: (remoteId: string) => void;
  finishSession: () => WorkoutSession | null;
  cancelSession: () => void;
  logSet: (entry: Omit<SetLog, 'loggedAt'>) => SetLog;
  /** Remove a última série logada de um exercício específico (em caso de desfazer). */
  removeLastSet: (exerciseKey: string) => void;
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const useWorkoutSession = create<WorkoutSessionState>()(
  persist(
    (set, get) => ({
      active: null,
      history: [],

      startSession: (dayCode) => {
        const existing = get().active;
        if (existing && !existing.finishedAt) return; // já tem sessão ativa
        set({
          active: {
            id: generateId(),
            dayCode,
            startedAt: Date.now(),
            finishedAt: null,
            setLogs: [],
          },
        });
      },

      finishSession: () => {
        const active = get().active;
        if (!active) return null;
        const finished: WorkoutSession = { ...active, finishedAt: Date.now() };
        set({ active: null, history: [finished, ...get().history] });
        return finished;
      },

      cancelSession: () => set({ active: null }),

      setRemoteId: (remoteId) => {
        const active = get().active;
        if (!active) return;
        set({ active: { ...active, remoteSessionId: remoteId } });
      },

      logSet: (entry) => {
        const active = get().active;
        if (!active) {
          // tipo precisa retornar SetLog — fallback dummy se não tiver sessão (não acontece)
          return { ...entry, loggedAt: Date.now() };
        }
        const clientId =
          typeof crypto !== 'undefined' && 'randomUUID' in crypto
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
        const log: SetLog = { ...entry, loggedAt: Date.now(), clientId };
        set({
          active: { ...active, setLogs: [...active.setLogs, log] },
        });
        return log;
      },

      removeLastSet: (exerciseKey) => {
        const active = get().active;
        if (!active) return;
        const idx = [...active.setLogs].reverse().findIndex((s) => s.exerciseKey === exerciseKey);
        if (idx < 0) return;
        const realIdx = active.setLogs.length - 1 - idx;
        set({
          active: {
            ...active,
            setLogs: active.setLogs.filter((_, i) => i !== realIdx),
          },
        });
      },
    }),
    {
      name: 'modo-caverna-workout-session',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

// ── Helpers ───────────────────────────────────────────

export function totalVolumeKg(session: Pick<WorkoutSession, 'setLogs'>): number {
  return session.setLogs.reduce((sum, s) => sum + s.weightKg * s.reps, 0);
}

export function setsForExercise(
  session: Pick<WorkoutSession, 'setLogs'>,
  exerciseKey: string,
): SetLog[] {
  return session.setLogs.filter((s) => s.exerciseKey === exerciseKey);
}

export function sessionDurationMs(session: WorkoutSession): number {
  return (session.finishedAt ?? Date.now()) - session.startedAt;
}

export function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}
