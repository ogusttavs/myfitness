'use client';

import { useState } from 'react';
import { Mail, Loader2, Check, AlertCircle } from 'lucide-react';
import { Button } from '@ui/button';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { cn } from '@/lib/cn';

type Status =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'sent'; email: string }
  | { kind: 'error'; message: string };

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus({ kind: 'sending' });

    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) setStatus({ kind: 'error', message: error.message });
    else setStatus({ kind: 'sent', email: email.trim() });
  };

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <p className="text-ash text-xs uppercase tracking-widest">modo</p>
          <h1 className="text-bone text-6xl font-display tracking-wider mt-1">CAVERNA</h1>
          <div className="h-1 w-12 bg-ember rounded-full mt-3 mx-auto" />
          <p className="text-mute text-xs mt-6">Entre para começar a treinar.</p>
        </div>

        {status.kind === 'sent' ? (
          <div className="rounded-lg bg-cave border border-moss/40 p-5 text-center">
            <div className="size-12 rounded-full bg-moss/20 mx-auto flex items-center justify-center mb-3">
              <Check className="size-5 text-moss" strokeWidth={3} />
            </div>
            <p className="text-bone font-medium">Link enviado!</p>
            <p className="text-mute text-xs mt-2 leading-relaxed">
              Abra o e-mail enviado para{' '}
              <span className="text-ash font-medium">{status.email}</span>
              {' '}e clique no link mágico para entrar.
            </p>
            <button
              onClick={() => setStatus({ kind: 'idle' })}
              className="text-mute text-[10px] uppercase tracking-widest hover:text-ash mt-4 inline-block"
            >
              usar outro e-mail
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-3">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-mute" />
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status.kind === 'sending'}
                className={cn(
                  'w-full h-14 pl-10 pr-4 rounded-lg bg-cave border border-smoke text-bone placeholder:text-mute',
                  'focus:outline-none focus:border-ember/60 transition-colors',
                  'disabled:opacity-50',
                )}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={status.kind === 'sending'}
            >
              {status.kind === 'sending' ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                'enviar link'
              )}
            </Button>

            {status.kind === 'error' ? (
              <div className="flex items-start gap-2 rounded-md bg-blood/10 border border-blood/40 p-3">
                <AlertCircle className="size-4 text-blood shrink-0 mt-0.5" />
                <p className="text-blood text-xs leading-snug">{status.message}</p>
              </div>
            ) : null}

            <p className="text-mute text-[10px] text-center mt-4 leading-relaxed">
              Vamos enviar um link mágico pro seu e-mail.
              <br />
              Sem senha, sem confusão.
            </p>
          </form>
        )}
      </div>
    </main>
  );
}
