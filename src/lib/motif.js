// Geometry for the "one story" motif on the Home hero: five misaligned deal
// documents that bend into the point where the orange line starts. `t` runs
// from 0 (separate lines feeding into the orange line) to 1 (one straight
// line). Used both when the page is built and by the scroll script.
export const MOTIF = {
  desktop: {
    w: 680, h: 220, y: 110, x2: 360, end: 668, fontSize: 13, labelGap: 10,
    docs: [
      ['Scope', 8, 30, 200, 40],
      ['Estimate', 44, 72, 214, 66],
      ['Schedule', 0, 132, 196, 126],
      ['Roles', 26, 164, 206, 154],
      ['Wording', 60, 200, 220, 188],
    ],
  },
  mobile: {
    w: 350, h: 190, y: 95, x2: 190, end: 342, fontSize: 12, labelGap: 9,
    docs: [
      ['Scope', 4, 24, 100, 31],
      ['Estimate', 26, 62, 108, 58],
      ['Schedule', 0, 114, 98, 110],
      ['Roles', 14, 146, 104, 138],
      ['Wording', 34, 178, 112, 168],
    ],
  },
};

const r = (n) => Math.round(n * 10) / 10;
const clamp = (v) => Math.min(1, Math.max(0, v));

export function motifState(g, t) {
  const lerp = (a, b) => r(a + (b - a) * t);
  const docs = g.docs.map(([label, x0, y0, xm, ym]) => {
    const sx = lerp(x0, 0);
    const sy = lerp(y0, g.y);
    const my = lerp(ym, g.y);
    const cx = r(xm + (g.x2 - xm) / 2);
    return {
      label,
      x: sx,
      ly: r(sy - g.labelGap),
      d: `M${sx} ${sy} L${xm} ${my} C${cx} ${my} ${cx} ${g.y} ${g.x2} ${g.y}`,
    };
  });
  return {
    docs,
    lineOpacity: (0.75 * (1 - t) + 0.05).toFixed(2),
    labelOpacity: clamp((0.8 - t) / 0.3).toFixed(2),
    accentStart: lerp(g.x2, 0),
  };
}
