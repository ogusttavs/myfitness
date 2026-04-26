import { RestTimer, type TimerSnapshot } from './RestTimer';

/**
 * Fake clock + scheduler para testar a engine sem timers reais.
 */
function setupFakeEnv() {
  let nowMs = 1_700_000_000_000;
  const callbacks: Array<{ id: number; cb: () => void; ms: number; nextAt: number }> = [];
  let idSeq = 1;

  const advance = (ms: number) => {
    nowMs += ms;
    // dispara intervals que cabem
    let safety = 0;
    while (safety++ < 1000) {
      const due = callbacks.filter((c) => c.nextAt <= nowMs);
      if (due.length === 0) break;
      due.sort((a, b) => a.nextAt - b.nextAt);
      for (const c of due) {
        c.cb();
        c.nextAt += c.ms;
      }
    }
  };

  const scheduler = {
    setInterval: (cb: () => void, ms: number) => {
      const handle = { id: idSeq++, cb, ms, nextAt: nowMs + ms };
      callbacks.push(handle);
      return handle;
    },
    clearInterval: (handle: unknown) => {
      const idx = callbacks.findIndex((c) => c === handle);
      if (idx >= 0) callbacks.splice(idx, 1);
    },
  };

  return {
    now: () => nowMs,
    scheduler,
    advance,
  };
}

describe('RestTimer', () => {
  test('starts idle with full remaining', () => {
    const env = setupFakeEnv();
    const t = new RestTimer({ durationMs: 90_000, now: env.now, scheduler: env.scheduler });
    const s = t.snapshot();
    expect(s.state).toBe('idle');
    expect(s.remainingMs).toBe(90_000);
    expect(s.elapsedMs).toBe(0);
  });

  test('start → running → counts down', () => {
    const env = setupFakeEnv();
    const t = new RestTimer({ durationMs: 90_000, now: env.now, scheduler: env.scheduler, tickIntervalMs: 200 });
    t.start();
    env.advance(10_000);
    expect(t.snapshot().remainingMs).toBe(80_000);
    expect(t.snapshot().state).toBe('running');
  });

  test('finishes at zero and stops emitting', () => {
    const env = setupFakeEnv();
    const t = new RestTimer({ durationMs: 5_000, now: env.now, scheduler: env.scheduler });
    let lastSnap: TimerSnapshot | null = null;
    t.subscribe((s) => { lastSnap = s; });
    t.start();
    env.advance(5_000);
    expect(t.snapshot().state).toBe('finished');
    expect(t.snapshot().remainingMs).toBe(0);
    expect(t.hasFiredFinish()).toBe(true);
    expect(lastSnap?.state).toBe('finished');
  });

  test('pause stops counting; resume continues from same point', () => {
    const env = setupFakeEnv();
    const t = new RestTimer({ durationMs: 60_000, now: env.now, scheduler: env.scheduler });
    t.start();
    env.advance(10_000);
    t.pause();
    expect(t.snapshot().state).toBe('paused');
    expect(t.snapshot().remainingMs).toBe(50_000);
    env.advance(30_000); // tempo "perdido"
    expect(t.snapshot().remainingMs).toBe(50_000);
    t.resume();
    env.advance(20_000);
    expect(t.snapshot().remainingMs).toBe(30_000);
  });

  test('+15s adjust extends duration', () => {
    const env = setupFakeEnv();
    const t = new RestTimer({ durationMs: 60_000, now: env.now, scheduler: env.scheduler });
    t.start();
    env.advance(10_000);
    t.adjust(15_000);
    expect(t.snapshot().remainingMs).toBe(65_000);
    expect(t.snapshot().durationMs).toBe(75_000);
  });

  test('-15s adjust reduces remaining without going below 1s', () => {
    const env = setupFakeEnv();
    const t = new RestTimer({ durationMs: 10_000, now: env.now, scheduler: env.scheduler });
    t.start();
    env.advance(8_000);
    // restantes: 2s; -15s deveria zerar mas mantemos pelo menos 1s
    t.adjust(-15_000);
    expect(t.snapshot().remainingMs).toBe(1_000);
  });

  test('skip jumps to finished', () => {
    const env = setupFakeEnv();
    const t = new RestTimer({ durationMs: 90_000, now: env.now, scheduler: env.scheduler });
    t.start();
    env.advance(5_000);
    t.skip();
    expect(t.snapshot().state).toBe('finished');
    expect(t.snapshot().remainingMs).toBe(0);
  });

  test('reset zeroes everything', () => {
    const env = setupFakeEnv();
    const t = new RestTimer({ durationMs: 90_000, now: env.now, scheduler: env.scheduler });
    t.start();
    env.advance(20_000);
    t.reset();
    const s = t.snapshot();
    expect(s.state).toBe('idle');
    expect(s.elapsedMs).toBe(0);
    expect(s.remainingMs).toBe(90_000);
  });

  test('drift: long-running tick stays accurate vs absolute clock', () => {
    const env = setupFakeEnv();
    const t = new RestTimer({ durationMs: 60 * 60 * 1000, now: env.now, scheduler: env.scheduler, tickIntervalMs: 200 });
    t.start();
    // simula 60 minutos
    for (let i = 0; i < 60; i++) env.advance(60_000);
    const elapsed = t.snapshot().elapsedMs;
    // drift permitido: 0 (clock-based)
    expect(elapsed).toBe(60 * 60 * 1000);
  });

  test('restore from snapshot in running state finishes immediately if past duration', () => {
    const env = setupFakeEnv();
    const t = new RestTimer({ durationMs: 30_000, now: env.now, scheduler: env.scheduler });
    const startedAt = env.now();
    // Simula que app foi pra background há 60s e voltou agora
    env.advance(60_000);
    t.restore({
      state: 'running',
      durationMs: 30_000,
      remainingMs: 0,
      elapsedMs: 60_000,
      startedAtEpoch: startedAt,
      resumedAtEpoch: startedAt,
      accumulatedMs: 0,
    });
    expect(t.snapshot().state).toBe('finished');
  });

  test('subscribe receives initial snapshot', () => {
    const env = setupFakeEnv();
    const t = new RestTimer({ durationMs: 90_000, now: env.now, scheduler: env.scheduler });
    const seen: TimerSnapshot[] = [];
    t.subscribe((s) => seen.push(s));
    expect(seen).toHaveLength(1);
    expect(seen[0]?.state).toBe('idle');
  });

  test('unsubscribe stops notifications', () => {
    const env = setupFakeEnv();
    const t = new RestTimer({ durationMs: 90_000, now: env.now, scheduler: env.scheduler, tickIntervalMs: 200 });
    let count = 0;
    const unsub = t.subscribe(() => { count++; });
    t.start();
    env.advance(1_000);
    const beforeUnsub = count;
    unsub();
    env.advance(2_000);
    expect(count).toBe(beforeUnsub);
  });

  test('throws on durationMs <= 0', () => {
    expect(() => new RestTimer({ durationMs: 0 })).toThrow();
    expect(() => new RestTimer({ durationMs: -10 })).toThrow();
  });
});
