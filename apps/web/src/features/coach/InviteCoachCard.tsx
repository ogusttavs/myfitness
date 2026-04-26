'use client';

import { useState, useEffect } from 'react';
import { Copy, Check, Share2, UserPlus, Loader2 } from 'lucide-react';
import { useActiveWorkspace } from '@/lib/supabase/useWorkspace';
import { useGenerateInvite } from './queries';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/cn';

export function InviteCoachCard() {
  const { workspace } = useActiveWorkspace();
  const ws = workspace?.id ?? null;
  const generate = useGenerateInvite(ws);
  const [copied, setCopied] = useState(false);

  // pega o código atual do workspace
  const { data: current } = useQuery({
    queryKey: ['workspace:invite', ws],
    enabled: !!ws,
    queryFn: async (): Promise<{ invite_code: string | null; invite_expires_at: string | null } | null> => {
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase
        .from('workspaces')
        .select('invite_code, invite_expires_at')
        .eq('id', ws!)
        .maybeSingle();
      return data as { invite_code: string | null; invite_expires_at: string | null } | null;
    },
  });

  const code = current?.invite_code ?? null;
  const expired = current?.invite_expires_at ? new Date(current.invite_expires_at) < new Date() : false;
  const validCode = code && !expired ? code : null;

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  const copyCode = async () => {
    if (!validCode) return;
    try {
      await navigator.clipboard.writeText(validCode);
      setCopied(true);
    } catch { /* ignore */ }
  };

  const share = async () => {
    if (!validCode) return;
    const text = `Meu código de convite no Modo Caverna: ${validCode}\nAcesse https://web-xi-neon-37.vercel.app/coach pra vincular como meu coach.`;
    if (navigator.share) {
      try { await navigator.share({ text }); } catch { /* user canceled */ }
    } else {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    }
  };

  return (
    <div className="rounded-lg bg-cave border border-smoke p-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <UserPlus className="size-4 text-ember" />
        <span className="text-mute text-xs uppercase tracking-widest">convite pro coach</span>
      </div>

      {validCode ? (
        <>
          <p className="text-bone font-display text-3xl tracking-[0.4em] text-center my-3">{validCode}</p>
          <p className="text-mute text-[10px] text-center mb-4">
            válido até {new Date(current!.invite_expires_at!).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
          </p>
          <div className="flex gap-2">
            <button
              onClick={copyCode}
              className={cn(
                'flex-1 h-11 rounded-md flex items-center justify-center gap-2 text-xs uppercase tracking-widest font-medium transition-colors',
                copied ? 'bg-moss/20 text-moss' : 'bg-elevated border border-smoke text-bone hover:border-mute',
              )}
            >
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              {copied ? 'copiado' : 'copiar'}
            </button>
            <button
              onClick={share}
              className="flex-1 h-11 rounded-md bg-ember text-obsidian flex items-center justify-center gap-2 text-xs uppercase tracking-widest font-medium active:opacity-80"
            >
              <Share2 className="size-3.5" />
              compartilhar
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="text-ash text-sm">
            Gere um código de 6 caracteres e envie pro seu coach. Ele cola em <em>Coach → adicionar atleta</em> e ganha acesso ao seu plano.
          </p>
          <button
            onClick={() => generate.mutate()}
            disabled={generate.isPending}
            className="mt-3 w-full h-12 rounded-md bg-ember text-obsidian font-display tracking-widest text-sm flex items-center justify-center gap-2 active:opacity-80"
          >
            {generate.isPending ? <Loader2 className="size-4 animate-spin" /> : 'GERAR CÓDIGO'}
          </button>
        </>
      )}

      <p className="text-mute text-[10px] text-center mt-3">
        código expira em 48h e pode ser usado uma vez
      </p>
    </div>
  );
}
