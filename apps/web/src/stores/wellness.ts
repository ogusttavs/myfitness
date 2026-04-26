'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { todayDateString } from './mealLog';

interface WellnessState {
  // água: ml por dia
  waterMlByDate: Record<string, number>;
  // suplementos tomados: chave `${date}::${supplementId}`
  supplementsTaken: Record<string, true>;

  addWater: (ml: number, date?: string) => void;
  resetWater: (date?: string) => void;
  waterFor: (date?: string) => number;

  toggleSupplement: (supplementId: string, date?: string) => void;
  isSupplementTaken: (supplementId: string, date?: string) => boolean;
}

export const useWellness = create<WellnessState>()(
  persist(
    (set, get) => ({
      waterMlByDate: {},
      supplementsTaken: {},

      addWater: (ml, date = todayDateString()) => {
        const current = get().waterMlByDate[date] ?? 0;
        set({ waterMlByDate: { ...get().waterMlByDate, [date]: Math.max(0, current + ml) } });
      },

      resetWater: (date = todayDateString()) => {
        const map = { ...get().waterMlByDate };
        delete map[date];
        set({ waterMlByDate: map });
      },

      waterFor: (date = todayDateString()) => get().waterMlByDate[date] ?? 0,

      toggleSupplement: (supplementId, date = todayDateString()) => {
        const key = `${date}::${supplementId}`;
        const next = { ...get().supplementsTaken };
        if (next[key]) delete next[key];
        else next[key] = true;
        set({ supplementsTaken: next });
      },

      isSupplementTaken: (supplementId, date = todayDateString()) => {
        const key = `${date}::${supplementId}`;
        return !!get().supplementsTaken[key];
      },
    }),
    {
      name: 'modo-caverna-wellness',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
