// "Concordance": the generative version of the "one story" drawing on the
// Home hero (see experiments/concordance/philosophy.md).
// Five deal documents start as separate bundles of strands, wander, and settle
// into one accent line. Upstream keeps moving slowly; the line never moves.
// Plain <canvas>, no library. One still frame for visitors who prefer reduced
// motion. Without JavaScript the static SVG drawing stays in place.

const DOCS = ['Scope', 'Estimate', 'Schedule', 'Roles', 'Wording'];
const SEED = 2026;

// How much the strands wander, as a fraction of the way to the point where
// they agree. The breakpoints are the real career turns between Dec 2019 and
// Feb 2026: internships end, Associate Consultant, Consultant, Solution
// Architect, governance (where the wandering stops).
const STAGES = [
  [0.0, 1.0],
  [0.203, 1.0],
  [0.284, 0.8],
  [0.54, 0.58],
  [0.945, 0.24],
  [1.0, 0.0],
];

const AGREE_AT = 0.5; // where the strands meet, as a share of the space after the labels
const FADE = 0.16; // share of the width over which the strands hand over to the orange line
const TENSION = 1.8; // higher = agreement holds back longer, then commits
const DRIFT = 0.000063; // field movement per millisecond
const FRAME_MS = 33; // about 30 frames per second is plenty for slow motion

export function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Seeded 3D gradient noise with three octaves, roughly centred on 0.
export function makeNoise(rand) {
  const perm = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [perm[i], perm[j]] = [perm[j], perm[i]];
  }
  const p = new Uint8Array(512);
  for (let i = 0; i < 512; i++) p[i] = perm[i & 255];
  const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
  const mix = (a, b, t) => a + (b - a) * t;
  const grad = (h, x, y, z) => {
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return ((h & 1) ? -u : u) + ((h & 2) ? -v : v);
  };
  const n3 = (x, y, z) => {
    let X = Math.floor(x), Y = Math.floor(y), Z = Math.floor(z);
    x -= X; y -= Y; z -= Z;
    X &= 255; Y &= 255; Z &= 255;
    const u = fade(x), v = fade(y), w = fade(z);
    const A = p[X] + Y, AA = p[A] + Z, AB = p[A + 1] + Z;
    const B = p[X + 1] + Y, BA = p[B] + Z, BB = p[B + 1] + Z;
    return mix(
      mix(mix(grad(p[AA] & 15, x, y, z), grad(p[BA] & 15, x - 1, y, z), u),
          mix(grad(p[AB] & 15, x, y - 1, z), grad(p[BB] & 15, x - 1, y - 1, z), u), v),
      mix(mix(grad(p[AA + 1] & 15, x, y, z - 1), grad(p[BA + 1] & 15, x - 1, y, z - 1), u),
          mix(grad(p[AB + 1] & 15, x, y - 1, z - 1), grad(p[BB + 1] & 15, x - 1, y - 1, z - 1), u), v),
      w,
    );
  };
  return (x, y, z) =>
    (n3(x, y, z) + 0.45 * n3(x * 2.03, y * 2.03, z * 2.03) + 0.2 * n3(x * 4.01, y * 4.01, z * 4.01)) / 1.65;
}

const smoothstep = (t) => {
  const c = Math.min(1, Math.max(0, t));
  return c * c * (3 - 2 * c);
};

function stageTurbulence(u) {
  for (let i = 1; i < STAGES.length; i++) {
    const [u0, v0] = STAGES[i - 1];
    const [u1, v1] = STAGES[i];
    if (u <= u1) return v0 + (v1 - v0) * smoothstep((u - u0) / (u1 - u0));
  }
  return 0;
}

const agreement = (u) => Math.pow(smoothstep(u), TENSION);

// "#15161A" or "#abc" → "rgba(r, g, b, a)"; anything else is returned as is.
export function withAlpha(color, a) {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(color);
  if (!m) return color;
  let hex = m[1];
  if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
  const n = parseInt(hex, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

function buildStrands(count) {
  const rand = mulberry32(SEED);
  const gauss = () => {
    let u = 0;
    while (!u) u = rand();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand());
  };
  const strands = [];
  for (let i = 0; i < count; i++) {
    const fam = i % DOCS.length;
    strands.push({
      y0: 0.5 + (fam - (DOCS.length - 1) / 2) * 0.17 + gauss() * 0.028,
      famOffset: fam * 137.31 + (rand() - 0.5) * 0.8,
      own: rand() * 1000,
      weight: 0.5 + rand() * 0.6,
      alpha: 0.7 + rand() * 0.45,
    });
  }
  return strands;
}

export function initConcordance({ reduced }) {
  const root = document.querySelector('[data-concordance]');
  const canvas = root?.querySelector('canvas');
  const ctx = canvas?.getContext('2d');
  if (!root || !ctx) return () => {};

  const noise = makeNoise(mulberry32(SEED));
  root.classList.add('is-live');

  let w = 0, h = 0, strands = [], colors = {};
  let time = 0, raf = 0, last = 0, visible = true;

  const readColors = () => {
    const cs = getComputedStyle(document.documentElement);
    colors = {
      ink: cs.getPropertyValue('--ink').trim() || '#15161A',
      soft: cs.getPropertyValue('--soft').trim() || '#5A5A5E',
      accent: cs.getPropertyValue('--accent').trim() || '#FF4D1A',
      sans: cs.getPropertyValue('--sans').trim() || 'system-ui, sans-serif',
    };
  };

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    w = rect.width;
    h = rect.height;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    strands = buildStrands(Math.round(Math.min(140, Math.max(60, w / 5))));
    draw();
  };

  function draw() {
    if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const small = w < 480;

    // Document names sit in their own column, so no line ever crosses them.
    ctx.font = `${small ? 12 : 13}px ${colors.sans}`;
    ctx.textBaseline = 'middle';
    ctx.fillStyle = colors.soft;
    let labelW = 0;
    DOCS.forEach((label, i) => {
      const y = (0.5 + (i - (DOCS.length - 1) / 2) * 0.17) * h;
      ctx.fillText(label, 0, y);
      labelW = Math.max(labelW, ctx.measureText(label).width);
    });

    const x0 = Math.ceil(labelW) + (small ? 10 : 14);
    const xEnd = w - 6;
    const xC = x0 + (xEnd - x0) * AGREE_AT;
    const fadeFrom = xC - w * FADE;
    const yT = h * 0.5;
    const top = h * 0.1, bottom = h * 0.9;
    const step = Math.max(3, w * 0.005);
    const k = 5.1 / w; // noise scale tied to width, so phones and desktops look alike

    // The strands fade out as they meet, while the orange line fades in over
    // the same stretch, so the many become the one without a dark knot.
    // They also fade in beside the labels instead of starting at a hard edge.
    const inkFade = ctx.createLinearGradient(x0, 0, xC, 0);
    const span = xC - x0;
    inkFade.addColorStop(0, withAlpha(colors.ink, 0));
    inkFade.addColorStop(Math.min(0.3, (w * 0.05) / span), withAlpha(colors.ink, 1));
    inkFade.addColorStop(Math.max(0.31, (fadeFrom - x0) / span), withAlpha(colors.ink, 1));
    inkFade.addColorStop(1, withAlpha(colors.ink, 0));

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = inkFade;
    for (const s of strands) {
      let y = s.y0 * h;
      const z = time + s.own * 0.0004;
      ctx.beginPath();
      for (let x = x0; x <= xC + 0.001; x += step) {
        const u = (x - x0) / (xC - x0);
        const turb = stageTurbulence(u) * 0.85;
        const theta = noise(x * k, y * k * 0.85 + s.famOffset, z) * Math.PI * 1.25 * turb;
        y += Math.sin(theta) * step * 1.35;
        if (y < top) y += (top - y) * 0.25;
        if (y > bottom) y -= (y - bottom) * 0.25;
        const yd = y + (yT - y) * agreement(u);
        if (x === x0) ctx.moveTo(x, yd);
        else ctx.lineTo(x, yd);
      }
      ctx.lineTo(xC, yT);
      ctx.globalAlpha = 0.13 * s.alpha;
      ctx.lineWidth = s.weight;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // The one line: still, whatever happens upstream.
    const accentIn = ctx.createLinearGradient(fadeFrom + w * FADE * 0.35, 0, xC + w * 0.02, 0);
    accentIn.addColorStop(0, withAlpha(colors.accent, 0));
    accentIn.addColorStop(1, withAlpha(colors.accent, 1));
    ctx.strokeStyle = accentIn;
    ctx.lineWidth = small ? 1.5 : 1.75;
    ctx.beginPath();
    ctx.moveTo(fadeFrom + w * FADE * 0.35, yT);
    ctx.lineTo(xEnd, yT);
    ctx.stroke();
    ctx.fillStyle = colors.accent;
    ctx.beginPath();
    ctx.arc(xEnd, yT, small ? 3.5 : 4, 0, Math.PI * 2);
    ctx.fill();
  }

  const tick = (now) => {
    raf = requestAnimationFrame(tick);
    if (!visible || now - last < FRAME_MS) return;
    const dt = last ? Math.min(100, now - last) : FRAME_MS;
    last = now;
    time += dt * DRIFT;
    draw();
  };

  readColors();
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  const scheme = window.matchMedia('(prefers-color-scheme: dark)');
  const onScheme = () => { readColors(); draw(); };
  scheme.addEventListener('change', onScheme);

  let io = null;
  if (!reduced) {
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; last = 0; });
      io.observe(canvas);
    }
    raf = requestAnimationFrame(tick);
  }

  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    io?.disconnect();
    scheme.removeEventListener('change', onScheme);
  };
}
