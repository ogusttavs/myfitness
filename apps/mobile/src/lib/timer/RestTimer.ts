/**
 * RestTimer — engine pura, sem React e sem dependências de runtime nativo.
 *
 * Garantias:
 * - Drift correction: usa o relógio absoluto (epoch ms) como fonte da verdade.
 *   setInterval só é usado para emitir ticks de UI (200ms default); a
 *   contagem em si vem sempre de `now() - resumedAt + accumulated`.
 * - Pause/Resume: acumula tempo decorrido em `accumulatedMs` e zera ao retomar.
 * - Adjust (+/-): muda `durationMs` em tempo de execução respeitando o restante.
 * - Skip / Reset / Restart: estados terminais bem definidos.
 *
 * Refs: spec.md §3 EPIC-5, complexity.json CDD-01, research.json R-01.
 */

export type TimerState = 'idle' | 'running' | 'paused' | 'finished';

export interface TimerSnapshot {
  state: TimerState;
  durationMs: number;
  remainingMs: number;
  elapsedMs: number;
  startedAtEpoch: number | null;   // first start ever (for persistence restore)
  resumedAtEpoch: number | null;   // last resume time (running only)
  accumulatedMs: number;            // time accumulated while running, until last pause
}

export interface RestTimerOptions {
  durationMs: number;
  /** UI tick frequency in ms (default 200). Não afeta precisão. */
  tickIntervalMs?: number;
  /** Injetável para testes. Default: Date.now */
  now?: () => number;
  /** Injetável para testes. Default: setInterval/clearInterval */
  scheduler?: {
    setInterval: (cb: () => void, ms: number) => unknown;
    clearInterval: (handle: unknown) => void;
  };
}

export type TimerListener = (snapshot: TimerSnapshot) => void;

const DEFAULT_TICK_MS = 200;

const defaultScheduler = {
  setInterval: (cb: () => void, ms: number) => setInterval(cb, ms),
  clearInterval: (h: unknown) => clearInterval(h as ReturnType<typeof setInterval>),
};

export class RestTimer {
  private state: TimerState = 'idle';
  private durationMs: number;
  private tickIntervalMs: number;
  private now: () => number;
  private scheduler: NonNullable<RestTimerOptions['scheduler']>;

  private startedAtEpoch: number | null = null;
  private resumedAtEpoch: number | null = null;
  private accumulatedMs = 0;

  private tickHandle: unknown = null;
  private listeners = new Set<TimerListener>();
  /** Garante que onFinish dispara só uma vez por ciclo. */
  private finishedFired = false;

  constructor(opts: RestTimerOptions) {
    if (opts.durationMs <= 0) throw new Error('durationMs must be > 0');
    this.durationMs = opts.durationMs;
    this.tickIntervalMs = opts.tickIntervalMs ?? DEFAULT_TICK_MS;
    this.now = opts.now ?? Date.now;
    this.scheduler = opts.scheduler ?? defaultScheduler;
  }

  // ─── Subscribe ──────────────────────────────────────────────────

  subscribe(listener: TimerListener): () => void {
    this.listeners.add(listener);
    listener(this.snapshot());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit(): void {
    const snap = this.snapshot();
    this.listeners.forEach((l) => l(snap));
  }

  // ─── Computed ──────────────────────────────────────────────────

  /** Tempo total decorrido, mesmo quando pausado. */
  private getElapsedMs(): number {
    if (this.state === 'running' && this.resumedAtEpoch !== null) {
      return this.accumulatedMs + (this.now() - this.resumedAtEpoch);
    }
    return this.accumulatedMs;
  }

  private getRemainingMs(): number {
    return Math.max(0, this.durationMs - this.getElapsedMs());
  }

  snapshot(): TimerSnapshot {
    return {
      state: this.state,
      durationMs: this.durationMs,
      remainingMs: this.getRemainingMs(),
      elapsedMs: this.getElapsedMs(),
      startedAtEpoch: this.startedAtEpoch,
      resumedAtEpoch: this.resumedAtEpoch,
      accumulatedMs: this.accumulatedMs,
    };
  }

  // ─── Controls ──────────────────────────────────────────────────

  start(): void {
    if (this.state === 'running') return;
    if (this.state === 'finished') {
      // restart implicit: zera contadores
      this.accumulatedMs = 0;
      this.finishedFired = false;
    }
    const t = this.now();
    if (this.startedAtEpoch === null) this.startedAtEpoch = t;
    this.resumedAtEpoch = t;
    this.state = 'running';
    this.startTicking();
    this.emit();
  }

  pause(): void {
    if (this.state !== 'running') return;
    if (this.resumedAtEpoch === null) return;
    this.accumulatedMs += this.now() - this.resumedAtEpoch;
    this.resumedAtEpoch = null;
    this.state = 'paused';
    this.stopTicking();
    this.emit();
  }

  resume(): void {
    if (this.state !== 'paused') return;
    this.resumedAtEpoch = this.now();
    this.state = 'running';
    this.startTicking();
    this.emit();
  }

  /** Soma N ms ao tempo restante (positivo ou negativo). Mínimo de 1s para não zerar do nada. */
  adjust(deltaMs: number): void {
    if (this.state === 'finished' || this.state === 'idle') return;
    const newDuration = this.durationMs + deltaMs;
    const elapsed = this.getElapsedMs();
    // não permite ficar negativo
    this.durationMs = Math.max(elapsed + 1000, newDuration);
    // se delta empurra além de zero (caso -15s), apenas reduz duração mas não dispara finish
    this.emit();
  }

  /** Pula direto para o estado finalizado. */
  skip(): void {
    if (this.state === 'idle' || this.state === 'finished') return;
    this.accumulatedMs = this.durationMs;
    this.resumedAtEpoch = null;
    this.state = 'finished';
    this.stopTicking();
    if (!this.finishedFired) {
      this.finishedFired = true;
    }
    this.emit();
  }

  /** Para e zera tudo. */
  reset(): void {
    this.stopTicking();
    this.state = 'idle';
    this.startedAtEpoch = null;
    this.resumedAtEpoch = null;
    this.accumulatedMs = 0;
    this.finishedFired = false;
    this.emit();
  }

  /** Restaura estado vindo de persistência (ex.: MMKV após app voltar do background). */
  restore(snapshot: TimerSnapshot): void {
    this.stopTicking();
    this.state = snapshot.state;
    this.durationMs = snapshot.durationMs;
    this.startedAtEpoch = snapshot.startedAtEpoch;
    this.resumedAtEpoch = snapshot.resumedAtEpoch;
    this.accumulatedMs = snapshot.accumulatedMs;
    this.finishedFired = snapshot.state === 'finished';
    if (this.state === 'running') this.startTicking();
    this.emit();
    // Se restaurou em running e o tempo já passou, finaliza imediatamente.
    this.checkFinish();
  }

  // ─── Internals ─────────────────────────────────────────────────

  private startTicking(): void {
    if (this.tickHandle !== null) return;
    this.tickHandle = this.scheduler.setInterval(() => {
      this.checkFinish();
      this.emit();
    }, this.tickIntervalMs);
  }

  private stopTicking(): void {
    if (this.tickHandle !== null) {
      this.scheduler.clearInterval(this.tickHandle);
      this.tickHandle = null;
    }
  }

  private checkFinish(): void {
    if (this.state === 'running' && this.getRemainingMs() <= 0) {
      this.accumulatedMs = this.durationMs;
      this.resumedAtEpoch = null;
      this.state = 'finished';
      this.stopTicking();
      this.finishedFired = true;
    }
  }

  /** Indica se o evento de término já foi disparado (para o consumidor agendar som/haptic apenas uma vez). */
  hasFiredFinish(): boolean {
    return this.finishedFired;
  }

  destroy(): void {
    this.stopTicking();
    this.listeners.clear();
  }
}
