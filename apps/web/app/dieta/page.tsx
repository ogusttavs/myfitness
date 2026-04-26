'use client';

import { useState } from 'react';
import { Clock, Check, Flame, MessageSquare, ChevronRight } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { meals, macrosTarget, mealKcal, mealMacros, type Meal } from '@/data/protocol';
import { useMealLog, todayDateString } from '@/stores/mealLog';
import { useHydrated } from '@/lib/useHydrated';
import { MealDetailSheet } from '@/features/diet/MealDetailSheet';
import { cn } from '@/lib/cn';

export default function DietaPage() {
  const hydrated = useHydrated();
  const [openMeal, setOpenMeal] = useState<Meal | null>(null);

  const todayStr = todayDateString();
  const getEntry = useMealLog((s) => s.getEntry);
  const toggleDone = useMealLog((s) => s.toggleDone);

  const doneMeals = hydrated
    ? meals.filter((m) => getEntry(m.ord, todayStr)?.done)
    : [];
  const consumedMacros = doneMeals.reduce(
    (acc, m) => {
      const mm = mealMacros(m);
      return {
        kcal: acc.kcal + mm.kcal,
        proteinG: acc.proteinG + mm.proteinG,
        carbG: acc.carbG + mm.carbG,
        fatG: acc.fatG + mm.fatG,
      };
    },
    { kcal: 0, proteinG: 0, carbG: 0, fatG: 0 },
  );

  return (
    <AppShell>
      <header className="mb-5">
        <p className="text-mute text-xs uppercase tracking-widest">{macrosTarget.kcal} kcal alvo</p>
        <h1 className="text-bone text-4xl font-display tracking-wider mt-1">DIETA</h1>
      </header>

      {/* Macros do dia */}
      <div className="rounded-lg bg-cave border border-smoke p-4 mb-5">
        <div className="flex items-baseline justify-between mb-2">
          <p className="text-bone text-2xl font-display tracking-wider">
            {consumedMacros.kcal}
            <span className="text-mute text-sm"> / {macrosTarget.kcal} kcal</span>
          </p>
          <p className="text-ember text-xs">{doneMeals.length}/{meals.length} feitas</p>
        </div>
        <div className="w-full h-1.5 bg-elevated rounded-full overflow-hidden">
          <div
            className="h-full bg-ember rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, (consumedMacros.kcal / macrosTarget.kcal) * 100)}%` }}
          />
        </div>
        <div className="grid grid-cols-3 gap-2 mt-3">
          <MacroProgress label="P" current={consumedMacros.proteinG} target={macrosTarget.proteinG} />
          <MacroProgress label="C" current={consumedMacros.carbG} target={macrosTarget.carbG} />
          <MacroProgress label="G" current={consumedMacros.fatG} target={macrosTarget.fatG} />
        </div>
      </div>

      <div className="space-y-2">
        {meals.map((meal) => {
          const entry = hydrated ? getEntry(meal.ord, todayStr) : null;
          const done = entry?.done ?? false;
          const hasNote = !!(entry?.note && entry.note.trim().length > 0);
          const totalKcal = mealKcal(meal);
          return (
            <div
              key={meal.ord}
              className={cn(
                'flex items-center gap-2 rounded-lg bg-cave border transition-all duration-300',
                done ? 'border-moss/40' : 'border-smoke hover:border-mute',
              )}
            >
              <button
                type="button"
                onClick={() => toggleDone(meal.ord, todayStr)}
                className="size-14 flex items-center justify-center shrink-0 active:scale-90 transition-transform"
                aria-label={done ? 'desmarcar' : 'marcar feita'}
              >
                <div
                  className={cn(
                    'size-9 rounded-full flex items-center justify-center transition-colors',
                    done
                      ? 'bg-moss/20 border border-moss/40 text-moss'
                      : 'bg-elevated border border-smoke text-mute',
                  )}
                >
                  <Check className="size-4" strokeWidth={3} />
                </div>
              </button>

              <button
                type="button"
                onClick={() => setOpenMeal(meal)}
                className="flex-1 flex items-center gap-3 py-3 pr-3 text-left min-w-0 active:opacity-80"
              >
                <div className="size-10 rounded-full bg-elevated border border-smoke flex items-center justify-center font-display tracking-widest text-ember text-sm shrink-0">
                  {meal.ord}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className={cn('font-medium leading-tight', done ? 'text-ash line-through' : 'text-bone')}>
                      {meal.name}
                    </p>
                    {hasNote ? <MessageSquare className="size-3 text-ember shrink-0" /> : null}
                  </div>
                  <div className="flex items-center gap-2 text-mute text-xs mt-0.5">
                    <Clock className="size-3" />
                    {meal.time ?? '—'}
                    <span className="size-1 rounded-full bg-smoke" />
                    <Flame className="size-3" />
                    {totalKcal} kcal
                  </div>
                </div>
                <ChevronRight className="size-4 text-mute" />
              </button>
            </div>
          );
        })}
      </div>

      <p className="text-mute text-xs text-center mt-8 leading-relaxed">
        Hidrate-se: ≥3L/dia · Sono: 7-8h/noite
        <br />
        <span className="text-[10px]">Calorias são estimativas médias.</span>
      </p>

      <MealDetailSheet meal={openMeal} date={todayStr} onClose={() => setOpenMeal(null)} />
    </AppShell>
  );
}

function MacroProgress({ label, current, target }: { label: string; current: number; target: number }) {
  const pct = Math.min(100, (current / target) * 100);
  return (
    <div className="bg-elevated rounded-md px-2.5 py-1.5 border border-smoke">
      <p className="text-[10px] text-mute uppercase tracking-widest">{label}</p>
      <p className="text-bone text-xs font-medium">
        {Math.round(current)}<span className="text-mute">/{target}g</span>
      </p>
      <div className="w-full h-0.5 bg-cave rounded-full overflow-hidden mt-1">
        <div className="h-full bg-ember transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
