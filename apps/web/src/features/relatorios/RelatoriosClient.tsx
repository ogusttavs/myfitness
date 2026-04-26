'use client';

import { useEffect, useState } from 'react';
import { Dumbbell, Apple, Droplet, Pill, Calendar } from 'lucide-react';
import { useWorkoutSession, totalVolumeKg, sessionDurationMs, formatDuration } from '@/stores/workoutSession';
import { useMealLog } from '@/stores/mealLog';
import { useWellness } from '@/stores/wellness';
import { meals, mealKcal, supplementsForDate, WATER_TARGET_ML, profile } from '@/data/protocol';
import { cn } from '@/lib/cn';

const dayMonth = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' });
const weekdayShort = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' });

interface DayStats {
  date: Date;
  dateStr: string;
  weekday: string;
  isToday: boolean;
  workouts: number;
  volumeKg: number;
  totalDurationMs: number;
  mealsDone: number;
  kcalConsumed: number;
  waterMl: number;
  supplementsDone: number;
  supplementsTotal: number;
}

function dateStringFor(d: Date): string {
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
}

export function RelatoriosClient() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const history = useWorkoutSession((s) => s.history);
  const mealEntries = useMealLog((s) => s.entries);
  const waterMap = useWellness((s) => s.waterMlByDate);
  const supplementsTaken = useWellness((s) => s.supplementsTaken);

  // últimos 7 dias
  const days: DayStats[] = [];
  if (hydrated) {
    const todayStr = dateStringFor(new Date());
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const dateStr = dateStringFor(d);
      const sessionsOfDay = history.filter((h) => {
        const sd = new Date(h.startedAt);
        return dateStringFor(sd) === dateStr;
      });
      const todaySupplements = supplementsForDate(d);
      const supDone = todaySupplements.filter((s) => supplementsTaken[`${dateStr}::${s.id}`]).length;

      const mealsForDay = mealEntries.filter((e) => e.date === dateStr && e.done);
      const kcalConsumed = mealsForDay.reduce((sum, e) => {
        const meal = meals.find((m) => m.ord === e.mealOrd);
        return sum + (meal ? mealKcal(meal) : 0);
      }, 0);

      days.push({
        date: d,
        dateStr,
        weekday: weekdayShort.format(d).replace('.', '').toUpperCase(),
        isToday: dateStr === todayStr,
        workouts: sessionsOfDay.length,
        volumeKg: sessionsOfDay.reduce((sum, s) => sum + totalVolumeKg(s), 0),
        totalDurationMs: sessionsOfDay.reduce((sum, s) => sum + sessionDurationMs(s), 0),
        mealsDone: mealsForDay.length,
        kcalConsumed,
        waterMl: waterMap[dateStr] ?? 0,
        supplementsDone: supDone,
        supplementsTotal: todaySupplements.length,
      });
    }
  }

  const weekTotalKg = days.reduce((s, d) => s + d.volumeKg, 0);
  const weekWorkouts = days.reduce((s, d) => s + d.workouts, 0);
  const weekMeals = days.reduce((s, d) => s + d.mealsDone, 0);
  const weekTargetMeals = days.length * meals.length;
  const weekWaterL = days.reduce((s, d) => s + d.waterMl, 0) / 1000;
  const maxVolume = Math.max(1, ...days.map((d) => d.volumeKg));

  return (
    <>
      <header className="mb-5">
        <p className="text-mute text-xs uppercase tracking-widest">últimos 7 dias</p>
        <h1 className="text-bone text-4xl font-display tracking-wider mt-1">RELATÓRIOS</h1>
      </header>

      {/* Resumo da semana */}
      <section className="grid grid-cols-2 gap-3 mb-5">
        <KpiCard
          icon={<Dumbbell className="size-4 text-ember" />}
          label="Volume na semana"
          value={`${weekTotalKg.toLocaleString('pt-BR')} kg`}
          subtext={`${weekWorkouts} treinos`}
        />
        <KpiCard
          icon={<Apple className="size-4 text-ember" />}
          label="Refeições"
          value={`${weekMeals}/${weekTargetMeals}`}
          subtext={`${Math.round((weekMeals / Math.max(1, weekTargetMeals)) * 100)}% aderência`}
        />
        <KpiCard
          icon={<Droplet className="size-4 text-ember" />}
          label="Água"
          value={`${weekWaterL.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}L`}
          subtext={`alvo ${(WATER_TARGET_ML / 1000) * 7}L`}
        />
        <KpiCard
          icon={<Calendar className="size-4 text-ember" />}
          label="Sequência"
          value={`${weekWorkouts}x`}
          subtext="treinos / 5 plan."
        />
      </section>

      {/* Volume por dia (gráfico de barras simples) */}
      <section className="rounded-lg bg-cave border border-smoke p-5 mb-5">
        <h3 className="text-mute text-xs uppercase tracking-widest mb-4">volume por dia (kg)</h3>
        <div className="flex items-end justify-between gap-2 h-32">
          {days.map((d) => {
            const heightPct = d.volumeKg > 0 ? Math.max(8, (d.volumeKg / maxVolume) * 100) : 0;
            return (
              <div key={d.dateStr} className="flex-1 flex flex-col items-center gap-1">
                <div className="flex-1 w-full flex items-end">
                  <div
                    className={cn(
                      'w-full rounded-t-sm transition-all',
                      d.volumeKg > 0 ? 'bg-ember' : 'bg-elevated',
                      d.isToday && 'ring-1 ring-ember/40',
                    )}
                    style={{ height: `${heightPct}%` }}
                    title={`${d.volumeKg.toLocaleString('pt-BR')}kg`}
                  />
                </div>
                <p className={cn('text-[10px] uppercase tracking-widest', d.isToday ? 'text-ember' : 'text-mute')}>
                  {d.weekday.slice(0, 3)}
                </p>
              </div>
            );
          })}
        </div>
        <p className="text-mute text-[10px] text-center mt-3">
          {weekTotalKg > 0 ? `Pico: ${maxVolume.toLocaleString('pt-BR')}kg` : 'Nenhum treino registrado nessa janela'}
        </p>
      </section>

      {/* Lista detalhada por dia */}
      <section className="mb-5">
        <h3 className="text-mute text-xs uppercase tracking-widest mb-3">detalhe diário</h3>
        <div className="space-y-2">
          {[...days].reverse().map((d) => (
            <div
              key={d.dateStr}
              className={cn(
                'rounded-lg bg-cave border p-3',
                d.isToday ? 'border-ember/40' : 'border-smoke',
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-bone text-sm font-medium">
                  {dayMonth.format(d.date)} · <span className="text-mute">{d.weekday}</span>
                </p>
                {d.isToday ? <span className="text-ember text-[10px] uppercase tracking-widest">hoje</span> : null}
              </div>
              <div className="grid grid-cols-4 gap-2 text-xs">
                <DayMini label="treino" value={d.volumeKg > 0 ? `${d.volumeKg}kg` : '—'} />
                <DayMini label="refeições" value={`${d.mealsDone}/6`} />
                <DayMini label="água" value={`${(d.waterMl / 1000).toFixed(1)}L`} />
                <DayMini label="suples" value={`${d.supplementsDone}/${d.supplementsTotal}`} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Observações de refeições recentes */}
      {hydrated ? (() => {
        const notes = mealEntries
          .filter((e) => e.note && e.note.trim().length > 0)
          .sort((a, b) => b.updatedAt - a.updatedAt)
          .slice(0, 5);
        if (notes.length === 0) return null;
        return (
          <section className="mb-5">
            <h3 className="text-mute text-xs uppercase tracking-widest mb-3">observações recentes</h3>
            <div className="space-y-2">
              {notes.map((n) => {
                const meal = meals.find((m) => m.ord === n.mealOrd);
                if (!meal) return null;
                const [y, mo, d] = n.date.split('-');
                return (
                  <div key={n.id} className="rounded-lg bg-cave border border-smoke p-3">
                    <div className="flex items-baseline justify-between mb-1.5">
                      <p className="text-bone text-sm font-medium">{meal.name}</p>
                      <p className="text-mute text-xs">{d}/{mo}/{y}</p>
                    </div>
                    <p className="text-ash text-xs leading-relaxed">{n.note}</p>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })() : null}

      {/* Treinos recentes (histórico) */}
      {history.length > 0 ? (
        <section>
          <h3 className="text-mute text-xs uppercase tracking-widest mb-3">treinos recentes</h3>
          <div className="space-y-2">
            {history.slice(0, 10).map((h) => {
              const kg = totalVolumeKg(h);
              const dur = sessionDurationMs(h);
              const date = new Date(h.startedAt);
              return (
                <div key={h.id} className="rounded-lg bg-cave border border-smoke p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-bone font-display tracking-wider text-lg">{h.dayCode}</p>
                      <p className="text-mute text-xs">{dayMonth.format(date)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-ember font-display tracking-wider text-lg">{kg.toLocaleString('pt-BR')}kg</p>
                      <p className="text-mute text-xs">{formatDuration(dur)} · {h.setLogs.length} séries</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : (
        <p className="text-mute text-xs text-center py-8">
          Sem treinos registrados ainda. Inicie um treino na aba <strong className="text-ash">Treino</strong>.
        </p>
      )}

      <p className="text-mute text-[10px] text-center mt-8 uppercase tracking-widest">
        {profile.name} · v0.1
      </p>
    </>
  );
}

function KpiCard({ icon, label, value, subtext }: { icon: React.ReactNode; label: string; value: string; subtext?: string }) {
  return (
    <div className="rounded-lg bg-cave border border-smoke p-4">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-mute text-[10px] uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-bone font-display tracking-wider text-2xl leading-none">{value}</p>
      {subtext ? <p className="text-mute text-xs mt-1">{subtext}</p> : null}
    </div>
  );
}

function DayMini({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-elevated rounded px-2 py-1.5 border border-smoke text-center">
      <p className="text-[9px] text-mute uppercase tracking-widest">{label}</p>
      <p className="text-bone text-xs font-medium mt-0.5">{value}</p>
    </div>
  );
}
