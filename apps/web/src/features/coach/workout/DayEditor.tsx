'use client';

import { useState } from 'react';
import { Plus, Trash2, Loader2, Repeat, Check } from 'lucide-react';
import { Button } from '@ui/button';
import { Sheet } from '@/components/ui/Sheet';
import { cn } from '@/lib/cn';
import { useCoachWorkoutPlan, useExercisesCatalog, type CoachDay, type CoachExerciseRow, type ExerciseCatalogItem } from './queries';
import { useUpdateExerciseRow, useAddExercise, useDeleteExercise, useUpdateDay } from './mutations';

type Props = {
  workspaceId: string;
  dayCode: string;
};

export function DayEditor({ workspaceId, dayCode }: Props) {
  const planQuery = useCoachWorkoutPlan(workspaceId);

  if (planQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-5 text-ember animate-spin" />
      </div>
    );
  }

  if (!planQuery.data || planQuery.data.length === 0) {
    return (
      <div className="rounded-lg bg-cave border border-smoke p-5 text-center">
        <p className="text-bone text-sm font-medium">Atleta sem plano ativo.</p>
        <p className="text-mute text-xs mt-1">Aplique o protocolo Modo Caverna no painel pra começar.</p>
      </div>
    );
  }

  const day = planQuery.data.find((d) => d.name.toUpperCase() === dayCode.toUpperCase());
  if (!day) {
    return <p className="text-mute text-sm py-10 text-center">Dia &quot;{dayCode}&quot; não encontrado nesse plano.</p>;
  }

  return <DayEditorBody workspaceId={workspaceId} day={day} />;
}

function DayEditorBody({ workspaceId, day }: { workspaceId: string; day: CoachDay }) {
  const updateRow = useUpdateExerciseRow();
  const addExercise = useAddExercise();
  const deleteExercise = useDeleteExercise();
  const updateDay = useUpdateDay();

  const [pickerFor, setPickerFor] = useState<{ kind: 'replace'; rowId: string } | { kind: 'add' } | null>(null);

  const closePicker = () => setPickerFor(null);
  const handlePick = (item: ExerciseCatalogItem) => {
    if (!pickerFor) return;
    if (pickerFor.kind === 'replace') {
      updateRow.mutate({ workspaceId, exerciseRowId: pickerFor.rowId, patch: { exercise_id: item.id } });
    } else {
      const nextOrd = (day.exercises[day.exercises.length - 1]?.ord ?? 0) + 1;
      addExercise.mutate({
        workspaceId,
        dayId: day.id,
        exerciseId: item.id,
        sets: 3,
        reps_target: '10-12',
        rest_seconds: 60,
        ord: nextOrd,
      });
    }
    closePicker();
  };

  return (
    <div className="space-y-3">
      <div className="rounded-lg bg-cave border border-smoke p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-mute text-[10px] uppercase tracking-widest">cardio</span>
          <NumberField
            value={day.cardio_minutes}
            min={0}
            max={120}
            step={5}
            onCommit={(v) => updateDay.mutate({ workspaceId, dayId: day.id, patch: { cardio_minutes: v } })}
            suffix="min"
          />
        </div>
      </div>

      {day.exercises.map((ex) => (
        <ExerciseRow
          key={ex.id}
          row={ex}
          onChange={(patch) => updateRow.mutate({ workspaceId, exerciseRowId: ex.id, patch })}
          onReplace={() => setPickerFor({ kind: 'replace', rowId: ex.id })}
          onDelete={() => deleteExercise.mutate({ workspaceId, exerciseRowId: ex.id })}
          isDeleting={deleteExercise.isPending && deleteExercise.variables?.exerciseRowId === ex.id}
        />
      ))}

      <Button
        variant="ghost"
        className="w-full border border-dashed border-smoke hover:border-ember/40"
        onClick={() => setPickerFor({ kind: 'add' })}
        disabled={addExercise.isPending}
      >
        {addExercise.isPending ? <Loader2 className="size-4 animate-spin mr-2" /> : <Plus className="size-4 mr-2" />}
        adicionar exercício
      </Button>

      <ExercisePicker
        open={!!pickerFor}
        onClose={closePicker}
        onPick={handlePick}
        title={pickerFor?.kind === 'replace' ? 'trocar exercício' : 'adicionar exercício'}
      />
    </div>
  );
}

function ExerciseRow({
  row,
  onChange,
  onReplace,
  onDelete,
  isDeleting,
}: {
  row: CoachExerciseRow;
  onChange: (patch: Partial<{ sets: number; reps_target: string; rest_seconds: number }>) => void;
  onReplace: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="rounded-lg bg-cave border border-smoke p-4">
      <div className="flex items-start justify-between gap-2 mb-3">
        <button
          type="button"
          onClick={onReplace}
          className="text-left flex-1 min-w-0 group"
        >
          <p className="text-bone font-medium leading-tight group-hover:text-ember transition-colors break-words">
            {row.exercise_name}
          </p>
          <span className="text-mute text-[10px] uppercase tracking-widest inline-flex items-center gap-1 mt-0.5">
            <Repeat className="size-3" /> tocar pra trocar
          </span>
        </button>
        <button
          type="button"
          onClick={() => {
            if (confirmDelete) {
              onDelete();
              setConfirmDelete(false);
            } else {
              setConfirmDelete(true);
              setTimeout(() => setConfirmDelete(false), 2500);
            }
          }}
          disabled={isDeleting}
          className={cn(
            'shrink-0 size-8 rounded-md flex items-center justify-center transition-colors',
            confirmDelete ? 'bg-blood/20 text-blood' : 'text-mute hover:text-blood',
          )}
          aria-label={confirmDelete ? 'confirmar remoção' : 'remover exercício'}
        >
          {isDeleting ? <Loader2 className="size-4 animate-spin" /> : confirmDelete ? <Check className="size-4" /> : <Trash2 className="size-4" />}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Field label="séries">
          <NumberField
            value={row.sets}
            min={1}
            max={20}
            step={1}
            onCommit={(v) => onChange({ sets: v })}
          />
        </Field>
        <Field label="reps">
          <TextField
            value={row.reps_target}
            placeholder="10-12"
            onCommit={(v) => onChange({ reps_target: v })}
          />
        </Field>
        <Field label="descanso">
          <NumberField
            value={row.rest_seconds}
            min={0}
            max={600}
            step={15}
            onCommit={(v) => onChange({ rest_seconds: v })}
            suffix="s"
          />
        </Field>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-mute text-[9px] uppercase tracking-widest block mb-1">{label}</span>
      {children}
    </label>
  );
}

function NumberField({
  value,
  min,
  max,
  step,
  onCommit,
  suffix,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  onCommit: (v: number) => void;
  suffix?: string;
}) {
  const [local, setLocal] = useState(String(value));
  return (
    <div className="flex items-center gap-1">
      <input
        type="number"
        inputMode="numeric"
        value={local}
        min={min}
        max={max}
        step={step}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={() => {
          const n = Number(local);
          if (Number.isFinite(n) && n >= min && n <= max && n !== value) {
            onCommit(n);
          } else {
            setLocal(String(value));
          }
        }}
        className="w-full bg-elevated/40 border border-smoke rounded px-2 py-1.5 text-bone text-sm focus:outline-none focus:border-ember/40"
      />
      {suffix ? <span className="text-mute text-xs">{suffix}</span> : null}
    </div>
  );
}

function TextField({
  value,
  placeholder,
  onCommit,
}: {
  value: string;
  placeholder?: string;
  onCommit: (v: string) => void;
}) {
  const [local, setLocal] = useState(value);
  return (
    <input
      type="text"
      value={local}
      placeholder={placeholder}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={() => {
        const trimmed = local.trim();
        if (trimmed.length > 0 && trimmed !== value) {
          onCommit(trimmed);
        } else if (trimmed.length === 0) {
          setLocal(value);
        }
      }}
      className="w-full bg-elevated/40 border border-smoke rounded px-2 py-1.5 text-bone text-sm focus:outline-none focus:border-ember/40"
    />
  );
}

function ExercisePicker({
  open,
  onClose,
  onPick,
  title,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (item: ExerciseCatalogItem) => void;
  title: string;
}) {
  const catalog = useExercisesCatalog();
  const [q, setQ] = useState('');

  const items = (catalog.data ?? []).filter((it) => {
    if (!q) return true;
    const needle = q.toLowerCase();
    return it.name.toLowerCase().includes(needle) || it.muscle_group.toLowerCase().includes(needle);
  });

  return (
    <Sheet open={open} onClose={onClose} title={title}>
      <div className="p-4">
        <input
          type="search"
          autoFocus
          placeholder="buscar exercício..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full bg-elevated/40 border border-smoke rounded-lg px-3 py-2 text-bone text-sm focus:outline-none focus:border-ember/40 mb-3"
        />
        {catalog.isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="size-5 text-ember animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <p className="text-mute text-xs text-center py-6">Nenhum exercício encontrado.</p>
        ) : (
          <ul className="space-y-1.5">
            {items.map((it) => (
              <li key={it.id}>
                <button
                  type="button"
                  onClick={() => onPick(it)}
                  className="w-full text-left rounded-md bg-elevated/30 hover:bg-elevated/60 border border-smoke px-3 py-2 transition-colors"
                >
                  <p className="text-bone text-sm">{it.name}</p>
                  <p className="text-mute text-[10px] uppercase tracking-widest">{it.muscle_group}</p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Sheet>
  );
}
