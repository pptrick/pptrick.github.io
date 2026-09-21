/**
 * Canvas drawing for the article's figures. Pure functions of (canvases,
 * parameters, labels): no DOM lookups by id, no event handling — the React
 * components in demos.tsx own the state and call these on every change.
 *
 * Colours are read from the canvas element's computed style, so the chart
 * series tokens defined on .post (and the site's own tokens) apply, and a
 * theme toggle just means "draw again".
 */

export type Ctx = { x: CanvasRenderingContext2D; w: number; h: number };

export type Palette = {
  line: string; line2: string; muted: string; fg2: string;
  surface: string; surface2: string;
  c1: string; c2: string; c3: string; c1soft: string; c2soft: string; cg: string;
  mono: string;
};

export function palette(el: Element): Palette {
  const s = getComputedStyle(el);
  const v = (n: string) => s.getPropertyValue(n).trim();
  return {
    line: v('--line'), line2: v('--line-2'), muted: v('--muted'), fg2: v('--fg-2'),
    surface: v('--surface'), surface2: v('--surface-2'),
    c1: v('--c1'), c2: v('--c2'), c3: v('--c3'), c1soft: v('--c1-soft'), c2soft: v('--c2-soft'), cg: v('--cg'),
    mono: v('--font-mono') || 'ui-monospace, monospace',
  };
}

/** Sizes the backing store to the element's CSS width at the device ratio and returns a 2D context in CSS pixels. */
export function fit(cv: HTMLCanvasElement | null, ratio: number, P: Palette): Ctx | null {
  if (!cv) return null;
  const r = cv.getBoundingClientRect();
  const w = Math.max(r.width, 180), h = w / ratio;
  const d = Math.min(window.devicePixelRatio || 1, 2);
  cv.width = Math.round(w * d); cv.height = Math.round(h * d); cv.style.height = `${h}px`;
  const x = cv.getContext('2d'); if (!x) return null;
  x.setTransform(d, 0, 0, d, 0, 0); x.clearRect(0, 0, w, h);
  x.font = `10px ${P.mono}`;
  return { x, w, h };
}

type Pt = [number, number];

function axes(x: CanvasRenderingContext2D, W: number, H: number, L: number, R: number, T: number, B: number, P: Palette) {
  x.strokeStyle = P.line2; x.lineWidth = 1; x.beginPath();
  x.moveTo(L, H - B); x.lineTo(W - R, H - B); x.moveTo(L, T); x.lineTo(L, H - B); x.stroke();
}
function poly(x: CanvasRenderingContext2D, pts: Pt[], col: string, wd: number, dash?: number[]) {
  x.save(); if (dash) x.setLineDash(dash);
  x.strokeStyle = col; x.lineWidth = wd; x.lineJoin = 'round'; x.beginPath();
  pts.forEach((p, i) => (i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])));
  x.stroke(); x.restore();
}
function vline(x: CanvasRenderingContext2D, px: number, T: number, ph: number, col: string, dash?: number[]) {
  x.save(); x.setLineDash(dash || [3, 4]); x.strokeStyle = col; x.lineWidth = 1.3;
  x.beginPath(); x.moveTo(px, T); x.lineTo(px, T + ph); x.stroke(); x.restore();
}
function ytxt(x: CanvasRenderingContext2D, s: string, L: number, y: number, P: Palette) {
  x.fillStyle = P.muted; x.textAlign = 'right'; x.fillText(s, L - 5, y);
}
function xlab(x: CanvasRenderingContext2D, s: string, cx: number, y: number, P: Palette) {
  x.fillStyle = P.muted; x.textAlign = 'center'; x.fillText(s, cx, y);
}
function dot(x: CanvasRenderingContext2D, cx: number, cy: number, r: number, col: string) {
  x.fillStyle = col; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill();
}

const LOG2PI = Math.log(2 * Math.PI);
function lnorm(v: number, m: number, s2: number) { const z = v - m; return -0.5 * z * z / s2 - 0.5 * Math.log(s2) - 0.5 * LOG2PI; }
function lse2(a: number, b: number) { const m = a > b ? a : b; return m + Math.log(Math.exp(a - m) + Math.exp(b - m)); }

/* ================= DEMO 1 : three effects ================= */

const D1 = (() => {
  const P = { muA: -0.9, muB: 2.2, sc: 0.5, wA: 0.6, wB: 0.4 }, N = 900, X0 = -5, X1 = 6, dx = (X1 - X0) / (N - 1);
  const xs = new Float64Array(N), lc = new Float64Array(N);
  for (let i = 0; i < N; i++) {
    xs[i] = X0 + i * dx;
    lc[i] = lse2(Math.log(P.wA) + lnorm(xs[i], P.muA, P.sc * P.sc), Math.log(P.wB) + lnorm(xs[i], P.muB, P.sc * P.sc));
  }
  let split = 0, best = 1e9;
  for (let i = 0; i < N; i++) if (xs[i] > P.muA && xs[i] < P.muB && lc[i] < best) { best = lc[i]; split = i; }
  return { P, N, X0, X1, dx, xs, lc, split };
})();

export type D1Canvases = { main: HTMLCanvasElement | null; a: HTMLCanvasElement | null; b: HTMLCanvasElement | null; c: HTMLCanvasElement | null };
export type D1Labels = { slope: string };

export function drawThreeEffects(cv: D1Canvases, g: number, su: number, lab: D1Labels) {
  if (!cv.main) return;
  const P = palette(cv.main);
  const { N, X0, X1, dx, xs, lc, split } = D1;
  const lu = new Float64Array(N), lr = new Float64Array(N);
  for (let i = 0; i < N; i++) { lu[i] = lnorm(xs[i], 0, su * su); lr[i] = lc[i] - lu[i]; }
  const amax = (lo: number, hi: number) => { let k = lo, b = -1e9; for (let i = lo; i <= hi; i++) if (lr[i] > b) { b = lr[i]; k = i; } return k; };
  const guided = (gg: number) => {
    const p = new Float64Array(N); let m = -1e9;
    for (let i = 0; i < N; i++) { const v = gg * lc[i] + (1 - gg) * lu[i]; p[i] = v; if (v > m) m = v; }
    let s = 0; for (let i = 0; i < N; i++) { p[i] = Math.exp(p[i] - m); s += p[i]; }
    s *= dx; for (let i = 0; i < N; i++) p[i] /= s; return p;
  };
  const stat = (p: Float64Array, lo: number, hi: number) => {
    let m0 = 0, m1 = 0, m2 = 0;
    for (let i = lo; i <= hi; i++) { const w = p[i] * dx; m0 += w; m1 += w * xs[i]; m2 += w * xs[i] * xs[i]; }
    if (m0 < 1e-12) return { m: m0, mu: NaN, v: NaN };
    const mu = m1 / m0; return { m: m0, mu, v: Math.max(m2 / m0 - mu * mu, 1e-12) };
  };
  const GN = 64, gg = new Float64Array(GN), co = new Float64Array(GN), cm = new Float64Array(GN), cvv = new Float64Array(GN);
  for (let k = 0; k < GN; k++) {
    const gk = 1.02 + (12 - 1.02) * k / (GN - 1); gg[k] = gk;
    const p = guided(gk), A = stat(p, 0, split), B = stat(p, split, N - 1);
    co[k] = Math.log(Math.max(A.m, 1e-300) / Math.max(B.m, 1e-300)); cm[k] = B.mu; cvv[k] = B.v;
  }
  const dens = (l: Float64Array) => { const p = new Float64Array(N); for (let i = 0; i < N; i++) p[i] = Math.exp(l[i]); return p; };

  const o = fit(cv.main, 2.7, P); if (!o) return;
  {
    const { x, w: W, h: H } = o; const L = 16, R = 14, T = 14, B = 26, pw = W - L - R, ph = H - T - B;
    const pc = dens(lc), pu = dens(lu), pg = guided(g);
    let ym = 0; for (let i = 0; i < N; i++) { if (pc[i] > ym) ym = pc[i]; if (pu[i] > ym) ym = pu[i]; }
    let gm = 0; for (let i = 0; i < N; i++) if (pg[i] > gm) gm = pg[i];
    ym = Math.max(ym, Math.min(gm, ym * 2.6)) * 1.14;
    const X = (v: number) => L + (v - X0) / (X1 - X0) * pw;
    const Y = (v: number) => T + ph - Math.min(v / ym, 1.02) * ph;
    x.strokeStyle = P.line; x.lineWidth = 1;
    for (let t = -4; t <= 6; t += 2) { x.beginPath(); x.moveTo(X(t), T); x.lineTo(X(t), T + ph); x.stroke(); xlab(x, String(t), X(t), T + ph + 15, P); }
    axes(x, W, H, L, R, T, B, P);
    x.save(); x.beginPath(); x.moveTo(X(X0), Y(0));
    for (let i = 0; i < N; i++) x.lineTo(X(xs[i]), Y(pg[i])); x.lineTo(X(X1), Y(0)); x.closePath();
    x.fillStyle = P.c1soft; x.fill(); x.restore();
    const pts = (p: Float64Array): Pt[] => { const a: Pt[] = []; for (let i = 0; i < N; i++) a.push([X(xs[i]), Y(p[i])]); return a; };
    poly(x, pts(pu), P.muted, 1.4, [5, 4]);
    poly(x, pts(pc), P.cg, 1.7);
    poly(x, pts(pg), P.c1, 2.4);
    [amax(0, split), amax(split, N - 1)].forEach((k) => vline(x, X(xs[k]), T, ph, P.c2));
    xlab(x, 'x', L + pw / 2, H - 6, P);
  }

  const gi = Math.max(0, Math.min(GN - 1, Math.round((g - 1.02) / (12 - 1.02) * (GN - 1))));
  const small = (c: HTMLCanvasElement | null, fn: (x: CanvasRenderingContext2D, W: number, H: number, L: number, R: number, T: number, B: number, pw: number, ph: number) => void) => {
    const oo = fit(c, 1.75, P); if (!oo) return;
    const L = 30, R = 8, T = 10, B = 22; fn(oo.x, oo.w, oo.h, L, R, T, B, oo.w - L - R, oo.h - T - B);
  };
  small(cv.a, (x, W, H, L, R, T, B, pw, ph) => {
    let lo = 1e9, hi = -1e9; for (let k = 0; k < GN; k++) { lo = Math.min(lo, co[k]); hi = Math.max(hi, co[k]); }
    const pd = (hi - lo) * .14 || 1; lo -= pd; hi += pd;
    const X = (v: number) => L + (v - 1) / 11 * pw, Y = (v: number) => T + ph - (v - lo) / (hi - lo) * ph;
    if (lo < 0 && hi > 0) { x.save(); x.setLineDash([3, 3]); x.strokeStyle = P.line; x.beginPath(); x.moveTo(L, Y(0)); x.lineTo(W - R, Y(0)); x.stroke(); x.restore(); }
    axes(x, W, H, L, R, T, B, P);
    const a: Pt[] = []; for (let k = 0; k < GN; k++) a.push([X(gg[k]), Y(co[k])]); poly(x, a, P.c1, 2);
    dot(x, X(g), Y(co[gi]), 3.2, P.c1);
    xlab(x, 'γ', L + pw / 2, H - 6, P); ytxt(x, hi.toFixed(1), L, T + 8, P); ytxt(x, lo.toFixed(1), L, T + ph, P);
  });
  small(cv.b, (x, W, H, L, R, T, B, pw, ph) => {
    const st = xs[amax(split, N - 1)]; let lo = Math.min(D1.P.muB, st), hi = Math.max(D1.P.muB, st);
    const pd = (hi - lo) * .5 + .05; lo -= pd; hi += pd;
    const X = (v: number) => L + (v - 1) / 11 * pw, Y = (v: number) => T + ph - (v - lo) / (hi - lo) * ph;
    x.save(); x.setLineDash([4, 4]); x.strokeStyle = P.c2; x.lineWidth = 1.2; x.beginPath(); x.moveTo(L, Y(st)); x.lineTo(W - R, Y(st)); x.stroke(); x.restore();
    x.fillStyle = P.c2; x.textAlign = 'right'; x.fillText('x*', W - R - 2, Y(st) - 4);
    axes(x, W, H, L, R, T, B, P);
    const a: Pt[] = []; for (let k = 0; k < GN; k++) a.push([X(gg[k]), Y(cm[k])]); poly(x, a, P.c1, 2);
    dot(x, X(g), Y(cm[gi]), 3.2, P.c1);
    xlab(x, 'γ', L + pw / 2, H - 6, P); ytxt(x, hi.toFixed(2), L, T + 8, P); ytxt(x, lo.toFixed(2), L, T + ph, P);
  });
  small(cv.c, (x, W, H, L, R, T, B, pw, ph) => {
    const xl = Math.log10(.02), xh = Math.log10(11); let lo = 1e9, hi = -1e9;
    for (let k = 0; k < GN; k++) { const lv = Math.log10(cvv[k]); lo = Math.min(lo, lv); hi = Math.max(hi, lv); }
    const pd = (hi - lo) * .15 || .3; lo -= pd; hi += pd;
    const X = (v: number) => L + (Math.log10(v) - xl) / (xh - xl) * pw;
    const Y = (v: number) => T + ph - (Math.log10(v) - lo) / (hi - lo) * ph;
    const c0 = Math.log10(cvv[GN - 1]) + Math.log10(gg[GN - 1] - 1);
    x.save(); x.setLineDash([3, 4]); x.strokeStyle = P.muted; x.lineWidth = 1.1; x.beginPath();
    x.moveTo(X(.02), Y(Math.pow(10, c0 - xl))); x.lineTo(X(11), Y(Math.pow(10, c0 - xh))); x.stroke(); x.restore();
    x.fillStyle = P.muted; x.textAlign = 'left'; x.fillText(lab.slope, L + 5, T + 9);
    axes(x, W, H, L, R, T, B, P);
    const a: Pt[] = []; for (let k = 0; k < GN; k++) a.push([X(gg[k] - 1), Y(cvv[k])]); poly(x, a, P.c1, 2);
    if (g > 1.03) dot(x, X(Math.max(g - 1, .02)), Y(cvv[gi]), 3.2, P.c1);
    xlab(x, 'γ − 1', L + pw / 2, H - 6, P);
  });
}

/* ================= DEMO 2 : blur then tilt ================= */

export type D2Canvases = { main: HTMLCanvasElement | null; a: HTMLCanvasElement | null; b: HTMLCanvasElement | null };

export function drawBlurThenTilt(cv: D2Canvases, sg: number, g: number) {
  if (!cv.main) return;
  const P = palette(cv.main);
  const m1 = 1, v1 = 1, m0 = 0, v0 = 4, X0 = -3, X1 = 6, N = 560, SM = 3, SN = 80, s2 = sg * sg;
  type G = { m: number; v: number };
  const tilt = (gg: number, ma: number, va: number, mb: number, vb: number): G => { const pr = gg / va + (1 - gg) / vb; return { m: (gg * ma / va + (1 - gg) * mb / vb) / pr, v: 1 / pr }; };
  const fam = (gg: number, ss: number) => { const T = tilt(gg, m1, v1 + ss, m0, v0 + ss), z = tilt(gg, m1, v1, m0, v0); return { T, Nn: { m: z.m, v: z.v + ss }, c: { m: m1, v: v1 + ss }, u: { m: m0, v: v0 + ss } }; };
  const pdf = (v: number, d: G) => { const z = v - d.m; return Math.exp(-.5 * z * z / d.v) / Math.sqrt(2 * Math.PI * d.v); };
  const f = fam(g, s2);

  const o = fit(cv.main, 2.7, P); if (!o) return;
  {
    const { x, w: W, h: H } = o; const L = 16, R = 14, T = 14, B = 26, pw = W - L - R, ph = H - T - B;
    let ym = 0; [f.c, f.u, f.Nn, f.T].forEach((d) => { ym = Math.max(ym, 1 / Math.sqrt(2 * Math.PI * d.v)); }); ym *= 1.12;
    const X = (v: number) => L + (v - X0) / (X1 - X0) * pw, Y = (v: number) => T + ph - Math.min(v / ym, 1.03) * ph;
    x.strokeStyle = P.line; x.lineWidth = 1;
    for (let t = -2; t <= 6; t += 2) { x.beginPath(); x.moveTo(X(t), T); x.lineTo(X(t), T + ph); x.stroke(); xlab(x, String(t), X(t), T + ph + 15, P); }
    axes(x, W, H, L, R, T, B, P);
    const pts = (d: G): Pt[] => { const a: Pt[] = []; for (let i = 0; i < N; i++) { const v = X0 + (X1 - X0) * i / (N - 1); a.push([X(v), Y(pdf(v, d))]); } return a; };
    const fill = (d: G, col: string) => { x.save(); x.beginPath(); x.moveTo(X(X0), Y(0)); pts(d).forEach((q) => x.lineTo(q[0], q[1])); x.lineTo(X(X1), Y(0)); x.closePath(); x.fillStyle = col; x.fill(); x.restore(); };
    poly(x, pts(f.u), P.muted, 1.4, [5, 4]);
    poly(x, pts(f.c), P.muted, 1.4, [1.5, 3]);
    fill(f.Nn, P.c1soft); poly(x, pts(f.Nn), P.c1, 2.3);
    fill(f.T, P.c2soft); poly(x, pts(f.T), P.c2, 2.3);
    xlab(x, 'x', L + pw / 2, H - 6, P);
  }

  const sweep = (pick: (a: ReturnType<typeof fam>) => number): Pt[] => { const a: Pt[] = []; for (let k = 0; k < SN; k++) { const s = SM * k / (SN - 1); a.push([s, pick(fam(g, s * s))]); } return a; };
  const dual = (c: HTMLCanvasElement | null, pn: (a: ReturnType<typeof fam>) => number, pt: (a: ReturnType<typeof fam>) => number, asym: number | null) => {
    const oo = fit(c, 1.75, P); if (!oo) return;
    const { x, w: W, h: H } = oo; const L = 34, R = 8, T = 10, B = 22, pw = W - L - R, ph = H - T - B;
    const A = sweep(pn), Bs = sweep(pt); let lo = 1e9, hi = -1e9;
    for (let k = 0; k < SN; k++) { lo = Math.min(lo, A[k][1], Bs[k][1]); hi = Math.max(hi, A[k][1], Bs[k][1]); }
    if (asym !== null) { lo = Math.min(lo, asym); hi = Math.max(hi, asym); }
    const pd = (hi - lo) * .14 || .2; lo -= pd; hi += pd;
    const X = (v: number) => L + v / SM * pw, Y = (v: number) => T + ph - (v - lo) / (hi - lo) * ph;
    if (asym !== null) {
      x.save(); x.setLineDash([4, 4]); x.strokeStyle = P.muted; x.lineWidth = 1; x.beginPath(); x.moveTo(L, Y(asym)); x.lineTo(W - R, Y(asym)); x.stroke(); x.restore();
      x.fillStyle = P.muted; x.textAlign = 'right'; x.fillText('γμ₁+(1−γ)μ₀', W - R - 2, Y(asym) - 4);
    }
    axes(x, W, H, L, R, T, B, P);
    poly(x, A.map((q): Pt => [X(q[0]), Y(q[1])]), P.c1, 2);
    poly(x, Bs.map((q): Pt => [X(q[0]), Y(q[1])]), P.c2, 2);
    const ki = Math.max(0, Math.min(SN - 1, Math.round(sg / SM * (SN - 1))));
    dot(x, X(sg), Y(A[ki][1]), 3.2, P.c1); dot(x, X(sg), Y(Bs[ki][1]), 3.2, P.c2);
    xlab(x, 'σ', L + pw / 2, H - 6, P); ytxt(x, hi.toFixed(2), L, T + 8, P); ytxt(x, lo.toFixed(2), L, T + ph, P);
  };
  dual(cv.a, (a) => a.Nn.m, (a) => a.T.m, g * m1 + (1 - g) * m0);
  dual(cv.b, (a) => a.Nn.v, (a) => a.T.v, null);
}

/* ================= MEASURED : share of the tower-crane mode vs γ ================= */

export function drawShareChart(cv: HTMLCanvasElement | null) {
  if (!cv) return;
  const P = palette(cv);
  const G = [1, 1.25, 1.5, 2, 3, 5, 6, 9, 15, 25];
  const A = [0.1016, 0.1328, 0.1641, 0.1797, 0.2188, 0.2656, 0.2500, 0.2734, 0.3125, 0.3047];
  const AE = [0.0267, 0.0300, 0.0327, 0.0339, 0.0365, 0.0390, 0.0383, 0.0394, 0.0410, 0.0407];
  const B = [0.0469, 0.0469, 0.0391, 0.0234, 0.0156, 0.0000, 0.0078, 0.0078, 0.0078, 0.0078];
  const BE = [0.0187, 0.0187, 0.0171, 0.0134, 0.0110, 0.0055, 0.0078, 0.0078, 0.0078, 0.0078];
  const o = fit(cv, 2.6, P); if (!o) return;
  const { x, w: W, h: H } = o; const L = 40, R = 14, T = 14, Bm = 30, pw = W - L - R, ph = H - T - Bm;
  const xh = Math.log10(25), ymax = 0.38;
  const X = (g: number) => L + Math.log10(g) / xh * pw, Y = (v: number) => T + ph - v / ymax * ph;
  x.strokeStyle = P.line; x.lineWidth = 1;
  [1, 2, 3, 5, 9, 15, 25].forEach((g) => { x.beginPath(); x.moveTo(X(g), T); x.lineTo(X(g), T + ph); x.stroke(); xlab(x, String(g), X(g), T + ph + 15, P); });
  ytxt(x, '0.4', L, T + 9, P); ytxt(x, '0.2', L, Y(0.2) + 3, P); ytxt(x, '0', L, T + ph, P);
  axes(x, W, H, L, R, T, Bm, P);
  const band = (v: number[], e: number[], col: string) => {
    x.save(); x.beginPath();
    for (let i = 0; i < G.length; i++) x.lineTo(X(G[i]), Y(Math.min(v[i] + e[i], ymax)));
    for (let j = G.length - 1; j >= 0; j--) x.lineTo(X(G[j]), Y(Math.max(v[j] - e[j], 0)));
    x.closePath(); x.fillStyle = col; x.fill(); x.restore();
  };
  const line = (v: number[], col: string) => {
    const p: Pt[] = []; for (let i = 0; i < G.length; i++) p.push([X(G[i]), Y(v[i])]);
    poly(x, p, col, 2.6); p.forEach((q) => dot(x, q[0], q[1], 3, col));
  };
  band(A, AE, P.c1soft); band(B, BE, P.c2soft); line(A, P.c1); line(B, P.c2);
  x.fillStyle = P.muted; x.textAlign = 'center'; x.fillText('guidance scale γ', L + pw / 2, H - 6);
}

/* ================= MEASURED : high-noise inflation ================= */

export type M1Labels = { y: string; x: string };

export function drawInflationChart(cv: HTMLCanvasElement | null, lab: M1Labels) {
  if (!cv) return;
  const P = palette(cv);
  const T = [1.000, 0.977, 0.923, 0.857, 0.774, 0.667, 0.600, 0.400, 0.176];
  const UN = [0.107, 0.219, 0.471, 0.625, 0.750, 0.867, 0.919, 0.975, 1.006];
  const GD = [0.637, 1.913, 1.557, 1.159, 0.971, 0.879, 0.861, 0.862, 0.860];
  const o = fit(cv, 2.6, P); if (!o) return;
  const { x, w: W, h: H } = o; const L = 58, R = 16, T0 = 16, B = 44, pw = W - L - R, ph = H - T0 - B;
  const ymax = 2.15;
  const X = (v: number) => L + v * pw, Y = (v: number) => T0 + ph - v / ymax * ph;
  x.strokeStyle = P.line; x.lineWidth = 1;
  for (let g = 0; g <= 1.001; g += 0.25) { x.beginPath(); x.moveTo(X(g), T0); x.lineTo(X(g), T0 + ph); x.stroke(); if (g > 0.001) xlab(x, g.toFixed(2), X(g), T0 + ph + 14, P); }
  x.fillStyle = P.muted; x.textAlign = 'left'; x.fillText('0', L, T0 + ph + 14);
  x.save(); x.setLineDash([3, 3]); x.strokeStyle = P.line2; x.beginPath(); x.moveTo(L, Y(1)); x.lineTo(W - R, Y(1)); x.stroke(); x.restore();
  ytxt(x, '1.0', L, Y(1) + 3, P); ytxt(x, '2.0', L, Y(2) + 3, P);
  x.save(); x.translate(11, T0 + ph / 2); x.rotate(-Math.PI / 2); x.fillStyle = P.muted; x.textAlign = 'center'; x.fillText(lab.y, 0, 0); x.restore();
  axes(x, W, H, L, R, T0, B, P);
  const pts = (a: number[]): Pt[] => T.map((t, i) => [X(t), Y(a[i])]);
  poly(x, pts(UN), P.muted, 1.6, [5, 4]);
  poly(x, pts(GD), P.c2, 2.6);
  pts(GD).forEach((q) => dot(x, q[0], q[1], 2.6, P.c2));
  x.fillStyle = P.muted; x.textAlign = 'center'; x.fillText(lab.x, L + pw / 2, H - 7);
}

/* ================= DEMO 3 : where each effect lives ================= */

export type D3Canvases = { dist: HTMLCanvasElement | null; effects: HTMLCanvasElement | null; product: HTMLCanvasElement | null };
export type D3Labels = { bands: [string, string, string] };

export function drawEffectWindows(cv: D3Canvases, sg: number, g: number, d: number, lab: D3Labels) {
  if (!cv.dist) return;
  const P = palette(cv.dist);
  const V1 = .25, V0 = 2.25, WA = .6, WB = .4, SM = 3, NS = 200, XL = -4.2, XR = 5.2, NX = 420, s2 = sg * sg;
  const ctr = (dd: number) => ({ a: -dd / 3, b: 2 * dd / 3 });
  const cond = (v: number, ss: number, dd: number) => { const m = ctr(dd), s = V1 + ss; return WA * Math.exp(-(v - m.a) * (v - m.a) / (2 * s)) / Math.sqrt(2 * Math.PI * s) + WB * Math.exp(-(v - m.b) * (v - m.b) / (2 * s)) / Math.sqrt(2 * Math.PI * s); };
  const unc = (v: number, ss: number) => { const s = V0 + ss; return Math.exp(-v * v / (2 * s)) / Math.sqrt(2 * Math.PI * s); };
  const dip = (ss: number, dd: number) => {
    const m = ctr(dd), n = 200; let lo = 1e9, lx = 0;
    for (let i = 0; i <= n; i++) { const v = m.a + (m.b - m.a) * i / n, p = cond(v, ss, dd); if (p < lo) { lo = p; lx = v; } }
    const pk = Math.min(cond(m.a, ss, dd), cond(m.b, ss, dd));
    return { x: lx, y: lo, depth: Math.max(Math.log(pk / Math.max(lo, 1e-300)), 0) };
  };
  const drive = (ss: number, dd: number) => { const m = ctr(dd), s = V1 + ss, q = Math.exp(-(dd * dd) / (2 * s)); return Math.abs(Math.log((WA + WB * q) / (WA * q + WB)) - (m.b * m.b - m.a * m.a) / (2 * (V0 + ss))); };
  const cross = (ss: number, dd: number) => Math.exp(-dip(ss, dd).depth);
  const e1 = (ss: number, dd: number) => drive(ss, dd) * cross(ss, dd);
  const e2 = (gg: number, ss: number, mu: number) => Math.abs(mu) * (gg - 1) * (V1 + ss) / (ss + gg * V0 - (gg - 1) * V1);
  const e3 = (gg: number, ss: number) => (gg - 1) * (V0 - V1) / (ss + gg * V0 - (gg - 1) * V1);
  const ser = (fn: (ss: number) => number): Pt[] => { const a: Pt[] = []; for (let k = 0; k < NS; k++) { const s = SM * k / (NS - 1); a.push([s, fn(s * s)]); } return a; };
  const nrm = (a: Pt[]) => { let m = 0; a.forEach((p) => { m = Math.max(m, p[1]); }); if (m > 0) a.forEach((p) => { p[1] /= m; }); return a; };
  const zones = (dd: number) => {
    const e = nrm(ser((ss) => e1(ss, dd))); let pk = 0, pi = 0;
    for (let i = 0; i < NS; i++) if (e[i][1] > pk) { pk = e[i][1]; pi = i; }
    const th = .2 * pk; let lo = 0, hi = SM;
    for (let i = pi; i >= 0; i--) if (e[i][1] < th) { lo = e[i][0]; break; }
    for (let i = pi; i < NS; i++) if (e[i][1] < th) { hi = e[i][0]; break; }
    return { lo, hi };
  };

  {
    const o = fit(cv.dist, 4.2, P); if (!o) return;
    const { x, w: W, h: H } = o; const L = 14, R = 14, T = 10, B = 24, pw = W - L - R, ph = H - T - B;
    const X = (v: number) => L + (v - XL) / (XR - XL) * pw;
    let ym = 0; const pc: number[] = [], pu: number[] = [];
    for (let i = 0; i < NX; i++) { const v = XL + (XR - XL) * i / (NX - 1); pc.push(cond(v, s2, d)); pu.push(unc(v, s2)); ym = Math.max(ym, pc[i], pu[i]); }
    ym *= 1.16;
    const Y = (v: number) => T + ph - v / ym * ph;
    x.strokeStyle = P.line; x.lineWidth = 1;
    for (let t = -4; t <= 5; t += 2) { x.beginPath(); x.moveTo(X(t), T); x.lineTo(X(t), T + ph); x.stroke(); xlab(x, String(t), X(t), T + ph + 14, P); }
    axes(x, W, H, L, R, T, B, P);
    const pl = (arr: number[]): Pt[] => arr.map((v, i) => [X(XL + (XR - XL) * i / (NX - 1)), Y(v)]);
    x.save(); x.beginPath(); x.moveTo(X(XL), Y(0)); pl(pc).forEach((q) => x.lineTo(q[0], q[1])); x.lineTo(X(XR), Y(0)); x.closePath(); x.fillStyle = P.c1soft; x.fill(); x.restore();
    poly(x, pl(pu), P.muted, 1.4, [5, 4]);
    poly(x, pl(pc), P.c1, 2.2);
    const dp = dip(s2, d);
    x.fillStyle = P.c2; x.beginPath(); x.arc(X(dp.x), Y(dp.y), 4, 0, 7); x.fill();
    x.strokeStyle = P.surface; x.lineWidth = 1.3; x.stroke();
  }

  {
    const o = fit(cv.effects, 3.0, P); if (!o) return;
    const { x: y, w: W, h: H } = o; const L = 16, R = 14, T = 22, B = 26, pw = W - L - R, ph = H - T - B;
    const MX = (v: number) => L + v / SM * pw, MY = (v: number) => T + ph - v * ph;
    const z = zones(d);
    const bands: [number, number, string][] = [[0, z.lo, lab.bands[0]], [z.lo, z.hi, lab.bands[1]], [z.hi, SM, lab.bands[2]]];
    const fills = [P.surface2, P.c1soft, P.surface2];
    y.font = `10px ${P.mono}`; y.textAlign = 'center';
    bands.forEach((b, k) => {
      const x0 = MX(b[0]), x1 = MX(b[1]);
      y.fillStyle = fills[k]; y.fillRect(x0, T, x1 - x0, ph);
      if (x1 - x0 > 52) { y.fillStyle = k === 1 ? P.c1 : P.muted; y.fillText(b[2], (x0 + x1) / 2, T - 8); }
    });
    y.strokeStyle = P.line; y.lineWidth = 1;
    for (let q = 0.5; q < SM; q += 0.5) { y.beginPath(); y.moveTo(MX(q), T); y.lineTo(MX(q), T + ph); y.stroke(); }
    for (let q2 = 0; q2 <= SM; q2 += 1) xlab(y, q2.toFixed(0), MX(q2), T + ph + 15, P);
    axes(y, W, H, L, R, T, B, P);
    const mp = (a: Pt[]): Pt[] => a.map((p) => [MX(p[0]), MY(p[1])]);
    poly(y, mp(nrm(ser((ss) => e1(ss, d)))), P.c1, 2.4);
    poly(y, mp(nrm(ser((ss) => e2(g, ss, 2 * d / 3)))), P.c2, 2.4);
    poly(y, mp(nrm(ser((ss) => e3(g, ss)))), P.c3, 2.4);
    vline(y, MX(sg), T, ph, P.fg2, [4, 3]);
    xlab(y, 'σ', L + pw / 2, H - 6, P);
  }

  {
    const o = fit(cv.product, 2.1, P); if (!o) return;
    const { x: z3, w: W, h: H } = o; const L = 24, R = 8, T = 10, B = 22, pw = W - L - R, ph = H - T - B;
    const AX = (v: number) => L + v / SM * pw, AY = (v: number) => T + ph - v * ph;
    for (let q3 = 0; q3 <= SM; q3 += 1) xlab(z3, q3.toFixed(0), AX(q3), T + ph + 14, P);
    axes(z3, W, H, L, R, T, B, P);
    const ap = (a: Pt[]): Pt[] => a.map((p) => [AX(p[0]), AY(p[1])]);
    const prod = ap(nrm(ser((ss) => e1(ss, d))));
    z3.save(); z3.beginPath(); z3.moveTo(AX(0), AY(0)); prod.forEach((q) => z3.lineTo(q[0], q[1])); z3.lineTo(AX(SM), AY(0)); z3.closePath(); z3.fillStyle = P.c1soft; z3.fill(); z3.restore();
    poly(z3, ap(nrm(ser((ss) => drive(ss, d)))), P.fg2, 1.5);
    poly(z3, ap(ser((ss) => cross(ss, d))), P.muted, 1.5, [5, 4]);
    poly(z3, prod, P.c1, 2.6);
    vline(z3, AX(sg), T, ph, P.fg2, [4, 3]);
    xlab(z3, 'σ', L + pw / 2, H - 6, P);
  }
}
