'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface MealLogEntry {
  id: string;
  mealOrd: number;
  /** YYYY-MM-DD */
  date: string;
  done: boolean;
  consumedAt: number | null;
  note: string;
  updatedAt: number;
}

interface MealLogState {
  entries: MealLogEntry[];

  /** Liga ou desliga o "feito". Cria entry se não existir. */
  toggleDone: (mealOrd: number, date: string) => void;
  /** Salva nota — cria entry se não existir, sem mexer no done. */
  setNote: (mealOrd: number, date: string, note: string) => void;
  /** Limpa entry (volta ao zero — sem nota e sem done). */
  clear: (mealOrd: number, date: string) => void;

  isDone: (mealOrd: number, date: string) => boolean;
  getEntry: (mealOrd: number, date: string) => MealLogEntry | null;
  forDate: (date: string) => MealLogEntry[];
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

function findEntry(entries: MealLogEntry[], mealOrd: number, date: string) {
  return entries.find((e) => e.mealOrd === mealOrd && e.date === date) ?? null;
}

export const useMealLog = create<MealLogState>()(
  persist(
    (set, get) => ({
      entries: [],

      toggleDone: (mealOrd, date) => {
        const existing = findEntry(get().entries, mealOrd, date);
        const now = Date.now();
        if (existing) {
          set({
            entries: get().entries.map((e) =>
              e.id === existing.id
                ? {
                    ...e,
                    done: !e.done,
                    consumedAt: !e.done ? now : null,
                    updatedAt: now,
                  }
                : e,
            ),
          });
        } else {
          set({
            entries: [
              ...get().entries,
              {
                id: generateId(),
                mealOrd,
                date,
                done: true,
                consumedAt: now,
                note: '',
                updatedAt: now,
              },
            ],
          });
        }
      },

      setNote: (mealOrd, date, note) => {
        const existing = findEntry(get().entries, mealOrd, date);
        const now = Date.now();
        if (existing) {
          set({
            entries: get().entries.map((e) =>
              e.id === existing.id ? { ...e, note, updatedAt: now } : e,
            ),
          });
        } else {
          set({
            entries: [
              ...get().entries,
              {
                id: generateId(),
                mealOrd,
                date,
                done: false,
                consumedAt: null,
                note,
                updatedAt: now,
              },
            ],
          });
        }
      },

      clear: (mealOrd, date) => {
        const existing = findEntry(get().entries, mealOrd, date);
        if (!existing) return;
        set({ entries: get().entries.filter((e) => e.id !== existing.id) });
      },

      isDone: (mealOrd, date) => findEntry(get().entries, mealOrd, date)?.done ?? false,

      getEntry: (mealOrd, date) => findEntry(get().entries, mealOrd, date),

      forDate: (date) => get().entries.filter((e) => e.date === date),
    }),
    {
      name: 'modo-caverna-meal-log',
      version: 2,
      storage: createJSONStorage(() => localStorage),
      // migra do schema v1 (sem done/note) — descarta entradas antigas, eram só toggles
      migrate: (persisted: unknown, version) => {
        if (version < 2) return { entries: [] };
        return persisted as MealLogState;
      },
    },
  ),
);

export function todayDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
}
