'use client';

import { useState } from 'react';
import { Loader2, Plus, Users, ChevronRight, Check, AlertCircle } from 'lucide-react';
import { useSession } from '@/lib/supabase/useSession';
import { AuthGuard } from '@/components/AuthGuard';
import { Button } from '@ui/button';
import { useCoachAtletas, useRedeemInvite } from '@/features/coach/queries';
import { cn } from '@/lib/cn';

const dayMonth = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

export default function CoachPage() {
  return (
    <AuthGuard>
      <CoachContent />
    </AuthGuard>
  );
}

function CoachContent() {
  const { user } = useSession();
  const { data: atletas = [], isLoading } = useCoachAtletas(user?.id ?? null);
  const [showRedeem, setShowRedeem] = useState(false);

  return (
    <div className="min-h-dvh">
      <main
        className="max-w-md w-full mx-auto px-5 pt-6"
        style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }}
      >
        <header className="mb-6">
          <p className="text-mute text-xs uppercase tracking-widest">painel</p>
          <h1 className="text-bone text-4xl font-display tracking-wider mt-1">COACH</h1>
        </header>

        <Button
          variant="primary"
          size="md"
          className="w-full mb-6"
          onClick={() => setShowRedeem(true)}
        >
          <Plus className="size-4 mr-2" /> adicionar atleta
        </Button>

        <h2 className="text-mute text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
          <Users className="size-3" /> atletas ({atletas.length})
        </h2>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="size-5 text-ember animate-spin" />
          </div>
        ) : atletas.length === 0 ? (
          <div className="rounded-lg border border-dashed border-smoke bg-cave/40 p-6 text-center">
            <p className="text-bone text-sm font-medium">Nenhum atleta vinculado</p>
            <p className="text-mute text-xs mt-1.5">
              Peça pro atleta gerar um código de convite (em Perfil → Coach) e cole aqui.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {atletas.map((a) => (
              <li key={a.workspaceId}>
                <a
                  href={`/coach/${a.workspaceId}`}
                  className="flex items-center gap-3 rounded-lg bg-cave border border-smoke p-4 active:opacity-80 hover:border-mute transition-colors"
                >
                  <div className="size-11 rounded-full bg-elevated border border-smoke flex items-center justify-center">
                    <span className="text-bone font-display text-base tracking-wider">
                      {a.athleteName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-bone font-medium leading-tight">{a.athleteName}</p>
                    <p className="text-mute text-xs mt-0.5">vinculado em {dayMonth.format(new Date(a.invitedAt))}</p>
                  </div>
                  <ChevronRight className="size-4 text-mute" />
                </a>
              </li>
            ))}
          </ul>
        )}

        <p className="text-mute text-[10px] text-center mt-8 uppercase tracking-widest">Modo Caverna · Coach</p>
      </main>

      {showRedeem ? <RedeemSheet onClose={() => setShowRedeem(false)} /> : null}
    </div>
  );
}

function RedeemSheet({ onClose }: { onClose: () => void }) {
  const [code, setCode] = useState('');
  const redeem = useRedeemInvite();
  const [success, setSuccess] = useState(false);

  const submit = async () => {
    if (!code.trim()) return;
    try {
      await redeem.mutateAsync(code.trim());
      setSuccess(true);
      setTimeout(onClose, 1500);
    } catch {
      // erro mostrado via redeem.error
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center" role="dialog">
      <div className="absolute inset-0 bg-obsidian/85 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-md bg-cave border border-smoke rounded-t-2xl md:rounded-2xl p-5"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="md:hidden flex justify-center -mt-2 mb-3">
          <div className="w-10 h-1 rounded-full bg-smoke" />
        </div>

        {success ? (
          <div className="text-center py-6">
            <div className="size-12 rounded-full bg-moss/20 mx-auto flex items-center justify-center mb-3">
              <Check className="size-5 text-moss" strokeWidth={3} />
            </div>
            <p className="text-bone font-medium">Atleta adicionado!</p>
          </div>
        ) : (
          <>
            <h3 className="text-bone font-display text-2xl tracking-wider mb-1">CÓDIGO</h3>
            <p className="text-mute text-xs mb-4">Cole o código de convite que o atleta gerou (6 letras/números).</p>

            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
              placeholder="ABC123"
              maxLength={6}
              className={cn(
                'w-full h-16 rounded-lg bg-elevated border border-smoke text-bone',
                'font-display text-3xl tracking-[0.5em] text-center placeholder:text-mute/40',
                'focus:outline-none focus:border-ember/60 transition-colors',
              )}
              autoFocus
            />

            {redeem.error ? (
              <div className="flex items-start gap-2 mt-3 rounded-md bg-blood/10 border border-blood/40 p-3">
                <AlertCircle className="size-4 text-blood shrink-0 mt-0.5" />
                <p className="text-blood text-xs">{(redeem.error as Error).message}</p>
              </div>
            ) : null}

            <div className="flex gap-2 mt-5">
              <Button variant="secondary" size="md" className="flex-1" onClick={onClose}>cancelar</Button>
              <Button
                variant="primary"
                size="md"
                className="flex-1"
                onClick={submit}
                disabled={code.length !== 6 || redeem.isPending}
              >
                {redeem.isPending ? <Loader2 className="size-4 animate-spin" /> : 'vincular'}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
