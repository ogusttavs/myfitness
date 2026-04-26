'use client';

import { use } from 'react';
import Link from 'next/link';
import { ChevronLeft, Loader2, Dumbbell, UtensilsCrossed, Scale, Camera } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { AuthGuard } from '@/components/AuthGuard';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

const dayMonth = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' });

export default function CoachAtletaPage({ params }: { params: Promise<{ workspaceId: string }> }) {
  const { workspaceId } = use(params);
  return (
    <AuthGuard>
      <Content workspaceId={workspaceId} />
    </AuthGuard>
  );
}

function Content({ workspaceId }: { workspaceId: string }) {
  const summary = useQuery({
    queryKey: ['coach:summary', workspaceId],
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();
      const since = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();

      type AthleteData = { age: number | null; height_cm: number | null; weight_kg: number | null; level: string | null; goal: string | null; weekly_frequency: number | null };
      type WeightLog = { weight_kg: number; logged_at: string };
      type Session = { id: string; started_at: string; finished_at: string | null; plan_day_id: string | null };
      type MealEntry = { id: string; date: string };

      const [profileWSRes, athleteDataRes, lastWeightRes, sessionsRes, mealsRes, photosRes] = await Promise.all([
        supabase.from('workspaces').select('athlete_user_id, profiles!workspaces_athlete_user_id_fkey(full_name)').eq('id', workspaceId).maybeSingle(),
        supabase.from('athlete_data').select('age, height_cm, weight_kg, level, goal, weekly_frequency').eq('workspace_id', workspaceId).maybeSingle(),
        supabase.from('weight_logs').select('weight_kg, logged_at').eq('workspace_id', workspaceId).order('logged_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('workout_sessions').select('id, started_at, finished_at, plan_day_id').eq('workspace_id', workspaceId).gte('started_at', since).order('started_at', { ascending: false }),
        supabase.from('meal_logs').select('id, date').eq('workspace_id', workspaceId).gte('date', since.split('T')[0] ?? ''),
        supabase.from('progress_photos').select('id, angle, storage_path, taken_on, weight_kg').eq('workspace_id', workspaceId).order('taken_on', { ascending: false }).limit(6),
      ]);

      const profileWS = profileWSRes.data as unknown as { athlete_user_id: string; profiles: { full_name: string } | null } | null;
      const athleteData = athleteDataRes.data as AthleteData | null;
      const lastWeight = lastWeightRes.data as WeightLog | null;
      const sessions = (sessionsRes.data ?? []) as Session[];
      const meals = (mealsRes.data ?? []) as MealEntry[];
      const photos = photosRes.data;

      // signed urls para fotos
      type PhotoRow = { id: string; angle: 'front' | 'side' | 'back'; storage_path: string; taken_on: string; weight_kg: number | null };
      const photoRows: PhotoRow[] = (photos ?? []) as PhotoRow[];
      let photoUrls: Record<string, string> = {};
      if (photoRows.length > 0) {
        const { data: signed } = await supabase.storage
          .from('progress-photos')
          .createSignedUrls(photoRows.map((p) => p.storage_path), 3600);
        photoUrls = Object.fromEntries(
          (signed ?? [])
            .filter((s): s is { path: string; signedUrl: string; error: null } => !!s.signedUrl && !!s.path)
            .map((s) => [s.path, s.signedUrl]),
        );
      }

      const athleteName = profileWS?.profiles?.full_name ?? 'Atleta';
      return {
        athleteName,
        athleteData,
        lastWeight,
        sessions: sessions ?? [],
        meals: meals ?? [],
        photos: photoRows.map((p) => ({ ...p, signed_url: photoUrls[p.storage_path] })),
      };
    },
  });

  if (summary.isLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <Loader2 className="size-5 text-ember animate-spin" />
      </div>
    );
  }

  if (summary.error || !summary.data) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-6 text-center">
        <p className="text-bone font-medium">Sem acesso a esse atleta.</p>
        <p className="text-mute text-xs mt-2">Verifique o vínculo no painel Coach.</p>
        <Link href="/coach" className="mt-6 text-ember text-xs uppercase tracking-widest">voltar</Link>
      </div>
    );
  }

  const s = summary.data;

  return (
    <div className="min-h-dvh">
      <main
        className="max-w-md w-full mx-auto px-5 pt-6"
        style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }}
      >
        <Link href="/coach" className="inline-flex items-center gap-1 text-mute text-xs uppercase tracking-widest hover:text-ash mb-3">
          <ChevronLeft className="size-4" />
          atletas
        </Link>

        <header className="mb-6">
          <p className="text-mute text-xs uppercase tracking-widest">atleta</p>
          <h1 className="text-bone text-3xl font-display tracking-wider mt-1">{s.athleteName.toUpperCase()}</h1>
          {s.athleteData ? (
            <p className="text-ash text-sm mt-1">
              {s.athleteData.age}a · {s.lastWeight ? Number(s.lastWeight.weight_kg).toFixed(1) : s.athleteData.weight_kg}kg · {s.athleteData.height_cm ? (s.athleteData.height_cm / 100).toFixed(2) : '—'}m · {s.athleteData.level}
            </p>
          ) : null}
          {s.athleteData?.goal ? <p className="text-mute text-xs mt-1">{s.athleteData.goal}</p> : null}
        </header>

        {/* KPIs da semana */}
        <h2 className="text-mute text-xs uppercase tracking-widest mb-3">últimos 7 dias</h2>
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Kpi icon={<Dumbbell className="size-4 text-ember" />} label="Treinos" value={`${s.sessions.length}`} />
          <Kpi icon={<UtensilsCrossed className="size-4 text-ember" />} label="Refeições" value={`${s.meals.length}/42`} />
          <Kpi icon={<Scale className="size-4 text-ember" />} label="Último peso" value={s.lastWeight ? `${Number(s.lastWeight.weight_kg).toFixed(1)}kg` : '—'} />
          <Kpi icon={<Camera className="size-4 text-ember" />} label="Fotos" value={`${s.photos.length}`} />
        </div>

        {/* Treinos recentes */}
        <h2 className="text-mute text-xs uppercase tracking-widest mb-3">treinos da semana</h2>
        {s.sessions.length === 0 ? (
          <p className="text-mute text-xs py-4">Sem treinos registrados nessa janela.</p>
        ) : (
          <ul className="space-y-2 mb-6">
            {s.sessions.map((sess) => (
              <li key={sess.id} className="rounded-lg bg-cave border border-smoke p-3 flex items-center justify-between">
                <div>
                  <p className="text-bone text-sm font-medium">{dayMonth.format(new Date(sess.started_at))}</p>
                  <p className="text-mute text-xs">{sess.finished_at ? 'finalizado' : 'em andamento'}</p>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Fotos recentes */}
        {s.photos.length > 0 ? (
          <>
            <h2 className="text-mute text-xs uppercase tracking-widest mb-3">fotos recentes</h2>
            <div className="grid grid-cols-3 gap-2 mb-6">
              {s.photos.map((p) => (
                <div key={p.id} className="aspect-[3/4] rounded-md overflow-hidden bg-elevated border border-smoke">
                  {p.signed_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.signed_url} alt={p.angle} className="w-full h-full object-cover" />
                  ) : null}
                </div>
              ))}
            </div>
          </>
        ) : null}

        <p className="text-mute text-[10px] text-center mt-8 uppercase tracking-widest">
          Edição de planos chegando em breve
        </p>
      </main>
    </div>
  );
}

function Kpi({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg bg-cave border border-smoke p-4">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-mute text-[10px] uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-bone font-display tracking-wider text-2xl leading-none">{value}</p>
    </div>
  );
}
