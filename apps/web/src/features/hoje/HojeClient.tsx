'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, Flame, Droplet, Pill, Plus, Minus, Check, Clock, MessageSquare, ChevronRight } from 'lucide-react';
import {
  profile,
  meals,
  macrosTarget,
  mealKcal,
  getTodayWorkout,
  getNextMeal,
  totalSetsInDay,
  estimatedDurationMinutes,
  supplementsForDate,
  WATER_TARGET_ML,
  WATER_CUP_ML,
  type Meal,
} from '@/data/protocol';
import { useMealLog, todayDateString } from '@/stores/mealLog';
import { useWellness } from '@/stores/wellness';
import { MealDetailSheet } from '@/features/diet/MealDetailSheet';
import { cn } from '@/lib/cn';

const dayLabel = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'short',
  day: '2-digit',
  month: 'short',
});

export function HojeClient() {
  // hidratação para evitar mismatch SSR/client com stores persistidos
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const [openMeal, setOpenMeal] = useState<Meal | null>(null);

  const today = new Date();
  const todayStr = todayDateString();
  const workout = getTodayWorkout(today);
  const nextMeal = getNextMeal(today);
  const todaySupplements = supplementsForDate(today);

  const isMealDone = useMealLog((s) => s.isDone);
  const getEntry = useMealLog((s) => s.getEntry);
  const toggleMeal = useMealLog((s) => s.toggleDone);
  const waterMl = useWellness((s) => s.waterMlByDate[todayStr] ?? 0);
  const addWater = useWellness((s) => s.addWater);
  const resetWater = useWellness((s) => s.resetWater);
  const toggleSupplement = useWellness((s) => s.toggleSupplement);
  const isSupplementTaken = useWellness((s) => s.isSupplementTaken);

  const doneMealsCount = hydrated ? meals.filter((m) => isMealDone(m.ord, todayStr)).length : 0;
  const consumedKcal = hydrated
    ? meals.filter((m) => isMealDone(m.ord, todayStr)).reduce((sum, m) => sum + mealKcal(m), 0)
    : 0;

  const waterPct = Math.min(100, (waterMl / WATER_TARGET_ML) * 100);
  const cupsCompleted = Math.floor(waterMl / WATER_CUP_ML);
  const totalCups = Math.ceil(WATER_TARGET_ML / WATER_CUP_ML);

  return (
    <>
      <header className="mb-6">
        <p className="text-mute text-xs uppercase tracking-widest">{dayLabel.format(today).replace(/\.+/g, '')}</p>
        <h1 className="text-bone text-4xl font-display tracking-wider mt-1">HOJE</h1>
      </header>

      {/* Treino do dia */}
      {workout ? (
        <Link
          href={`/treino/${workout.code.toLowerCase()}` as never}
          className="block rounded-lg bg-cave border border-smoke p-5 mb-5 active:opacity-80"
        >
          <div className="flex items-center gap-2 mb-2">
            <Flame className="size-4 text-ember" />
            <span className="text-mute text-xs uppercase tracking-widest">treino de hoje</span>
          </div>
          <h2 className="text-bone text-3xl font-display tracking-wider">{workout.code}</h2>
          <p className="text-ash text-sm mt-1">{workout.focus}</p>
          <div className="flex items-center gap-3 mt-4 text-xs text-mute">
            <span>{workout.exercises.length} exerc.</span>
            <span className="size-1 rounded-full bg-smoke" />
            <span>{totalSetsInDay(workout)} séries</span>
            <span className="size-1 rounded-full bg-smoke" />
            <span>~{estimatedDurationMinutes(workout)}min</span>
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-smoke">
            <span className="text-ember font-display tracking-widest text-sm">INICIAR</span>
            <ArrowRight className="size-4 text-ember" />
          </div>
        </Link>
      ) : (
        <div className="rounded-lg bg-cave border border-smoke p-5 mb-5">
          <p className="text-ash text-sm">Hoje é dia de descanso. Hidrate-se e durma 7-8h.</p>
        </div>
      )}

      {/* Próxima refeição */}
      {nextMeal ? (
        <div className="rounded-lg bg-ember/10 border border-ember/40 p-4 mb-5">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="size-3 text-ember" />
            <span className="text-mute text-[10px] uppercase tracking-widest">próxima refeição</span>
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-bone font-medium">{nextMeal.name}</p>
            <p className="text-ember font-display text-xl tracking-wider">{nextMeal.time}</p>
          </div>
          <p className="text-ash text-xs mt-1">{mealKcal(nextMeal)} kcal · {nextMeal.items.length} itens</p>
        </div>
      ) : null}

      {/* Refeições do dia */}
      <section className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-mute text-xs uppercase tracking-widest">
            refeições · {doneMealsCount}/{meals.length}
          </h3>
          <Link href="/dieta" className="text-mute text-xs hover:text-ash">ver tudo →</Link>
        </div>

        <div className="space-y-2">
          {meals.map((meal) => {
            const entry = hydrated ? getEntry(meal.ord, todayStr) : null;
            const done = entry?.done ?? false;
            const hasNote = !!(entry?.note && entry.note.trim().length > 0);
            const kcal = mealKcal(meal);
            return (
              <div
                key={meal.ord}
                className={cn(
                  'flex items-center gap-2 rounded-lg bg-cave border transition-all duration-300',
                  done ? 'border-moss/40' : 'border-smoke hover:border-mute',
                )}
              >
                {/* checkbox quick-toggle */}
                <button
                  type="button"
                  onClick={() => toggleMeal(meal.ord, todayStr)}
                  className={cn(
                    'size-12 rounded-l-lg flex items-center justify-center shrink-0 transition-colors active:scale-95',
                    done ? 'text-moss' : 'text-mute hover:text-ash',
                  )}
                  aria-label={done ? 'desmarcar feita' : 'marcar feita'}
                >
                  <div
                    className={cn(
                      'size-7 rounded-full flex items-center justify-center transition-colors',
                      done ? 'bg-moss/20 border border-moss/40' : 'bg-elevated border border-smoke',
                    )}
                  >
                    <Check className="size-3.5" strokeWidth={3} />
                  </div>
                </button>

                {/* clica no resto = abre sheet */}
                <button
                  type="button"
                  onClick={() => setOpenMeal(meal)}
                  className="flex-1 flex items-center gap-2 py-3 pr-3 text-left min-w-0 active:opacity-80"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className={cn('text-sm font-medium leading-tight', done ? 'text-ash line-through' : 'text-bone')}>
                        {meal.name}
                      </p>
                      {hasNote ? <MessageSquare className="size-3 text-ember shrink-0" /> : null}
                    </div>
                    <p className="text-mute text-xs mt-0.5">
                      {meal.time ?? '—'} · {kcal} kcal
                    </p>
                  </div>
                  <ChevronRight className="size-4 text-mute" />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Água */}
      <section className="rounded-lg bg-cave border border-smoke p-5 mb-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Droplet className="size-4 text-ember" />
            <span className="text-mute text-xs uppercase tracking-widest">hidratação</span>
          </div>
          <button onClick={() => resetWater(todayStr)} className="text-mute text-[10px] uppercase tracking-widest hover:text-ash">
            zerar
          </button>
        </div>

        <div className="flex items-baseline justify-between">
          <p className="text-bone text-2xl font-display tracking-wider">
            {(waterMl / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}L
          </p>
          <p className="text-mute text-xs">/ 3L · {cupsCompleted}/{totalCups} copos</p>
        </div>

        <div className="w-full h-2 bg-elevated rounded-full overflow-hidden mt-2">
          <div
            className="h-full bg-ember rounded-full transition-all"
            style={{ width: `${waterPct}%` }}
          />
        </div>

        <div className="flex items-center justify-center gap-3 mt-4">
          <button
            onClick={() => addWater(-WATER_CUP_ML, todayStr)}
            className="size-10 rounded-full border border-smoke bg-elevated flex items-center justify-center text-ash active:text-bone"
            aria-label="remover copo"
          >
            <Minus className="size-4" />
          </button>
          <button
            onClick={() => addWater(WATER_CUP_ML, todayStr)}
            className="px-6 h-12 rounded-full bg-ember text-obsidian font-display tracking-widest text-sm active:opacity-80"
          >
            + COPO ({WATER_CUP_ML}ml)
          </button>
          <button
            onClick={() => addWater(500, todayStr)}
            className="size-10 rounded-full border border-smoke bg-elevated flex items-center justify-center text-ash active:text-bone"
            aria-label="garrafa 500ml"
          >
            <Plus className="size-4" />
          </button>
        </div>
        <p className="text-mute text-[10px] text-center mt-2">+/− copo · botão direito = +500ml</p>
      </section>

      {/* Suplementos */}
      {todaySupplements.length > 0 ? (
        <section className="rounded-lg bg-cave border border-smoke p-5 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <Pill className="size-4 text-ember" />
            <span className="text-mute text-xs uppercase tracking-widest">suplementação</span>
          </div>

          <ul className="space-y-2">
            {todaySupplements.map((s) => {
              const taken = hydrated && isSupplementTaken(s.id, todayStr);
              const periodLabel = s.schedule.kind === 'daily'
                ? periodEs(s.schedule.period)
                : 'hoje';
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => toggleSupplement(s.id, todayStr)}
                    className={cn(
                      'w-full flex items-center gap-3 rounded-md p-3 border text-left active:scale-[0.99] transition-all duration-300',
                      taken ? 'bg-moss/10 border-moss/40' : 'bg-elevated border-smoke hover:border-mute',
                    )}
                  >
                    <div
                      className={cn(
                        'size-7 rounded-full flex items-center justify-center shrink-0',
                        taken ? 'bg-moss/20 text-moss' : 'bg-cave text-mute border border-smoke',
                      )}
                    >
                      <Check className="size-3.5" strokeWidth={3} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-sm font-medium leading-tight', taken ? 'text-ash line-through' : 'text-bone')}>
                        {s.name}
                      </p>
                      <p className="text-mute text-xs mt-0.5">
                        {s.dose} · {periodLabel}
                        {s.notes ? ` · ${s.notes}` : ''}
                      </p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {/* Macros consumidas vs alvo */}
      <section className="rounded-lg bg-cave border border-smoke p-5 mb-5">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-mute text-xs uppercase tracking-widest">macros do dia</span>
          <span className="text-mute text-xs">{macrosTarget.kcal} kcal alvo</span>
        </div>
        <p className="text-bone text-3xl font-display tracking-wider">
          {consumedKcal} <span className="text-mute text-base">kcal consumidas</span>
        </p>
        <div className="w-full h-1.5 bg-elevated rounded-full overflow-hidden mt-3">
          <div
            className="h-full bg-ember rounded-full"
            style={{ width: `${Math.min(100, (consumedKcal / macrosTarget.kcal) * 100)}%` }}
          />
        </div>
      </section>

      <p className="text-mute text-xs text-center mt-6">
        Olá, {profile.name}. {profile.weightKg}kg · {profile.heightM}m · {profile.level}
      </p>

      <MealDetailSheet meal={openMeal} date={todayStr} onClose={() => setOpenMeal(null)} />
    </>
  );
}

function periodEs(p: 'morning' | 'afternoon' | 'evening' | 'night' | 'any'): string {
  switch (p) {
    case 'morning': return 'manhã';
    case 'afternoon': return 'tarde';
    case 'evening': return 'fim do dia';
    case 'night': return 'antes de dormir';
    default: return 'qualquer hora';
  }
}
