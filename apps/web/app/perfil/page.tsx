import { AppShell } from '@/components/AppShell';
import { profile, observations } from '@/data/protocol';
import { LogoutButton } from '@/features/auth/LogoutButton';
import { SessionEmail } from '@/features/auth/SessionEmail';

export default function PerfilPage() {
  return (
    <AppShell>
      <header className="mb-6">
        <p className="text-mute text-xs uppercase tracking-widest">você</p>
        <h1 className="text-bone text-4xl font-display tracking-wider mt-1">{profile.name.toUpperCase()}</h1>
        <SessionEmail />
      </header>

      <section className="rounded-lg bg-cave border border-smoke p-5 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <Stat label="Idade" value={`${profile.age} anos`} />
          <Stat label="Peso" value={`${profile.weightKg} kg`} />
          <Stat label="Altura" value={`${profile.heightM} m`} />
          <Stat label="Nível" value={profile.level} />
        </div>
        <div className="mt-4 pt-4 border-t border-smoke">
          <Stat label="Objetivo" value={profile.goal} />
          <div className="mt-3">
            <Stat label="Frequência" value={`${profile.weeklyFrequency}x por semana`} />
          </div>
        </div>
      </section>

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
    </AppShell>
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
