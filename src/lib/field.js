// Page background: faint lines that drift slowly behind every page.
// At the top of a page they are loose and tangled; as the visitor scrolls down
// they settle into parallel lines (the "one story" idea, page by page).
// They are fainter behind the text column and the left column, so reading is
// never disturbed. Still frame for visitors who prefer reduced motion.
import { makeNoise, mulberry32, withAlpha } from './concordance.js';

const SEED = 2021;
const SPACING = 26; // px between lines once they have lined up
const STEP = 8; // px between points along a line
const ALPHA = 0.15; // line strength before the text areas are calmed down
const FRAME_MS = 33; // about 30 frames per second
const DRIFT = 0.00005; // field movement per millisecond

export function initField({ reduced }) {
  const canvas = document.querySelector('[data-field]');
  const ctx = canvas?.getContext('2d');
  if (!canvas || !ctx) return () => {};

  const noise = makeNoise(mulberry32(SEED));
  let w = 0, h = 0, lanes = 0, ink = '#15161A', calm = [];
  let time = 0, raf = 0, last = 0;
  let progress = 0, target = 0;

  const readColors = () => {
    ink = getComputedStyle(document.documentElement).getPropertyValue('--ink').trim() || ink;
  };

  // Where the text sits, and how much to calm the lines there (0 to 1).
  const measureCalm = () => {
    const narrow = w < 1024;
    calm = [...document.querySelectorAll('.side, .content-inner')]
      .map((el) => {
        const r = el.getBoundingClientRect();
        return { l: r.left, r: r.right, s: el.classList.contains('side') ? 0.55 : narrow ? 0.5 : 0.65 };
      })
      .filter((c) => c.r - c.l > 1);
  };

  const readScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    target = max > 1 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
  };

  const resize = () => {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    lanes = Math.ceil(h / SPACING) + 3;
    measureCalm();
    readScroll();
    draw();
  };

  function draw() {
    if (!w) return;
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, w, h);

    // 1 = loose and tangled (top of the page), 0 = lined up (bottom).
    const loose = Math.pow(1 - progress, 1.3);
    const amp = h * 0.5 * loose + 3;
    const k = 2.2 / Math.max(w, 700);

    ctx.strokeStyle = withAlpha(ink, ALPHA);
    ctx.lineWidth = 1;
    for (let i = 0; i < lanes; i++) {
      const base = (i - 1.5) * SPACING;
      const ny = i * 0.09; // neighbouring lines move alike, so they form bundles
      ctx.beginPath();
      for (let x = -STEP; x <= w + STEP; x += STEP) {
        const y = base + noise(x * k, ny, time) * amp;
        if (x === -STEP) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Calm the lines behind text: erase part of them with soft edges.
    ctx.globalCompositeOperation = 'destination-out';
    for (const c of calm) {
      const edge = 72;
      const g = ctx.createLinearGradient(c.l - edge, 0, c.r + edge, 0);
      const span = c.r - c.l + edge * 2;
      g.addColorStop(0, 'rgba(0,0,0,0)');
      g.addColorStop(edge / span, `rgba(0,0,0,${c.s})`);
      g.addColorStop(1 - edge / span, `rgba(0,0,0,${c.s})`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(c.l - edge, 0, span, h);
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  const tick = (now) => {
    raf = requestAnimationFrame(tick);
    if (now - last < FRAME_MS) return;
    const dt = last ? Math.min(100, now - last) : FRAME_MS;
    last = now;
    time += dt * DRIFT;
    progress += (target - progress) * 0.08; // follow the scroll smoothly
    draw();
  };

  readColors();
  window.addEventListener('resize', resize);
  const scheme = window.matchMedia('(prefers-color-scheme: dark)');
  const onScheme = () => { readColors(); draw(); };
  scheme.addEventListener('change', onScheme);
  // Fonts change the text column's width slightly once loaded.
  document.fonts?.ready.then(() => { measureCalm(); draw(); });

  if (reduced) {
    progress = 0.35;
    resize();
  } else {
    window.addEventListener('scroll', readScroll, { passive: true });
    resize();
    progress = target;
    raf = requestAnimationFrame(tick);
  }

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', resize);
    window.removeEventListener('scroll', readScroll);
    scheme.removeEventListener('change', onScheme);
  };
}
