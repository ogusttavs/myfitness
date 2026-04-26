'use client';

import { Trophy, Timer, Dumbbell, X } from 'lucide-react';
import { Button } from '@ui/button';
import { formatDuration } from '@/stores/workoutSession';

interface SessionSummaryProps {
  open: boolean;
  totalKg: number;
  durationMs: number;
  setsCount: number;
  dayCode: string;
  onClose: () => void;
}

export function SessionSummary({ open, totalKg, durationMs, setsCount, dayCode, onClose }: SessionSummaryProps) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 bg-obsidian/85 backdrop-blur-sm flex items-end md:items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-cave border border-smoke rounded-2xl p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-mute text-xs uppercase tracking-widest">treino finalizado</span>
          <button onClick={onClose} className="text-mute hover:text-bone">
            <X className="size-4" />
          </button>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <Trophy className="size-8 text-ember" />
          <h2 className="text-bone text-3xl font-display tracking-wider">{dayCode}</h2>
        </div>

        <div className="space-y-3 mb-6">
          <Stat icon={<Timer className="size-4 text-ember" />} label="Duração" value={formatDuration(durationMs)} />
          <Stat
            icon={<Dumbbell className="size-4 text-ember" />}
            label="Volume total levantado"
            value={`${totalKg.toLocaleString('pt-BR')} kg`}
          />
          <Stat label="Séries registradas" value={`${setsCount}`} />
        </div>

        <Button variant="primary" size="md" className="w-full" onClick={onClose}>
          fechar
        </Button>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 bg-elevated rounded-lg p-3 border border-smoke">
      {icon ? <div className="size-8 rounded-md bg-cave flex items-center justify-center">{icon}</div> : null}
      <div className="flex-1 min-w-0">
        <p className="text-mute text-[10px] uppercase tracking-widest">{label}</p>
        <p className="text-bone text-lg font-display tracking-wider">{value}</p>
      </div>
    </div>
  );
}
