// All of the site's own JavaScript (kept small on purpose).
// Runs on every page load, including page changes made by Astro's view
// transitions. Everything works without it; this only adds motion and the
// live section highlight.
import { MOTIF, motifState } from '../lib/motif.js';

const mq = (q) => window.matchMedia(q).matches;
const reduced = () => mq('(prefers-reduced-motion: reduce)');
const clamp = (v) => Math.min(1, Math.max(0, v));

let cleanup = [];
const on = (el, ev, fn, opts) => {
  el.addEventListener(ev, fn, opts);
  cleanup.push(() => el.removeEventListener(ev, fn, opts));
};

// One scroll/resize loop for everything that follows the scroll position.
let tasks = [];
let ticking = false;
function frame() {
  ticking = false;
  for (const t of tasks) t();
}
function request() {
  if (!ticking) { ticking = true; requestAnimationFrame(frame); }
}

/* Mobile menu */
function initMenu() {
  const btn = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-menu]');
  if (!btn || !menu) return;
  const set = (open) => {
    btn.setAttribute('aria-expanded', String(open));
    menu.hidden = !open;
    document.body.classList.toggle('menu-open', open);
  };
  on(btn, 'click', () => set(menu.hidden));
  menu.querySelectorAll('[data-menu-close]').forEach((a) => on(a, 'click', () => set(false)));
  on(document, 'keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { set(false); btn.focus(); } });
  on(window, 'resize', () => { if (mq('(min-width: 1024px)')) set(false); });
}

/* Left column: highlight the section that is on screen */
function initNav() {
  const links = [...document.querySelectorAll('[data-nav-section]')];
  if (!links.length) return;
  const ids = [...new Set(links.map((l) => l.dataset.navSection))];
  const targets = ids.map((id) => document.getElementById(id)).filter(Boolean);
  if (!targets.length) return;
  let current = null;
  const update = () => {
    const line = window.innerHeight * 0.4;
    let active = targets[0];
    for (const t of targets) if (t.getBoundingClientRect().top <= line) active = t;
    const atEnd = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    if (atEnd) active = targets[targets.length - 1];
    if (active.id === current) return;
    current = active.id;
    for (const l of links) {
      const isOn = l.dataset.navSection === current;
      l.classList.toggle('is-active', isOn);
      if (isOn) l.setAttribute('aria-current', 'location');
      else l.removeAttribute('aria-current');
    }
  };
  tasks.push(update);
  update();
}

/* Sections fade in and rise as they arrive */
function initReveal() {
  const els = [...document.querySelectorAll('.reveal')];
  if (!els.length) return;
  if (reduced() || !('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    let i = 0;
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      e.target.style.setProperty('--reveal-delay', `${Math.min(i, 3) * 90}ms`);
      e.target.classList.add('is-in');
      io.unobserve(e.target);
      i++;
    }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  els.forEach((el) => io.observe(el));
  cleanup.push(() => io.disconnect());
}

/* Transition from one section to the next, linked to the scroll position.
   --in runs 0 → 1 while a section rises into view; --out runs 0 → 1 while
   it leaves at the top. The CSS turns these into opacity and movement. */
function initSections() {
  const els = [...document.querySelectorAll('.hero, .sec, .md-section')];
  if (!els.length || reduced()) return;
  els.forEach((el) => el.setAttribute('data-st', ''));
  cleanup.push(() => els.forEach((el) => {
    el.removeAttribute('data-st');
    el.style.removeProperty('--in');
    el.style.removeProperty('--out');
  }));
  const ease = (t) => 1 - Math.pow(1 - t, 3);
  const update = () => {
    const vh = window.innerHeight;
    const maxScroll = document.documentElement.scrollHeight - vh;
    for (const el of els) {
      // Measure without our own transform so the numbers stay stable.
      const r = el.getBoundingClientRect();
      const shift = parseFloat(getComputedStyle(el).transform.split(',')[5]) || 0;
      const top = r.top - shift;
      const bottom = r.bottom - shift;
      // Sections near the end of the page can't scroll far up, so they
      // finish arriving a little lower on screen.
      const topAtEnd = top + (maxScroll - window.scrollY);
      const settle = Math.max(0, Math.min(vh * 0.55, topAtEnd - 1));
      const inP = ease(clamp((vh - top) / Math.max(1, vh - settle)));
      const outP = ease(clamp((vh * 0.3 - bottom) / (vh * 0.3)));
      el.style.setProperty('--in', inP.toFixed(3));
      el.style.setProperty('--out', outP.toFixed(3));
    }
  };
  tasks.push(update);
  update();
}

/* Home hero: the five lines merge into one as the visitor scrolls */
function initMotif() {
  const svgs = [...document.querySelectorAll('[data-motif]')];
  if (!svgs.length) return;
  const parts = svgs.map((svg) => ({
    svg,
    g: MOTIF[svg.dataset.motif],
    paths: [...svg.querySelectorAll('[data-doc]')],
    labels: [...svg.querySelectorAll('[data-doc-label]')],
    lines: svg.querySelector('[data-lines]'),
    labelGroup: svg.querySelector('[data-labels]'),
    accent: svg.querySelector('[data-accent]'),
    startDot: svg.querySelector('[data-accent-start]'),
  }));
  let last = -1;
  const draw = (t) => {
    if (t === last) return;
    last = t;
    for (const p of parts) {
      const s = motifState(p.g, t);
      s.docs.forEach((d, i) => {
        p.paths[i]?.setAttribute('d', d.d);
        p.labels[i]?.setAttribute('x', String(d.x));
        p.labels[i]?.setAttribute('y', String(d.ly));
      });
      p.lines?.setAttribute('opacity', s.lineOpacity);
      p.labelGroup?.setAttribute('opacity', s.labelOpacity);
      p.accent?.setAttribute('x1', String(s.accentStart));
      p.startDot?.setAttribute('cx', String(s.accentStart));
    }
  };
  if (reduced()) { draw(1); return; }
  const update = () => {
    const vis = parts.find((p) => p.svg.getBoundingClientRect().width > 0);
    if (!vis) return;
    const top = vis.svg.getBoundingClientRect().top + window.scrollY;
    const start = Math.max(0, top - window.innerHeight * 0.75);
    const t = clamp((window.scrollY - start) / (window.innerHeight * 0.45));
    draw(Math.round(t * 100) / 100);
  };
  tasks.push(update);
  update();
}

/* Key facts count up once when they come into view */
function initCount() {
  const els = [...document.querySelectorAll('[data-count]')];
  if (!els.length || reduced() || !('IntersectionObserver' in window)) return;
  const run = (el) => {
    const end = Number(el.dataset.count);
    const t0 = performance.now();
    const step = (now) => {
      const p = clamp((now - t0) / 900);
      el.textContent = String(Math.round(end * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(step);
    };
    el.textContent = '0';
    requestAnimationFrame(step);
  };
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { run(e.target); io.unobserve(e.target); }
  }, { threshold: 0.6 });
  els.forEach((el) => io.observe(el));
  cleanup.push(() => io.disconnect());
}

/* Soft light that follows the cursor (desktop with a mouse only) */
function initGlow() {
  const glow = document.querySelector('[data-glow]');
  if (!glow || reduced() || !mq('(pointer: fine)')) return;
  let x = 0, y = 0, queued = false;
  on(window, 'pointermove', (e) => {
    x = e.clientX; y = e.clientY;
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      glow.style.setProperty('--gx', `${x}px`);
      glow.style.setProperty('--gy', `${y}px`);
    });
  }, { passive: true });
}

/* Experience timeline: detail panel, arrows, keyboard, pinning on desktop */
function initTimeline() {
  const root = document.querySelector('[data-timeline]');
  if (!root) return;
  const view = root.querySelector('[data-tl-view]');
  const cards = [...root.querySelectorAll('[data-stop]')];
  const stops = [...root.querySelectorAll('.tl-stop')];
  const panels = [...root.querySelectorAll('[data-panel]')];
  const prev = root.querySelector('[data-tl-prev]');
  const next = root.querySelector('[data-tl-next]');
  const pin = root.querySelector('[data-tl-pin]');

  const select = (id) => {
    cards.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.stop === id)));
    panels.forEach((p) => p.classList.toggle('is-active', p.dataset.panel === id));
  };
  cards.forEach((c, i) => {
    on(c, 'click', () => select(c.dataset.stop));
    on(c, 'keydown', (e) => {
      const to = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : null;
      if (to === null || !cards[to]) return;
      e.preventDefault();
      cards[to].focus();
    });
  });

  const stepPx = () => (stops[1] ? stops[1].offsetLeft - stops[0].offsetLeft : 244);
  const smooth = reduced() ? 'auto' : 'smooth';
  on(prev, 'click', () => view.scrollBy({ left: -stepPx(), behavior: smooth }));
  on(next, 'click', () => view.scrollBy({ left: stepPx(), behavior: smooth }));

  const updateUi = () => {
    const max = view.scrollWidth - view.clientWidth;
    prev.disabled = view.scrollLeft <= 1;
    next.disabled = view.scrollLeft >= max - 1;
    const reach = view.scrollLeft + view.clientWidth * 0.85;
    stops.forEach((s) => s.classList.toggle('is-reached', s.offsetLeft <= reach));
  };
  on(view, 'scroll', updateUi, { passive: true });

  // Pinning: the whole block (heading, row and details) holds still for as
  // long as it takes to pan the row. If the details are taller than the
  // screen, the block pins a little higher so the end of the text stays
  // visible; if even that would hide the row, it simply doesn't pin.
  const sticky = root.querySelector('.tl-sticky');
  const head = root.querySelector('.tl-head');
  const canPin = () => mq('(min-width: 1024px) and (prefers-reduced-motion: no-preference)');
  let pan = 0;
  let stickTop = 48;
  const measure = () => {
    pan = Math.max(0, view.scrollWidth - view.clientWidth);
    const vh = window.innerHeight;
    const h = sticky.offsetHeight;
    stickTop = Math.min(48, vh - h - 24);
    const headRoom = head.offsetHeight + 28;
    const pinned = canPin() && pan > 0 && stickTop > -headRoom;
    root.classList.toggle('is-pinned', pinned);
    root.classList.toggle('is-animated', pinned);
    root.style.setProperty('--stick-top', `${stickTop}px`);
    root.style.setProperty('--pin-h', `${h + pan}px`);
    updateUi();
  };
  const follow = () => {
    if (!root.classList.contains('is-pinned') || pan <= 0) return;
    const p = clamp((stickTop - pin.getBoundingClientRect().top) / pan);
    view.scrollLeft = p * pan;
  };
  cards.forEach((c) => on(c, 'click', () => { measure(); follow(); }));
  on(window, 'resize', measure);
  tasks.push(follow);
  measure();
  follow();
  // Text heights change once the web fonts have loaded.
  document.fonts?.ready.then(() => { measure(); follow(); });
}

function init() {
  cleanup.forEach((fn) => fn());
  cleanup = [];
  tasks = [];
  initMenu();
  initNav();
  initSections();
  initReveal();
  initMotif();
  initCount();
  initGlow();
  initTimeline();
  on(window, 'scroll', request, { passive: true });
  on(window, 'resize', request);

  // A link to a section (e.g. /experience/#skills) can land too high when
  // the timeline sets its height after loading; jump to the section again
  // once fonts and sizes have settled, unless the visitor has already moved.
  const target = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
  if (target) {
    const startY = window.scrollY;
    document.fonts?.ready.then(() => requestAnimationFrame(() => {
      if (Math.abs(window.scrollY - startY) >= 4) return;
      // Ignore the section's own transition offset when measuring.
      const shift = parseFloat(getComputedStyle(target).transform.split(',')[5]) || 0;
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - shift, behavior: 'instant' });
    }));
  }
}

document.addEventListener('astro:page-load', init);
