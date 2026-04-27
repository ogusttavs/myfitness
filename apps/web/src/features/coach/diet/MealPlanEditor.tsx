'use client';

import { useState } from 'react';
import { Plus, Trash2, Loader2, Check, ChevronDown } from 'lucide-react';
import { Button } from '@ui/button';
import { Sheet } from '@/components/ui/Sheet';
import { cn } from '@/lib/cn';
import { useCoachMealPlan, useFoodsCatalog, type CoachMealPlan, type CoachMeal, type CoachMealItem, type FoodCatalogItem } from './queries';
import {
  useUpdateMealItem,
  useAddMealItem,
  useDeleteMealItem,
  useUpdateMeal,
  useUpdateMealPlanMacros,
} from './mutations';

export function MealPlanEditor({ workspaceId }: { workspaceId: string }) {
  const planQuery = useCoachMealPlan(workspaceId);

  if (planQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-5 text-ember animate-spin" />
      </div>
    );
  }

  if (!planQuery.data) {
    return (
      <div className="rounded-lg bg-cave border border-smoke p-5 text-center">
        <p className="text-bone text-sm font-medium">Atleta sem dieta ativa.</p>
        <p className="text-mute text-xs mt-1">Aplique o protocolo Modo Caverna no painel pra começar.</p>
      </div>
    );
  }

  return <Body workspaceId={workspaceId} plan={planQuery.data} />;
}

function Body({ workspaceId, plan }: { workspaceId: string; plan: CoachMealPlan }) {
  const updateMacros = useUpdateMealPlanMacros();

  return (
    <div className="space-y-4">
      <section className="rounded-lg bg-cave border border-smoke p-4">
        <h3 className="text-mute text-xs uppercase tracking-widest mb-3">macros-alvo</h3>
        <div className="grid grid-cols-4 gap-2">
          <Field label="kcal">
            <NumberField
              value={plan.kcal_target ?? 0}
              min={0}
              max={6000}
              step={50}
              onCommit={(v) => updateMacros.mutate({ workspaceId, planId: plan.id, patch: { kcal_target: v } })}
            />
          </Field>
          <Field label="prot">
            <NumberField
              value={plan.protein_g ?? 0}
              min={0}
              max={500}
              step={5}
              onCommit={(v) => updateMacros.mutate({ workspaceId, planId: plan.id, patch: { protein_g: v } })}
              suffix="g"
            />
          </Field>
          <Field label="carb">
            <NumberField
              value={plan.carb_g ?? 0}
              min={0}
              max={800}
              step={5}
              onCommit={(v) => updateMacros.mutate({ workspaceId, planId: plan.id, patch: { carb_g: v } })}
              suffix="g"
            />
          </Field>
          <Field label="gord">
            <NumberField
              value={plan.fat_g ?? 0}
              min={0}
              max={300}
              step={5}
              onCommit={(v) => updateMacros.mutate({ workspaceId, planId: plan.id, patch: { fat_g: v } })}
              suffix="g"
            />
          </Field>
        </div>
      </section>

      {plan.meals.map((meal) => (
        <MealSection key={meal.id} workspaceId={workspaceId} meal={meal} />
      ))}
    </div>
  );
}

function MealSection({ workspaceId, meal }: { workspaceId: string; meal: CoachMeal }) {
  const [open, setOpen] = useState(false);
  const [picker, setPicker] = useState(false);
  const updateMeal = useUpdateMeal();
  const updateItem = useUpdateMealItem();
  const addItem = useAddMealItem();
  const deleteItem = useDeleteMealItem();

  const totalKcal = meal.items.reduce((s, it) => s + (Number(it.est_kcal) || 0), 0);

  const handleAddFromCatalog = (food: FoodCatalogItem) => {
    addItem.mutate({
      workspaceId,
      mealId: meal.id,
      description: food.name,
      food_id: food.id,
      est_kcal: Number(food.kcal_per_unit) || null,
      est_protein_g: Number(food.protein_g) || null,
      est_carb_g: Number(food.carb_g) || null,
      est_fat_g: Number(food.fat_g) || null,
    });
    setPicker(false);
  };

  const handleAddBlank = () => {
    addItem.mutate({
      workspaceId,
      mealId: meal.id,
      description: 'Novo item',
      est_kcal: 0,
      est_protein_g: 0,
      est_carb_g: 0,
      est_fat_g: 0,
    });
    setPicker(false);
  };

  return (
    <section className="rounded-lg bg-cave border border-smoke overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between p-4 active:opacity-80"
      >
        <div className="text-left">
          <div className="flex items-center gap-2">
            <span className="text-mute text-[10px] uppercase tracking-widest">refeição {meal.ord}</span>
            {meal.scheduled_time ? <span className="text-mute text-[10px]">·</span> : null}
            {meal.scheduled_time ? <span className="text-mute text-[10px]">{meal.scheduled_time}</span> : null}
          </div>
          <p className="text-bone font-medium leading-tight">{meal.name}</p>
          <p className="text-mute text-xs mt-0.5">{meal.items.length} itens · ~{Math.round(totalKcal)} kcal</p>
        </div>
        <ChevronDown className={cn('size-4 text-mute transition-transform', open && 'rotate-180')} />
      </button>

      {open ? (
        <div className="border-t border-smoke p-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Field label="nome">
              <TextField
                value={meal.name}
                onCommit={(v) => updateMeal.mutate({ workspaceId, mealId: meal.id, patch: { name: v } })}
              />
            </Field>
            <Field label="horário">
              <TextField
                value={meal.scheduled_time ?? ''}
                placeholder="07:00"
                onCommit={(v) => updateMeal.mutate({ workspaceId, mealId: meal.id, patch: { scheduled_time: v || null } })}
              />
            </Field>
          </div>

          <div className="space-y-2">
            {meal.items.length === 0 ? (
              <p className="text-mute text-xs text-center py-3">Sem itens.</p>
            ) : (
              meal.items.map((it) => (
                <ItemRow
                  key={it.id}
                  item={it}
                  onChange={(patch) => updateItem.mutate({ workspaceId, itemId: it.id, patch })}
                  onDelete={() => deleteItem.mutate({ workspaceId, itemId: it.id })}
                  isDeleting={deleteItem.isPending && deleteItem.variables?.itemId === it.id}
                />
              ))
            )}
          </div>

          <Button
            variant="ghost"
            className="w-full border border-dashed border-smoke hover:border-ember/40"
            onClick={() => setPicker(true)}
            disabled={addItem.isPending}
          >
            {addItem.isPending ? <Loader2 className="size-4 animate-spin mr-2" /> : <Plus className="size-4 mr-2" />}
            adicionar item
          </Button>
        </div>
      ) : null}

      <FoodPicker
        open={picker}
        onClose={() => setPicker(false)}
        onPick={handleAddFromCatalog}
        onPickBlank={handleAddBlank}
      />
    </section>
  );
}

function ItemRow({
  item,
  onChange,
  onDelete,
  isDeleting,
}: {
  item: CoachMealItem;
  onChange: (patch: Partial<{ description: string; est_kcal: number; est_protein_g: number; est_carb_g: number; est_fat_g: number }>) => void;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="rounded-md bg-elevated/30 border border-smoke p-3">
      <div className="flex items-start gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <TextField
            value={item.description}
            onCommit={(v) => onChange({ description: v })}
          />
        </div>
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
          aria-label={confirmDelete ? 'confirmar remoção' : 'remover item'}
        >
          {isDeleting ? <Loader2 className="size-4 animate-spin" /> : confirmDelete ? <Check className="size-4" /> : <Trash2 className="size-4" />}
        </button>
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        <Field label="kcal">
          <NumberField
            value={Number(item.est_kcal) || 0}
            min={0}
            max={2000}
            step={5}
            onCommit={(v) => onChange({ est_kcal: v })}
            small
          />
        </Field>
        <Field label="P">
          <NumberField
            value={Number(item.est_protein_g) || 0}
            min={0}
            max={200}
            step={1}
            onCommit={(v) => onChange({ est_protein_g: v })}
            small
          />
        </Field>
        <Field label="C">
          <NumberField
            value={Number(item.est_carb_g) || 0}
            min={0}
            max={300}
            step={1}
            onCommit={(v) => onChange({ est_carb_g: v })}
            small
          />
        </Field>
        <Field label="G">
          <NumberField
            value={Number(item.est_fat_g) || 0}
            min={0}
            max={150}
            step={1}
            onCommit={(v) => onChange({ est_fat_g: v })}
            small
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
  value, min, max, step, onCommit, suffix, small,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  onCommit: (v: number) => void;
  suffix?: string;
  small?: boolean;
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
        className={cn(
          'w-full bg-elevated/40 border border-smoke rounded text-bone focus:outline-none focus:border-ember/40',
          small ? 'px-1.5 py-1 text-xs' : 'px-2 py-1.5 text-sm',
        )}
      />
      {suffix ? <span className="text-mute text-[10px]">{suffix}</span> : null}
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
        if (trimmed !== value) {
          onCommit(trimmed);
        }
      }}
      className="w-full bg-elevated/40 border border-smoke rounded px-2 py-1.5 text-bone text-sm focus:outline-none focus:border-ember/40"
    />
  );
}

function FoodPicker({
  open,
  onClose,
  onPick,
  onPickBlank,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (food: FoodCatalogItem) => void;
  onPickBlank: () => void;
}) {
  const catalog = useFoodsCatalog();
  const [q, setQ] = useState('');

  const items = (catalog.data ?? []).filter((it) => {
    if (!q) return true;
    return it.name.toLowerCase().includes(q.toLowerCase());
  });

  return (
    <Sheet open={open} onClose={onClose} title="adicionar item">
      <div className="p-4">
        <input
          type="search"
          autoFocus
          placeholder="buscar alimento..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full bg-elevated/40 border border-smoke rounded-lg px-3 py-2 text-bone text-sm focus:outline-none focus:border-ember/40 mb-3"
        />

        <button
          type="button"
          onClick={onPickBlank}
          className="w-full text-left rounded-md bg-elevated/30 hover:bg-elevated/60 border border-dashed border-smoke px-3 py-2 mb-3 transition-colors"
        >
          <p className="text-bone text-sm">+ item livre (texto)</p>
          <p className="text-mute text-[10px] uppercase tracking-widest">descrição manual, macros 0</p>
        </button>

        {catalog.isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="size-5 text-ember animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <p className="text-mute text-xs text-center py-6">Nenhum alimento.</p>
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
                  <p className="text-mute text-[10px] uppercase tracking-widest">
                    {Number(it.kcal_per_unit) || 0} kcal · P{Number(it.protein_g) || 0} C{Number(it.carb_g) || 0} G{Number(it.fat_g) || 0} / {it.default_unit}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Sheet>
  );
}
