'use client';

import { useState, useEffect } from 'react';
import { Check, Clock, Flame, Trash2 } from 'lucide-react';
import { Sheet } from '@/components/ui/Sheet';
import { Button } from '@ui/button';
import { type Meal, mealKcal, mealMacros } from '@/data/protocol';
import { useMealLog } from '@/stores/mealLog';
import { cn } from '@/lib/cn';

interface MealDetailSheetProps {
  meal: Meal | null;
  date: string;
  onClose: () => void;
}

const SAVE_DEBOUNCE_MS = 600;

export function MealDetailSheet({ meal, date, onClose }: MealDetailSheetProps) {
  const open = meal !== null;

  const entry = useMealLog((s) => (meal ? s.getEntry(meal.ord, date) : null));
  const toggleDone = useMealLog((s) => s.toggleDone);
  const setNote = useMealLog((s) => s.setNote);
  const clearEntry = useMealLog((s) => s.clear);

  const [draftNote, setDraftNote] = useState<string>('');
  const [savedFlash, setSavedFlash] = useState(false);

  // Sync nota do store quando abrir/trocar refeição
  useEffect(() => {
    if (meal) setDraftNote(entry?.note ?? '');
    // só sincroniza ao abrir (não a cada mudança do store, pra não sobrescrever digitação)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meal?.ord, date]);

  // Auto-save com debounce
  useEffect(() => {
    if (!meal) return;
    const current = entry?.note ?? '';
    if (draftNote === current) return;
    const t = setTimeout(() => {
      setNote(meal.ord, date, draftNote);
      setSavedFlash(true);
      const f = setTimeout(() => setSavedFlash(false), 1200);
      return () => clearTimeout(f);
    }, SAVE_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [draftNote, meal, date, entry?.note, setNote]);

  if (!meal) return null;

  const macros = mealMacros(meal);
  const totalKcal = mealKcal(meal);
  const done = entry?.done ?? false;

  return (
    <Sheet open={open} onClose={onClose}>
      <div className="px-5 pt-2 pb-5">
        {/* Header */}
        <div className="flex items-start gap-4 mb-1">
          <div
            className={cn(
              'size-12 rounded-full border flex items-center justify-center font-display tracking-widest text-lg shrink-0 transition-colors',
              done ? 'bg-moss/20 border-moss/40 text-moss' : 'bg-elevated border-smoke text-ember',
            )}
          >
            {meal.ord}
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <h2 className="text-bone text-2xl font-display tracking-wider leading-none">
              {meal.name.toUpperCase()}
            </h2>
            <div className="flex items-center gap-3 text-mute text-xs mt-1.5">
              {meal.time ? (
                <span className="inline-flex items-center gap-1">
                  <Clock className="size-3" />
                  {meal.time}
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1">
                <Flame className="size-3" />
                {totalKcal} kcal
              </span>
            </div>
          </div>
        </div>

        {meal.notes ? (
          <p className="text-mute text-xs italic mt-3 border-l-2 border-ember/40 pl-3">{meal.notes}</p>
        ) : null}
      </div>

      <div className="px-5 pb-5">
        {/* Itens */}
        <h3 className="text-mute text-[10px] uppercase tracking-widest mb-2.5">o que comer</h3>
        <ul className="space-y-2 mb-5">
          {meal.items.map((it, idx) => (
            <li
              key={idx}
              className="flex items-start justify-between gap-3 bg-elevated border border-smoke rounded-md p-3"
            >
              <span className="text-bone text-sm leading-snug flex-1">{it.description}</span>
              <span className="text-ember text-xs font-medium shrink-0 mt-0.5">~{it.kcal} kcal</span>
            </li>
          ))}
        </ul>

        {/* Macros breakdown */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          <Mini label="kcal" value={`${macros.kcal}`} accent />
          <Mini label="P" value={`${macros.proteinG}g`} />
          <Mini label="C" value={`${macros.carbG}g`} />
          <Mini label="G" value={`${macros.fatG}g`} />
        </div>

        {/* Observação do dia */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-mute text-[10px] uppercase tracking-widest">observação · {formatDateBr(date)}</h3>
            <span
              className={cn(
                'text-[10px] uppercase tracking-widest transition-opacity',
                savedFlash ? 'text-moss opacity-100' : 'opacity-0',
              )}
            >
              ✓ salvo
            </span>
          </div>
          <textarea
            value={draftNote}
            onChange={(e) => setDraftNote(e.target.value)}
            placeholder="ex.: troquei arroz por batata-doce, adicionei abacate..."
            rows={4}
            className={cn(
              'w-full rounded-md bg-elevated border border-smoke text-bone text-sm placeholder:text-mute',
              'p-3 resize-none focus:outline-none focus:border-ember/60 transition-colors',
            )}
          />
          <p className="text-mute text-[10px] mt-1.5">salvo automaticamente</p>
        </div>

        {/* Ações */}
        <div className="space-y-2">
          {done ? (
            <Button
              variant="secondary"
              size="md"
              className="w-full"
              onClick={() => meal && toggleDone(meal.ord, date)}
            >
              <Check className="size-4 mr-2 text-moss" /> desmarcar como feita
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => meal && toggleDone(meal.ord, date)}
            >
              <Check className="size-4 mr-2" /> marcar como feita
            </Button>
          )}

          {entry ? (
            <button
              type="button"
              onClick={() => meal && clearEntry(meal.ord, date)}
              className="w-full flex items-center justify-center gap-1.5 text-mute hover:text-blood text-xs uppercase tracking-widest py-3 transition-colors"
            >
              <Trash2 className="size-3" /> limpar registro do dia
            </button>
          ) : null}
        </div>
      </div>
    </Sheet>
  );
}

function Mini({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={cn('text-center rounded-md bg-elevated border border-smoke px-2 py-2', accent && 'border-ember/40')}>
      <p className="text-[9px] text-mute uppercase tracking-widest">{label}</p>
      <p className={cn('text-sm font-medium mt-0.5', accent ? 'text-ember' : 'text-bone')}>{value}</p>
    </div>
  );
}

function formatDateBr(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  return `${(d ?? 0).toString().padStart(2, '0')}/${(m ?? 0).toString().padStart(2, '0')}/${y}`;
}
