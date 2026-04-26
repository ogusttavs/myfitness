/**
 * Celebração visual + haptic + sonora ao confirmar uma série / completar exercício.
 * Cria emojis "voadores" do ponto de origem do clique.
 *
 * Ref: REVIEW.md — UX P0 microinteração
 */

const EMOJIS = ['🔥', '💪', '⚡', '🎯', '🦁'];

export function celebrateSet(originX: number, originY: number, count = 8) {
  if (typeof window === 'undefined') return;

  // haptic (Android only no iOS Safari, mas safe call)
  navigator.vibrate?.(50);

  // beep curto pra reforçar
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 1200;
    osc.type = 'triangle';
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.18);
  } catch { /* ignore */ }

  // emojis flutuantes
  const container = document.createElement('div');
  container.style.cssText =
    'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;overflow:hidden';
  document.body.appendChild(container);

  for (let i = 0; i < count; i++) {
    const span = document.createElement('span');
    span.textContent = EMOJIS[Math.floor(Math.random() * EMOJIS.length)] ?? '🔥';
    const angle = (Math.random() - 0.5) * Math.PI * 1.2 - Math.PI / 2; // pra cima
    const distance = 80 + Math.random() * 80;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;
    span.style.cssText =
      `position:absolute;left:${originX}px;top:${originY}px;` +
      'font-size:24px;line-height:1;' +
      'transform:translate(-50%,-50%);' +
      'transition:transform 700ms cubic-bezier(0.18,0.62,0.32,1),opacity 700ms ease-out;' +
      'opacity:1;will-change:transform,opacity;';
    container.appendChild(span);

    requestAnimationFrame(() => {
      span.style.transform = `translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) scale(${0.7 + Math.random() * 0.5}) rotate(${(Math.random() - 0.5) * 60}deg)`;
      span.style.opacity = '0';
    });
  }

  setTimeout(() => container.remove(), 800);
}
