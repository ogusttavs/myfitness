'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle, ChevronRight } from 'lucide-react';
import { Button } from '@ui/button';
import { useSession } from '@/lib/supabase/useSession';
import { useActiveWorkspace } from '@/lib/supabase/useWorkspace';
import { useAthleteProfile } from '@/lib/supabase/useAthleteProfile';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/cn';

const LEVELS = [
  { id: 'iniciante', label: 'Iniciante', desc: 'Começou há pouco tempo' },
  { id: 'intermediario', label: 'Intermediário', desc: '6m+ treinando regular' },
  { id: 'avancado', label: 'Avançado', desc: '2a+ com sobrecarga progressiva' },
] as const;

export function OnboardingForm() {
  const router = useRouter();
  const qc = useQueryClient();
  const { user } = useSession();
  const { workspace } = useActiveWorkspace();
  const profile = useAthleteProfile();

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [level, setLevel] = useState<'iniciante' | 'intermediario' | 'avancado'>('intermediario');
  const [goal, setGoal] = useState('Hipertrofia + Perda de Gordura');
  const [frequency, setFrequency] = useState('5');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // pré-preenche se já tem alguma coisa salva
  useEffect(() => {
    if (!profile.data) return;
    if (profile.data.fullName) setName(profile.data.fullName);
    if (profile.data.age) setAge(String(profile.data.age));
    if (profile.data.weightKg) setWeight(String(profile.data.weightKg));
    if (profile.data.heightCm) setHeight(String(profile.data.heightCm));
    if (profile.data.level) setLevel(profile.data.level);
    if (profile.data.goal) setGoal(profile.data.goal);
    if (profile.data.weeklyFrequency) setFrequency(String(profile.data.weeklyFrequency));
  }, [profile.data]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !workspace) return;
    setError(null);
    setSubmitting(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const ageNum = parseInt(age, 10);
      const weightNum = Number(weight.replace(',', '.'));
      const heightNum = Math.round(Number(height.replace(',', '.')) * (Number(height) > 10 ? 1 : 100));
      const freqNum = parseInt(frequency, 10);

      // 1) profile.full_name
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: name.trim() } as never)
        .eq('id', user.id);
      if (profileError) throw profileError;

      // 2) athlete_data (upsert)
      const { error: dataError } = await supabase
        .from('athlete_data')
        .upsert({
          workspace_id: workspace.id,
          age: ageNum,
          weight_kg: weightNum,
          height_cm: heightNum,
          level,
          goal,
          weekly_frequency: freqNum,
        } as never);
      if (dataError) throw dataError;

      // 3) opcional: registra primeira pesagem
      await supabase
        .from('weight_logs')
        .insert({ workspace_id: workspace.id, weight_kg: weightNum } as never);

      qc.invalidateQueries({ queryKey: ['athlete:profile'] });
      qc.invalidateQueries({ queryKey: ['weight_logs'] });

      router.replace('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar');
    } finally {
      setSubmitting(false);
    }
  };

  if (profile.loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="size-5 text-ember animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <header>
        <p className="text-mute text-xs uppercase tracking-widest">vamos começar</p>
        <h1 className="text-bone text-3xl font-display tracking-wider mt-1">SEU PERFIL</h1>
        <p className="text-ash text-sm mt-2">
          Preencha seus dados pra personalizar treino e dieta. Você pode editar depois em Perfil.
        </p>
      </header>

      <Field label="Nome">
        <input
          type="text"
          required
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex.: João Silva"
          className="w-full h-12 px-4 rounded-md bg-elevated border border-smoke text-bone placeholder:text-mute focus:outline-none focus:border-ember/60"
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Idade">
          <input
            type="number"
            inputMode="numeric"
            min={10}
            max={120}
            required
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="22"
            className="w-full h-12 px-4 rounded-md bg-elevated border border-smoke text-bone placeholder:text-mute focus:outline-none focus:border-ember/60"
          />
        </Field>
        <Field label="Frequência semanal">
          <select
            required
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            className="w-full h-12 px-3 rounded-md bg-elevated border border-smoke text-bone focus:outline-none focus:border-ember/60"
          >
            {[2, 3, 4, 5, 6, 7].map((n) => (
              <option key={n} value={n}>{n}x por semana</option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Peso (kg)">
          <input
            type="text"
            inputMode="decimal"
            required
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="80,5"
            className="w-full h-12 px-4 rounded-md bg-elevated border border-smoke text-bone placeholder:text-mute focus:outline-none focus:border-ember/60"
          />
        </Field>
        <Field label="Altura (m)">
          <input
            type="text"
            inputMode="decimal"
            required
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder="1,75"
            className="w-full h-12 px-4 rounded-md bg-elevated border border-smoke text-bone placeholder:text-mute focus:outline-none focus:border-ember/60"
          />
        </Field>
      </div>

      <Field label="Nível">
        <div className="space-y-2">
          {LEVELS.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => setLevel(l.id)}
              className={cn(
                'w-full flex items-center justify-between px-4 py-3 rounded-md border text-left transition-colors',
                level === l.id ? 'border-ember bg-ember/10' : 'border-smoke bg-elevated hover:border-mute',
              )}
            >
              <div>
                <p className={cn('font-medium', level === l.id ? 'text-bone' : 'text-bone')}>{l.label}</p>
                <p className="text-mute text-xs">{l.desc}</p>
              </div>
              {level === l.id ? <span className="size-3 rounded-full bg-ember" /> : null}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Objetivo">
        <input
          type="text"
          required
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="Ex.: Hipertrofia, Definição..."
          className="w-full h-12 px-4 rounded-md bg-elevated border border-smoke text-bone placeholder:text-mute focus:outline-none focus:border-ember/60"
        />
      </Field>

      {error ? (
        <div className="flex items-start gap-2 rounded-md bg-blood/10 border border-blood/40 p-3">
          <AlertCircle className="size-4 text-blood shrink-0 mt-0.5" />
          <p className="text-blood text-xs">{error}</p>
        </div>
      ) : null}

      <Button type="submit" variant="primary" size="lg" className="w-full" disabled={submitting}>
        {submitting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <>começar <ChevronRight className="size-4 ml-2" /></>
        )}
      </Button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-mute text-[10px] uppercase tracking-widest">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
