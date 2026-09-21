'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { Lang } from '@/lib/i18n';
import {
  drawBlurThenTilt, drawEffectWindows, drawInflationChart, drawShareChart, drawThreeEffects,
} from './charts';

/* ------------------------------------------------------------------ *
 * Redraw plumbing shared by every figure. A chart is a pure function of
 * its inputs and the current theme, so it is drawn on mount, whenever a
 * slider moves, when the window is resized, when the theme toggle flips
 * data-theme on <html>, when the OS colour scheme changes, and once the
 * web fonts have loaded (the axis labels are set in Plex Mono).
 * ------------------------------------------------------------------ */
function useRedraw(draw: () => void, deps: unknown[]) {
  useEffect(() => {
    draw();
    let t: ReturnType<typeof setTimeout> | null = null;
    const onResize = () => { if (t) clearTimeout(t); t = setTimeout(draw, 120); };
    window.addEventListener('resize', onResize);
    const mo = new MutationObserver(draw);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    media.addEventListener('change', draw);
    document.fonts?.ready.then(draw).catch(() => {});
    return () => {
      if (t) clearTimeout(t);
      window.removeEventListener('resize', onResize);
      mo.disconnect();
      media.removeEventListener('change', draw);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

function Slider({ name, value, onChange, min, max, step, note, digits = 2 }: {
  name: string; value: number; onChange: (v: number) => void;
  min: number; max: number; step: number; note: string; digits?: number;
}) {
  return (
    <div className="fc">
      <div className="fc-head"><span className="fc-name">{name}</span><span className="fc-val">{value.toFixed(digits)}</span></div>
      <input type="range" min={min} max={max} step={step} value={value}
             onChange={(e) => onChange(parseFloat(e.target.value))} aria-label={name} />
      <p className="fc-note">{note}</p>
    </div>
  );
}

function Frame({ label, title, children, caption }: { label: string; title: string; children: ReactNode; caption: ReactNode }) {
  return (
    <figure className="fig">
      <div className="fig-head"><span className="fig-label">{label}</span><span className="fig-title">{title}</span></div>
      {children}
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

const Sw = ({ color, kind }: { color?: string; kind?: 'dash' | 'dot' | 'round' }) => (
  <i className={`sw${kind ? ` ${kind}` : ''}`} style={color ? { background: color } : undefined} />
);

/* ================= Demo 1 : three effects ================= */

const L1 = {
  en: {
    label: 'Interactive', title: 'Three effects',
    g: 'guidance scale γ', gNote: '1 = no CFG. Text-to-image typically uses 5–9.',
    su: 'unconditional width σu', suNote: 'Width of the unconditional distribution. Each mode is fixed at 0.5.',
    a: 'log-odds between modes', b: 'centre of mode B', c: 'variance of mode B (log–log)', slope: 'slope −1',
    caption: <>In this example <b>mode A starts with the larger share and still loses to B</b> — B sits further from the unconditional centre, so its r is larger. The three small panels are the three effects: the log-odds is a straight line, the centre settles on x*, and the log–log slope of the variance is −1.</>,
  },
  zh: {
    label: '交互', title: '三个效应',
    g: 'guidance scale γ', gNote: '1 = 不加 CFG。文生图常用 5–9。',
    su: 'unconditional 宽度 σu', suNote: 'unconditional 分布的宽度。单个 mode 固定是 0.5。',
    a: 'mode 间对数几率', b: 'mode B 中心', c: 'mode B 方差（双对数）', slope: '斜率 −1',
    caption: <>示例里 <b>mode A 起始占比更多，却仍然被 B 反超</b>——因为 B 离 unconditional 的中心更远，r 更大。三个小图分别对应三个效应：对数几率是直线、中心停在 x*、方差的双对数斜率是 −1。</>,
  },
};

export function ThreeEffects({ lang }: { lang: Lang }) {
  const t = L1[lang];
  const [g, setG] = useState(4), [su, setSu] = useState(1.5);
  const main = useRef<HTMLCanvasElement>(null), a = useRef<HTMLCanvasElement>(null),
        b = useRef<HTMLCanvasElement>(null), c = useRef<HTMLCanvasElement>(null);
  useRedraw(() => drawThreeEffects({ main: main.current, a: a.current, b: b.current, c: c.current }, g, su, { slope: t.slope }), [g, su, lang]);
  return (
    <Frame label={t.label} title={t.title} caption={t.caption}>
      <div className="fig-ctl">
        <Slider name={t.g} value={g} onChange={setG} min={1} max={12} step={0.05} note={t.gNote} />
        <Slider name={t.su} value={su} onChange={setSu} min={0.56} max={3} step={0.01} note={t.suNote} />
      </div>
      <div className="fig-plot"><canvas ref={main} aria-label="conditional, unconditional and CFG target distributions" /></div>
      <div className="fig-legend">
        <span><Sw color="var(--cg)" />p(x|c)</span>
        <span style={{ color: 'var(--muted)' }}><Sw kind="dash" />p(x)</span>
        <span><Sw color="var(--c1)" />p_γ</span>
        <span style={{ color: 'var(--c2)' }}><Sw kind="dash" />x*</span>
      </div>
      <div className="fig-grid">
        <div><div className="gt">{t.a}</div><canvas ref={a} aria-label="log odds" /></div>
        <div><div className="gt">{t.b}</div><canvas ref={b} aria-label="mode centre" /></div>
        <div><div className="gt">{t.c}</div><canvas ref={c} aria-label="variance, log-log" /></div>
      </div>
    </Frame>
  );
}

/* ================= Measured : minority mode amplified ================= */

const L2 = {
  en: {
    label: 'Measured', title: 'A minority mode amplified threefold by CFG',
    caption: <>The y-axis is the share of samples that land in the “tower crane” category; each point is 128 seeds, the band is one standard error. <b>Look at the upper line: the condition is <code>a crane</code>, and at γ=1 the tower is the minority at 10%; as γ grows it rises to 30%.</b> If CFG were low-temperature sampling, the minority should be driven toward zero while the majority (birds) grows — the measurement shows the opposite. The tower is amplified because the unconditional branch already produces birds and other creatures readily: the tower is the reading that is only likely <em>given</em> the condition, so its <code>r</code> is larger.<br /><br />The lower line is the control: with the condition changed to <code>a crane, the long-legged wading bird</code>, the same tower mode falls from 0.047 to 0.008. The reversal shows that what gets amplified is not the tower mode as such, but whatever the condition makes <code>r</code> large for.</>,
  },
  zh: {
    label: '实测', title: '少数 mode 被 CFG 放大了三倍',
    caption: <>纵轴是落进「塔吊」那一类的样本占比，每点 128 个种子，阴影是标准误。<b>看上面那条线：条件是 <code>a crane</code>，γ=1 时塔吊只占 10%，是少数的那一类；γ 增大后升到 30%。</b>如果 CFG 是低温采样，少数 mode 应该被压向零、多数（鸟）越来越多——实测正好相反。塔吊被放大，是因为 unconditional 分支本来就常生成鸟和其他生物形态，塔吊是「只有给了条件才更可能出现」的那一类，<code>r</code> 更大。<br /><br />下面那条线是对照：把条件改成 <code>a crane, the long-legged wading bird</code>，同一个塔吊 mode 从 0.047 降到 0.008。方向反过来，说明被放大的不是「塔吊」这个 mode 本身，而是条件决定的 <code>r</code>。</>,
  },
};

export function ShareChart({ lang }: { lang: Lang }) {
  const t = L2[lang];
  const cv = useRef<HTMLCanvasElement>(null);
  useRedraw(() => drawShareChart(cv.current), [lang]);
  return (
    <Frame label={t.label} title={t.title} caption={t.caption}>
      <div className="fig-plot"><canvas ref={cv} aria-label="share of the tower-crane mode against guidance scale, two conditions" /></div>
      <div className="fig-legend">
        <span><Sw color="var(--c1)" />a crane</span>
        <span><Sw color="var(--c2)" />a crane, the long-legged wading bird</span>
      </div>
    </Frame>
  );
}

/* ================= Demo 2 : noise first, or tilt first ================= */

const L3 = {
  en: {
    label: 'Interactive', title: 'Noise first, or tilt first?',
    s: 'noise level σ', sNote: '0 = clean data, 3 ≈ pure noise. Sampling runs from right to left.',
    g: 'guidance scale γ', gNote: 'At γ=1 the two paths coincide exactly.',
    need: 'needed: tilt, then noise', give: 'CFG gives: noise, then tilt',
    a: 'means of the two paths', b: 'variances of the two paths',
    caption: <>At σ=0 the two paths coincide; from there they diverge. The grey dashed line in the left panel is <code>γμ₁+(1−γ)μ₀</code>: <b>the more noise, the closer CFG&apos;s path gets to this naive extrapolation</b>, while the mean of the needed path does not move at all. Example: p₀(·|c)=N(1,1), p₀=N(0,4).</>,
  },
  zh: {
    label: '交互', title: '先加噪，还是先 tilt',
    s: '噪声水平 σ', sNote: '0 = 干净数据，3 ≈ 纯噪声。采样从右往左走。',
    g: 'guidance scale γ', gNote: 'γ=1 时两条路完全重合，没有分歧可言。',
    need: '需要的：先 tilt 再加噪', give: 'CFG 给的：先加噪再 tilt',
    a: '两条路的均值', b: '两条路的方差',
    caption: <>σ=0 时两条路重合，之后越走越远。左图里灰色虚线是 <code>γμ₁+(1−γ)μ₀</code>：<b>噪声越大，CFG 给的那条路越靠近这个朴素外插值</b>，而需要的那条路的均值根本不动。例子：p₀(·|c)=N(1,1)，p₀=N(0,4)。</>,
  },
};

export function BlurThenTilt({ lang }: { lang: Lang }) {
  const t = L3[lang];
  const [sg, setSg] = useState(1), [g, setG] = useState(2);
  const main = useRef<HTMLCanvasElement>(null), a = useRef<HTMLCanvasElement>(null), b = useRef<HTMLCanvasElement>(null);
  useRedraw(() => drawBlurThenTilt({ main: main.current, a: a.current, b: b.current }, sg, g), [sg, g, lang]);
  return (
    <Frame label={t.label} title={t.title} caption={t.caption}>
      <div className="fig-ctl">
        <Slider name={t.s} value={sg} onChange={setSg} min={0} max={3} step={0.02} note={t.sNote} />
        <Slider name={t.g} value={g} onChange={setG} min={1} max={6} step={0.05} note={t.gNote} />
      </div>
      <div className="fig-plot"><canvas ref={main} aria-label="the two paths at the current noise level" /></div>
      <div className="fig-legend">
        <span style={{ color: 'var(--muted)' }}><Sw kind="dot" />p_t(x|c)</span>
        <span style={{ color: 'var(--muted)' }}><Sw kind="dash" />p_t(x)</span>
        <span><Sw color="var(--c1)" />{t.need}</span>
        <span><Sw color="var(--c2)" />{t.give}</span>
      </div>
      <div className="fig-grid">
        <div><div className="gt">{t.a}</div><canvas ref={a} aria-label="means" /></div>
        <div><div className="gt">{t.b}</div><canvas ref={b} aria-label="variances" /></div>
      </div>
    </Frame>
  );
}

/* ================= Demo 3 : where each effect lives ================= */

const L4 = {
  en: {
    label: 'Interactive', title: 'How the three effects vary with noise',
    s: 'noise level σ', sNote: 'Drag to watch the two peaks merge and the valley between them fill in.',
    g: 'guidance scale γ', gNote: 'γ scales the three curves but does not move them.',
    d: 'mode separation d', dNote: 'The separation sets where the middle window falls.',
    p1: 'the two distributions at this σ', p2: 'strength of each effect against σ (x-axis σ; the vertical line is the current value)',
    p3: 'why effect 1 lives only in the middle',
    valley: 'valley between modes',
    e1: 'Effect 1: reweighting between modes', e2: 'Effect 2: centres move, then stop', e3: 'Effect 3: each mode narrows',
    s1: 'modes still separable', s2: 'a sample can still switch mode', s3: 'product',
    bands: ['low noise', 'mid', 'high noise'] as [string, string, string],
    caption: <>The three effect curves are each normalised: compare their positions, not their heights. The small panel splits effect 1 into two conditions that must hold at once: <b>at high noise the modes are not separable; at low noise a sample can no longer switch mode; only in the middle are both satisfied.</b> “Can still switch” is modelled as <code>exp(−valley depth)</code>, borrowed from the Kramers escape rate — an approximation.</>,
  },
  zh: {
    label: '交互', title: '三个效应随噪声的变化',
    s: '噪声水平 σ', sNote: '拖动可以看到两个峰如何合并、中间的谷如何被填平。',
    g: 'guidance scale γ', gNote: 'γ 放大三条曲线，但不改变曲线的位置。',
    d: 'mode 间距 d', dNote: 'mode 间距决定中间那一段落在哪里。',
    p1: '当前 σ 下的两个分布', p2: '三个效应的强度随 σ 的变化（横轴 σ，竖线是当前值）',
    p3: '效应一为什么只在中间一段起作用',
    valley: 'mode 之间的谷',
    e1: '效应一：mode 之间重新分配', e2: '效应二：中心挪开然后停下', e3: '效应三：每个 mode 变窄',
    s1: 'mode 之间还分得开', s2: '样本还能换到另一个 mode', s3: '两者相乘',
    bands: ['低噪声', '中噪声', '高噪声'] as [string, string, string],
    caption: <>三条效应曲线各自归一化，比的是<b>位置</b>不是大小。小图把效应一拆成两个必须同时成立的条件：<b>噪声大时 mode 分不开，噪声小时样本无法换到另一个 mode，只有中间一段两者同时成立。</b>注：「还能换过去」用的是 <code>exp(−谷深)</code>，借自 Kramers 逃逸率，是个近似。</>,
  },
};

export function EffectWindows({ lang }: { lang: Lang }) {
  const t = L4[lang];
  const [sg, setSg] = useState(0.8), [g, setG] = useState(5), [d, setD] = useState(3);
  const dist = useRef<HTMLCanvasElement>(null), eff = useRef<HTMLCanvasElement>(null), prod = useRef<HTMLCanvasElement>(null);
  useRedraw(() => drawEffectWindows({ dist: dist.current, effects: eff.current, product: prod.current }, sg, g, d, { bands: t.bands }), [sg, g, d, lang]);
  return (
    <Frame label={t.label} title={t.title} caption={t.caption}>
      <div className="fig-ctl">
        <Slider name={t.s} value={sg} onChange={setSg} min={0.05} max={3} step={0.01} note={t.sNote} />
        <Slider name={t.g} value={g} onChange={setG} min={1.25} max={9} step={0.05} note={t.gNote} />
        <Slider name={t.d} value={d} onChange={setD} min={1.5} max={5} step={0.05} note={t.dNote} />
      </div>
      <div className="pt gt">{t.p1}</div>
      <div className="fig-plot"><canvas ref={dist} aria-label="the two distributions at the current noise level" /></div>
      <div className="fig-legend">
        <span><Sw color="var(--c1)" />p_t(x|c)</span>
        <span style={{ color: 'var(--muted)' }}><Sw kind="dash" />p_t(x)</span>
        <span style={{ color: 'var(--c2)' }}><Sw kind="round" color="var(--c2)" />{t.valley}</span>
      </div>
      <div className="pt gt">{t.p2}</div>
      <div className="fig-plot"><canvas ref={eff} aria-label="strength of the three effects against noise level" /></div>
      <div className="fig-legend">
        <span><Sw color="var(--c1)" />{t.e1}</span>
        <span><Sw color="var(--c2)" />{t.e2}</span>
        <span><Sw color="var(--c3)" />{t.e3}</span>
      </div>
      <div className="fig-grid">
        <div>
          <div className="gt">{t.p3}</div>
          <canvas ref={prod} aria-label="the two conditions and their product" />
          <div className="fig-legend" style={{ paddingLeft: 0 }}>
            <span style={{ color: 'var(--fg-2)' }}><i className="sw" style={{ background: 'var(--fg-2)', height: 1.5 }} />{t.s1}</span>
            <span style={{ color: 'var(--muted)' }}><Sw kind="dash" />{t.s2}</span>
            <span><i className="sw" style={{ background: 'var(--c1)', height: 3 }} />{t.s3}</span>
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* ================= Measured : high-noise inflation ================= */

const L5 = {
  en: {
    label: 'Measured', title: 'At high noise, CFG expands the distribution',
    with: 'with CFG (γ=6)', without: 'without CFG',
    y: 'variance of x₀ = x_t − t·v', x: 'noise level t′ (sampling runs right to left)',
    caption: <>The y-axis is the variance across seeds of <b>the model&apos;s estimate of the clean sample</b>, <code>x₀ = x_t − t·v</code>, with the no-CFG arm&apos;s final value set to 1. (Both arms share their initial noise, so <code>x_t</code> itself is identical at the first step.) <b>At <code>t′=0.977</code> the CFG arm is at 1.9×</b> — CFG is expanding here, not narrowing. The reason: at high noise the model has seen almost no signal, so every seed&apos;s <code>x₀</code> estimate under one condition is nearly the same — <b>the no-CFG arm has almost no diversity to begin with</b>. CFG multiplies the small seed-to-seed differences by <code>γ−1</code>, and at this noise level that term barely decays, so the ratio blows up.</>,
  },
  zh: {
    label: '实测', title: '高噪声处 CFG 使分布扩张',
    with: '加 CFG（γ=6）', without: '不加 CFG',
    y: 'x₀ = x_t − t·v 的方差', x: '噪声水平 t′（采样从右往左走）',
    caption: <>纵轴是<b>模型对干净样本的估计</b> <code>x₀ = x_t − t·v</code> 在种子之间的方差，以不开 CFG 那组在终点的值为 1。（两组共用初始噪声，所以量 <code>x_t</code> 本身在第一步恒等。）<b>在 <code>t′=0.977</code> 处开 CFG 那组是 1.9 倍</b>——CFG 在这里不是收窄，是扩张。扩张的原因是：高噪声处模型还没看到信号，同一个条件下每个种子的 <code>x₀</code> 估计几乎是同一个，<b>不加 CFG 那组本来就没有多样性</b>；而 CFG 把种子之间那一点微小差异乘上了 <code>γ−1</code>，在这一段又几乎不衰减，于是比值被拉大。</>,
  },
};

export function InflationChart({ lang }: { lang: Lang }) {
  const t = L5[lang];
  const cv = useRef<HTMLCanvasElement>(null);
  useRedraw(() => drawInflationChart(cv.current, { y: t.y, x: t.x }), [lang]);
  return (
    <Frame label={t.label} title={t.title} caption={t.caption}>
      <div className="fig-plot"><canvas ref={cv} aria-label="spread of the CFG and no-CFG arms against noise level" /></div>
      <div className="fig-legend">
        <span><Sw color="var(--c2)" />{t.with}</span>
        <span style={{ color: 'var(--muted)' }}><Sw kind="dash" />{t.without}</span>
      </div>
    </Frame>
  );
}
