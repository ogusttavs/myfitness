'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Camera, Plus, Scale, Trash2, Loader2, Check, ImagePlus } from 'lucide-react';
import { Button } from '@ui/button';
import { useActiveWorkspace } from '@/lib/supabase/useWorkspace';
import {
  useWeightLogs,
  useAddWeight,
  usePhotos,
  useUploadPhoto,
  useDeletePhoto,
  type PhotoEntry,
} from './queries';
import { cn } from '@/lib/cn';

const dayMonth = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' });
const ANGLES = [
  { id: 'front' as const, label: 'Frente' },
  { id: 'side' as const, label: 'Lado' },
  { id: 'back' as const, label: 'Costas' },
];

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
}

export function ProgressoClient() {
  const { workspace, loading } = useActiveWorkspace();
  const ws = workspace?.id ?? null;

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="size-5 text-ember animate-spin" />
      </div>
    );
  }

  if (!ws) {
    return <p className="text-mute text-sm text-center py-8">Workspace não encontrado.</p>;
  }

  return (
    <>
      <header className="mb-5">
        <p className="text-mute text-xs uppercase tracking-widest">corpo · evolução</p>
        <h1 className="text-bone text-4xl font-display tracking-wider mt-1">PROGRESSO</h1>
      </header>

      <WeightSection workspaceId={ws} />
      <PhotosSection workspaceId={ws} />
    </>
  );
}

// ─── Pesagem ───────────────────────────────────────────

function WeightSection({ workspaceId }: { workspaceId: string }) {
  const { data: logs = [], isLoading } = useWeightLogs(workspaceId);
  const addMutation = useAddWeight(workspaceId);
  const [draft, setDraft] = useState<string>('');
  const [savedFlash, setSavedFlash] = useState(false);

  const last = logs[0];
  const previous = logs[1];
  const delta = last && previous ? last.weight_kg - previous.weight_kg : null;
  const max = Math.max(80, ...logs.map((l) => l.weight_kg + 2));
  const min = Math.min(70, ...logs.map((l) => l.weight_kg - 2));
  const range = max - min;

  const submit = async () => {
    const v = Number(draft.replace(',', '.'));
    if (!v || v <= 0 || v > 300) return;
    await addMutation.mutateAsync(v);
    setDraft('');
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1500);
  };

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-mute text-xs uppercase tracking-widest flex items-center gap-2">
          <Scale className="size-3" /> peso
        </h2>
        {savedFlash ? (
          <span className="text-moss text-[10px] uppercase tracking-widest">✓ registrado</span>
        ) : null}
      </div>

      <div className="rounded-lg bg-cave border border-smoke p-5 mb-3">
        <div className="flex items-baseline justify-between mb-1">
          <p className="text-bone font-display tracking-wider text-4xl">
            {last ? last.weight_kg.toFixed(1) : '—'}
            <span className="text-mute text-base ml-1">kg</span>
          </p>
          {delta !== null ? (
            <span
              className={cn(
                'text-xs font-medium',
                delta < 0 ? 'text-moss' : delta > 0 ? 'text-amberx' : 'text-mute',
              )}
            >
              {delta > 0 ? '+' : ''}
              {delta.toFixed(1)}kg
            </span>
          ) : null}
        </div>
        {last ? (
          <p className="text-mute text-xs">última: {dayMonth.format(new Date(last.logged_at))}</p>
        ) : (
          <p className="text-mute text-xs">nenhuma pesagem registrada ainda</p>
        )}

        {/* mini gráfico de pontos */}
        {logs.length > 1 ? (
          <div className="relative h-16 mt-4">
            <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="w-full h-full">
              <polyline
                fill="none"
                stroke="#FF6B1A"
                strokeWidth="0.6"
                strokeLinejoin="round"
                strokeLinecap="round"
                points={logs
                  .slice()
                  .reverse()
                  .map((l, i, arr) => {
                    const x = (i / Math.max(1, arr.length - 1)) * 100;
                    const y = 40 - ((l.weight_kg - min) / range) * 40;
                    return `${x.toFixed(2)},${y.toFixed(2)}`;
                  })
                  .join(' ')}
              />
            </svg>
          </div>
        ) : null}
      </div>

      {/* input rápido */}
      <div className="flex items-center gap-2 mb-3">
        <input
          type="text"
          inputMode="decimal"
          placeholder="80,5"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
          className="flex-1 h-12 px-4 rounded-md bg-elevated border border-smoke text-bone placeholder:text-mute focus:outline-none focus:border-ember/60 transition-colors"
        />
        <span className="text-mute text-sm">kg</span>
        <Button
          variant="primary"
          size="md"
          onClick={submit}
          disabled={!draft || addMutation.isPending}
        >
          {addMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : 'registrar'}
        </Button>
      </div>

      {/* histórico */}
      {!isLoading && logs.length > 0 ? (
        <details className="rounded-md bg-cave border border-smoke p-3">
          <summary className="text-mute text-xs uppercase tracking-widest cursor-pointer hover:text-ash">
            histórico ({logs.length})
          </summary>
          <ul className="mt-3 space-y-1.5">
            {logs.slice(0, 30).map((l) => (
              <li key={l.id} className="flex items-baseline justify-between text-xs">
                <span className="text-mute">{dayMonth.format(new Date(l.logged_at))}</span>
                <span className="text-bone font-medium">{l.weight_kg.toFixed(1)}kg</span>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </section>
  );
}

// ─── Fotos ──────────────────────────────────────────────

function PhotosSection({ workspaceId }: { workspaceId: string }) {
  const { data: photos = [], isLoading } = usePhotos(workspaceId);
  const [angleFilter, setAngleFilter] = useState<'all' | 'front' | 'side' | 'back'>('all');
  const [uploadAngle, setUploadAngle] = useState<'front' | 'side' | 'back' | null>(null);

  const filtered = angleFilter === 'all' ? photos : photos.filter((p) => p.angle === angleFilter);

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-mute text-xs uppercase tracking-widest flex items-center gap-2">
          <Camera className="size-3" /> fotos de progresso
        </h2>
        <span className="text-mute text-[10px]">{photos.length} foto{photos.length === 1 ? '' : 's'}</span>
      </div>

      {/* filtro */}
      <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
        <FilterChip label="todas" active={angleFilter === 'all'} onClick={() => setAngleFilter('all')} />
        {ANGLES.map((a) => (
          <FilterChip
            key={a.id}
            label={a.label}
            active={angleFilter === a.id}
            onClick={() => setAngleFilter(a.id)}
          />
        ))}
      </div>

      {/* upload por ângulo */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {ANGLES.map((a) => (
          <button
            key={a.id}
            onClick={() => setUploadAngle(a.id)}
            className="rounded-lg bg-cave border border-dashed border-smoke hover:border-ember/40 transition-colors py-4 flex flex-col items-center gap-1.5"
          >
            <ImagePlus className="size-4 text-mute" />
            <span className="text-bone text-xs font-medium">{a.label}</span>
          </button>
        ))}
      </div>

      {/* galeria */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="size-5 text-ember animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-smoke bg-cave/40 p-8 flex flex-col items-center text-center gap-3">
          <div className="size-12 rounded-full bg-elevated flex items-center justify-center">
            <Camera className="size-5 text-mute" strokeWidth={1.6} />
          </div>
          <div>
            <p className="text-bone font-medium text-sm">Sem fotos ainda</p>
            <p className="text-mute text-xs mt-1.5 max-w-xs">
              Tira a primeira foto pra começar o histórico de evolução.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {filtered.map((p) => (
            <PhotoCard key={p.id} photo={p} workspaceId={workspaceId} />
          ))}
        </div>
      )}

      {uploadAngle ? (
        <UploadSheet
          workspaceId={workspaceId}
          angle={uploadAngle}
          onClose={() => setUploadAngle(null)}
        />
      ) : null}
    </section>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'shrink-0 px-4 h-9 rounded-full text-xs uppercase tracking-widest transition-colors',
        active
          ? 'bg-ember text-obsidian font-medium'
          : 'bg-elevated border border-smoke text-mute hover:text-ash',
      )}
    >
      {label}
    </button>
  );
}

function PhotoCard({ photo, workspaceId }: { photo: PhotoEntry; workspaceId: string }) {
  const deleteMutation = useDeletePhoto(workspaceId);
  return (
    <div className="relative group rounded-lg overflow-hidden bg-elevated border border-smoke aspect-[3/4]">
      {photo.signed_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo.signed_url}
          alt={`${photo.angle} ${photo.taken_on}`}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="size-4 text-mute animate-spin" />
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-obsidian/95 via-obsidian/40 to-transparent p-2.5">
        <p className="text-bone text-xs font-medium uppercase tracking-widest">{angleLabel(photo.angle)}</p>
        <div className="flex items-baseline justify-between mt-0.5">
          <p className="text-mute text-[10px]">{dayMonth.format(new Date(photo.taken_on))}</p>
          {photo.weight_kg ? (
            <p className="text-ember text-[10px] font-medium">{photo.weight_kg.toFixed(1)}kg</p>
          ) : null}
        </div>
      </div>

      <button
        onClick={() => {
          if (confirm('Apagar essa foto?')) {
            deleteMutation.mutate({ id: photo.id, storage_path: photo.storage_path });
          }
        }}
        className="absolute top-2 right-2 size-7 rounded-full bg-obsidian/70 backdrop-blur flex items-center justify-center text-ash hover:text-blood opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="apagar foto"
      >
        <Trash2 className="size-3.5" />
      </button>
    </div>
  );
}

function angleLabel(a: 'front' | 'side' | 'back'): string {
  return a === 'front' ? 'Frente' : a === 'side' ? 'Lado' : 'Costas';
}

// ─── Upload sheet ───────────────────────────────────────

function UploadSheet({
  workspaceId,
  angle,
  onClose,
}: {
  workspaceId: string;
  angle: 'front' | 'side' | 'back';
  onClose: () => void;
}) {
  const upload = useUploadPhoto();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [date, setDate] = useState<string>(todayStr());
  const [weight, setWeight] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleFile = (f: File | null) => {
    setError(null);
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      setError('Selecione uma imagem.');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('Imagem muito grande (máx 10MB).');
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const submit = async () => {
    if (!file) return;
    try {
      await upload.mutateAsync({
        workspaceId,
        file,
        angle,
        takenOn: date,
        ...(weight ? { weightKg: Number(weight.replace(',', '.')) } : {}),
        ...(note ? { note } : {}),
      });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'erro no upload');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center" role="dialog">
      <div className="absolute inset-0 bg-obsidian/85 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-cave border border-smoke rounded-t-2xl md:rounded-2xl flex flex-col max-h-[90dvh]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="md:hidden flex justify-center pt-2.5 pb-1">
          <div className="w-10 h-1 rounded-full bg-smoke" />
        </div>
        <div className="px-5 pt-3 pb-4 border-b border-smoke flex items-center justify-between">
          <h3 className="text-mute text-xs uppercase tracking-widest">nova foto · {angleLabel(angle)}</h3>
          <button onClick={onClose} className="text-mute text-xs hover:text-bone">cancelar</button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* file picker */}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />

          {preview ? (
            <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-elevated">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="preview" className="w-full h-full object-cover" />
              <button
                onClick={() => inputRef.current?.click()}
                className="absolute bottom-3 right-3 px-3 h-9 rounded-full bg-obsidian/80 backdrop-blur text-bone text-xs"
              >
                trocar
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="w-full aspect-[3/4] rounded-lg bg-elevated border border-dashed border-smoke flex flex-col items-center justify-center gap-2 hover:border-ember/40 transition-colors"
            >
              <Camera className="size-6 text-mute" />
              <p className="text-bone text-sm">tirar / escolher foto</p>
              <p className="text-mute text-xs">tap pra abrir câmera ou galeria</p>
            </button>
          )}

          {/* metadados */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-mute text-[10px] uppercase tracking-widest">data</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 w-full h-11 px-3 rounded-md bg-elevated border border-smoke text-bone focus:outline-none focus:border-ember/60"
              />
            </div>
            <div>
              <label className="text-mute text-[10px] uppercase tracking-widest">peso (opcional)</label>
              <input
                type="text"
                inputMode="decimal"
                placeholder="80,5"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="mt-1 w-full h-11 px-3 rounded-md bg-elevated border border-smoke text-bone placeholder:text-mute focus:outline-none focus:border-ember/60"
              />
            </div>
          </div>

          <div>
            <label className="text-mute text-[10px] uppercase tracking-widest">observação (opcional)</label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="mt-1 w-full p-3 rounded-md bg-elevated border border-smoke text-bone text-sm focus:outline-none focus:border-ember/60 resize-none"
            />
          </div>

          {error ? <p className="text-blood text-xs">{error}</p> : null}
        </div>

        <div className="border-t border-smoke p-4">
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={submit}
            disabled={!file || upload.isPending}
          >
            {upload.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <>
                <Plus className="size-4 mr-2" /> salvar foto
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
