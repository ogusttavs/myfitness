'use client';

import Link from 'next/link';
import { BarChart3, ChevronRight, Edit2 } from 'lucide-react';
import { observations } from '@/data/protocol';
import { LogoutButton } from '@/features/auth/LogoutButton';
import { SessionEmail } from '@/features/auth/SessionEmail';
import { InviteCoachCard } from '@/features/coach/InviteCoachCard';
import { useAthleteProfile } from '@/lib/supabase/useAthleteProfile';

export function PerfilClient() {
  const { data, loading } = useAthleteProfile();

  return (
    <>
      <header className="mb-6">
        <p className="text-mute text-xs uppercase tracking-widest">você</p>
        <h1 className="text-bone text-4xl font-display tracking-wider mt-1">
          {(data?.fullName || '—').toUpperCase()}
        </h1>
        <SessionEmail />
      </header>

      <section className="rounded-lg bg-cave border border-smoke p-5 mb-6">
        <div className="flex items-baseline justify-between mb-3">
          <span className="text-mute text-xs uppercase tracking-widest">dados</span>
          <Link
            href="/onboarding"
            className="text-ember text-xs uppercase tracking-widest flex items-center gap-1 hover:opacity-80"
          >
            <Edit2 className="size-3" /> editar
          </Link>
        </div>

        {loading ? (
          <p className="text-mute text-sm">carregando...</p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              <Stat label="Idade" value={data?.age ? `${data.age} anos` : '—'} />
              <Stat label="Peso" value={data?.weightKg ? `${data.weightKg} kg` : '—'} />
              <Stat label="Altura" value={data?.heightCm ? `${(data.heightCm / 100).toFixed(2)} m` : '—'} />
              <Stat label="Nível" value={data?.level ? capitalize(data.level) : '—'} />
            </div>
            <div className="mt-4 pt-4 border-t border-smoke">
              <Stat label="Objetivo" value={data?.goal ?? '—'} />
              <div className="mt-3">
                <Stat label="Frequência" value={data?.weeklyFrequency ? `${data.weeklyFrequency}x por semana` : '—'} />
              </div>
            </div>
          </>
        )}
      </section>

      <InviteCoachCard />

      <Link
        href="/relatorios"
        className="flex items-center gap-3 rounded-lg bg-cave border border-smoke p-4 mb-6 active:opacity-80"
      >
        <div className="size-10 rounded-full bg-elevated border border-smoke flex items-center justify-center">
          <BarChart3 className="size-4 text-ember" />
        </div>
        <div className="flex-1">
          <p className="text-bone font-medium text-sm">Relatórios</p>
          <p className="text-mute text-xs mt-0.5">volume semanal, aderência, histórico</p>
        </div>
        <ChevronRight className="size-4 text-mute" />
      </Link>

      <h2 className="text-mute text-xs uppercase tracking-widest mb-3">recomendações</h2>
      <ul className="space-y-3 mb-6">
        {observations.map((obs, idx) => (
          <li key={idx} className="rounded-lg bg-cave border border-smoke p-4">
            <p className="text-ember text-xs uppercase tracking-widest font-medium">{obs.topic}</p>
            <p className="text-bone text-sm mt-1.5 leading-relaxed">{obs.text}</p>
          </li>
        ))}
      </ul>

      <LogoutButton />

      <p className="text-mute text-[10px] text-center mt-8 uppercase tracking-widest">
        Modo Caverna · v0.1
      </p>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] text-mute uppercase tracking-widest">{label}</p>
      <p className="text-bone text-sm font-medium mt-0.5">{value}</p>
    </div>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
