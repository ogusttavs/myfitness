'use client';

import { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // log no console pra capturar via Vercel runtime logs / DevTools
    // eslint-disable-next-line no-console
    console.error('[GlobalError]', error.message, error.digest, error.stack);
  }, [error]);

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6">
      <div className="size-12 rounded-full bg-blood/20 border border-blood/40 flex items-center justify-center mb-4">
        <AlertCircle className="size-5 text-blood" />
      </div>
      <p className="text-bone font-medium text-center max-w-sm">Algo deu errado nessa tela.</p>
      <pre className="text-mute text-[10px] mt-3 max-w-sm text-center whitespace-pre-wrap break-all">
        {error.message}
        {error.digest ? `\n[id: ${error.digest}]` : ''}
      </pre>
      <button
        onClick={() => reset()}
        className="mt-6 px-6 h-12 rounded-full bg-ember text-obsidian font-display tracking-widest text-sm"
      >
        TENTAR DE NOVO
      </button>
      <a href="/" className="mt-3 text-mute text-xs uppercase tracking-widest">voltar pra Hoje</a>
    </div>
  );
}
