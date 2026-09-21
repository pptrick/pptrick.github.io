import { Cite, Fig } from './fig';
import { BlurThenTilt, EffectWindows, InflationChart, ShareChart, ThreeEffects } from './demos';

/**
 * The English article. Written for English readers rather than translated:
 * the argument, figures and numbers match the Chinese version exactly, the
 * sentences do not.
 */
export function ContentEn() {
  return (
    <>
<p className="lead">Classifier-free guidance (CFG)<Cite n={1} /> is simple to state. At every sampling step, run the model twice — once with the condition, once without — and combine the two outputs with a coefficient γ. A larger γ gives outputs that follow the condition more closely and, in practice, look better. This is reliable enough that almost nobody samples at γ=1.</p>

<p>The earliest explanation of <em>why</em> is that <strong>CFG lowers the sampling temperature: the distribution gets sharper and concentrates on high-probability regions.</strong> That account is everywhere, including most tutorials.</p>

<p>It is probably wrong. Over the past two years several papers have each rejected the others’ picture of CFG, and the disagreement is not about wording — it is about what CFG does to the output distribution.</p>

<p>Above all of that sits a contradiction that everyone assumes away:</p>

<p className="pull">If CFG pushes the distribution away from the real data, why is γ=5 better than γ=1?</p>

<p>This article answers in three layers.</p>

<p><strong>First, what CFG is trying to do (Section 2).</strong> Under an idealised model — CFG applied once, and the sampler returning exactly the distribution that one application defines — what happens as γ grows: which modes become more common, where each mode’s centre moves, and how much variation is left within a mode. All three have closed forms.</p>

<p><strong>Second, where reality departs from the ideal (Sections 3–4).</strong> The sampled distribution is not the idealised one, for two reasons: the tilt and the noising happen in the wrong order, and CFG is applied not once but at every step. The first reason has nothing to do with step count or with whether the sampler is deterministic — infinitely many steps would not remove it.</p>

<p><strong>Third, why quality improves anyway (Sections 5–6).</strong> Because CFG is not correcting the distribution. It is correcting the model’s error.</p>

<p>Section 1 fixes the formula and notation. The exposition uses rectified flow / flow matching; DDPM and DDIM appear only for comparison.</p>

<h2><span className="num">01</span>The formula, and the distribution behind it</h2>

<p>Start with the sampler. Rectified flow begins at pure noise and follows a trajectory to clean data: at each step the model takes the current <code>x</code> and the noise level <code>t</code> and returns a <strong>velocity</strong> — which way to move, and how far. Integrating those steps to <code>t=0</code> gives a sample.</p>

<p>Without CFG the model runs once per step: it sees the condition, returns <code>v_c</code>, and the sampler steps along <code>v_c</code>.</p>

<p>CFG changes exactly this step. <strong>The model runs twice</strong> — once with the condition, giving <code>v_c</code>, once with the condition removed, giving <code>v_u</code> — and the sampler steps along a linear combination of the two:</p>

<pre><code>step taken = v_u + γ · (v_c − v_u)</code></pre>

<p><code>γ</code> is the <code>guidance_scale</code> of every pipeline. At γ=1 the right-hand side collapses to <code>v_c</code> and CFG is off; at γ&gt;1 the sampler <strong>continues a little further along the difference the condition made</strong>.</p>

<p className="note">DDPM and DDIM predict noise <code>ε</code> rather than velocity, but the CFG formula is identical with <code>ε</code> in place of <code>v</code>. Everything below holds in both parameterisations; the reason is in the collapsible box.</p>

<h3>What this step does to the distribution</h3>

<p>Velocity and score (<code>∇log p</code>) determine each other — given one you can compute the other. So <strong>a linear combination of two velocities is a linear combination of two scores</strong>:</p>

<pre><code>(1−γ) · ∇log p(x)  +  γ · ∇log p(x|c)</code></pre>

<p>and that is the gradient of <code>log[ p(x|c)^γ · p(x)^(1−γ) ]</code>. Each CFG step follows the score of <strong>that</strong> distribution. Rearranged:</p>

<pre><code>p_γ(x|c)  ∝  p(x|c) · r(x)^(γ−1)

where  r(x) = p(x|c) / p(x)</code></pre>

<p>So at the level of distributions, γ <strong>reweights <code>p(x|c)</code> by <code>r</code></strong>: regions where <code>r</code> is large are amplified, regions where <code>r</code> is small are suppressed, and γ sets how hard.</p>

<p>Multiplying a distribution by a weight function and renormalising has a name: a <strong>tilt</strong>. Throughout, “tilt” means this operation — <strong>CFG is a tilt of <code>p(x|c)</code> with weight <code>r^(γ−1)</code></strong>.</p>

<p>Three terms recur below; definitions first:</p>

<table>
<tbody>
<tr><th>term</th><th>meaning</th></tr>
<tr><td>density</td><td>The relative likelihood of one specific output. Where <code>p(x|c)</code> is high, samples land more often.</td></tr>
<tr><td>share</td><td>After many samples, the fraction that fall into one category of outputs. The share is the density integrated over that category, and it is the quantity an experiment can actually count.</td></tr>
<tr><td>r</td><td>The density of one output under <code>p(x|c)</code>, divided by its density under <code>p(x)</code>.</td></tr>
</tbody>
</table>

<p><code>r</code> is the most important quantity in this article and deserves a moment. It measures <strong>how much an output owes its existence to the condition</strong>:</p>

<ul>
<li><code>r</code> large — this kind of output essentially only appears when the condition is given</li>
<li><code>r</code> near 1 — it appears just as readily without the condition, so it says little about the condition</li>
</ul>

<p>Equivalently, <code>r</code> is proportional to the probability that the condition was <code>c</code> given this output — the classifier implicit in the model. CFG never trains a classifier, but it steers by this ratio at every step.</p>

<details>
<summary>Derivation: Bayes, twice</summary>
<div className="det-body">
<p>Classifier guidance multiplies the classifier term by γ: the score becomes <code>∇log p(x) + γ∇log p(c|x)</code>. Scaling a log-gradient by γ raises the term to the power γ, so this is the score of <code>p(x)·p(c|x)^γ</code>.</p>
<p>Bayes removes the classifier: <code>∇log p(c|x) = ∇log p(x|c) − ∇log p(x)</code>. Substituting gives <code>(1−γ)∇log p(x) + γ∇log p(x|c)</code> — the CFG combination — whose distribution <code>p(x|c)^γ p(x)^(1−γ)</code> rearranges to the form above.</p>
<p>Flow-matching conversion: <code>∇log p_t(x) = −[x + (1−t)v(x,t)]/t</code>, hence <code>∇log r = −((1−t)/t)(v_c − v_u)</code>. The coefficient is positive and independent of <code>x</code>, so every statement below about sign, zeros and monotonicity holds identically in the <code>v</code> and <code>ε</code> parameterisations.</p>
</div>
</details>

<h3>Notation</h3>

<table className="sym">
<tbody>
<tr><th>symbol</th><th>meaning</th><th>typical values</th></tr>
<tr><td>x</td><td>a data point (the model’s latent)</td><td>—</td></tr>
<tr><td>c</td><td>the condition</td><td>—</td></tr>
<tr><td>t</td><td>noise level</td><td>0 = clean, 1 = pure noise</td></tr>
<tr><td>γ</td><td>guidance scale</td><td>1 = no CFG; 5–9 in text-to-image; 100 in SDS</td></tr>
<tr><td>v_c, v_u</td><td>output of the conditional / unconditional branch</td><td>—</td></tr>
<tr><td>Δ</td><td>v_c − v_u, the direction CFG pushes</td><td>—</td></tr>
<tr><td>r</td><td>conditional density / unconditional density</td><td>—</td></tr>
<tr><td>x*</td><td>the point where Δ = 0: both branches make the same prediction</td><td>—</td></tr>
</tbody>
</table>

<h2><span className="num">02</span>The single-step ideal: what CFG is trying to do</h2>

<p>This section works with an <strong>idealised model</strong> that assumes two things:</p>

<ol>
<li>CFG is applied <strong>once</strong>, to the distribution of clean data</li>
<li><strong>The sample is drawn from</strong> the <code>p_γ</code> that one application defines</li>
</ol>

<p>Neither holds in real sampling; the next two sections take them in turn. The ideal is still worth working through: <strong>the three conclusions below survive real sampling in direction, though not in magnitude</strong> — and without the ideal there would be nothing specific to measure.</p>

<p>Under the ideal, raising γ does three things:</p>

<table>
<tbody>
<tr><th /><th>what happens</th><th>form</th></tr>
<tr><td>Effect 1: modes are reweighted</td><td>some modes are amplified and others suppressed, exponentially</td><td>share ratio ∝ <code>(r_A/r_B)^(γ−1)</code></td></tr>
<tr><td>Effect 2: centres move, then stop</td><td>each mode’s centre leaves its original position but stops at a fixed point</td><td>stops at <code>x*</code></td></tr>
<tr><td>Effect 3: each mode narrows</td><td>samples within one mode become more alike</td><td>variance ∝ <code>1/(γ−1)</code></td></tr>
</tbody>
</table>

<ThreeEffects lang="en" />

<h3 className="eff"><span className="k">Effect 1</span>Modes are reweighted by r</h3>

<p>Why this holds: <code>p_γ</code> is <code>p(x|c)</code> times <code>r^(γ−1)</code>. A single mode is narrow, so <code>r</code> is approximately a constant <code>r_j</code> across it, and the mode’s share is simply <strong>its original share times <code>r_j^(γ−1)</code></strong>:</p>

<pre><code>share_j  ≈  w_j · r_j^(γ−1)        w_j = share of mode j under p(x|c)

share_A / share_B  =  (w_A / w_B) · (r_A / r_B)^(γ−1)</code></pre>

<p>γ sits in the exponent, so the gap opens exponentially. <strong>But the point is not the exponent. It is that the quantity being amplified is the ratio of <code>r</code>, not the ratio of densities.</strong> In the figure, mode A starts at share 0.6 and B at 0.4 — but A sits at the centre of the unconditional distribution (dashed) and B in its tail, so <code>r_B &gt; r_A</code>. Raise γ to 4 and <strong>the taller peak sinks while the shorter one rises</strong>, crossing at γ≈1.8.</p>

<p className="pull">CFG does not pick the most probable mode. It picks the mode that is best explained only by the condition.</p>

<Fig label="Measured" title="Same seed: the bird becomes a crane as γ grows" src="/images/blog/cfg/fig-crane-gamma.png" alt="Four seeds at four guidance scales for the prompt a crane" width={875} height={875}
  axis={['γ = 1', 'γ = 2', 'γ = 6', 'γ = 25']}
  caption={<>The condition is <code>a crane</code>; rows are seeds, columns are γ, and within a row only γ changes. <b>At γ=1 the column is creatures with legs and bodies; by γ=6 every one is a tower crane.</b> The English word names both the machine and the bird, and without CFG the model produces both; as γ grows, the bird reading disappears.<br /><br />The seeds were not hand-picked: the 16 seeds were scored on the mode axis at γ=1 and the four most creature-like were taken.</>} />

<ShareChart lang="en" />

<h3>Why a popular account fails: CFG is not low-temperature sampling</h3>

<p>Low-temperature sampling draws from <code>p(x|c)^γ</code> — the numerator alone — and its share ratio is <code>(w_A/w_B)^γ</code>, which <strong>can only make the larger mode larger</strong>. CFG carries the denominator <code>p(x)^(1−γ)</code>, which penalises precisely the outputs that are common without the condition. On the figure’s example:</p>

<pre><code>low temperature:  A keeps winning     (0.6/0.4)^γ grows monotonically
CFG:              B overtakes         reversal beyond γ≈1.8</code></pre>

<p><strong>Same distribution, same γ, and the two operations push samples toward opposite modes.</strong> “CFG is roughly a temperature” is therefore not imprecise but wrong: on the question of which mode wins, the sign is reversed.</p>

<h3 className="eff"><span className="k">Effect 2</span>Each mode’s centre moves, then stops</h3>

<p>Within a mode, the centre moves <em>away from the unconditional distribution</em> — but not indefinitely. Give the difference inside the CFG bracket a name:</p>

<pre><code>Δ  =  v_c − v_u        CFG is: start from v_u, then go γ times further along Δ</code></pre>

<p className="pull">x* is where Δ = 0 — the point at which both branches make the same prediction.</p>

<p><code>Δ</code> is proportional to <code>∇log r</code> (the conversion is in the box above), and <code>x*</code> is the maximum of <code>r</code>, where the gradient vanishes — so <code>Δ</code> vanishes there too, CFG switches itself off, and samples are attracted to the point. The second small panel plots mode B’s centre against γ: <strong>a fast rise, then a plateau on x*</strong>, with almost no movement between γ=5 and γ=12.</p>

<p>Note the counter-intuitive consequence: <strong>the larger γ, the closer samples sit to the point where CFG itself disappears.</strong> Section 4 will show that no such point exists in the model we measured.</p>

<h3 className="eff"><span className="k">Effect 3</span>Each mode narrows, at rate 1/(γ−1)</h3>

<p>The variance within a mode falls as <code>1/(γ−1)</code>. The standard deviation therefore falls as <code>1/√(γ−1)</code>, more slowly than the centre settles — so beyond a certain γ, <strong>the samples stop changing and only become more alike.</strong></p>

<details>
<summary>Derivation: why 1/(γ−1)</summary>
<div className="det-body">
<p>Write <code>β = γ−1</code>. The target is <code>p(x|c)·r^β</code>; take logs and expand about <code>x*</code>. The first-order term of <code>log r</code> vanishes (it is an extremum) and the second-order term carries β, so β sets the curvature. Completing the square gives a Gaussian with covariance <code>H⁻¹/β</code>, where <code>H = −∇²log r(x*)</code>. Hence the variance is proportional to <code>1/(γ−1)</code>, and the mean approaches <code>x*</code> at the same rate.</p>
<p>Checked numerically on the one-dimensional Gaussian example: at γ=100 the exact variance is 0.01329 and the approximation gives 0.01347.</p>
</div>
</details>

<Fig label="Measured" title="The shell where seeds disagree thins as γ grows" src="/images/blog/cfg/fig-shell.png" alt="Vertical slices at four guidance scales: the core that 128 seeds agree on, and the shell where they disagree" width={1536} height={384}
  axis={['γ = 1', 'γ = 2', 'γ = 6', 'γ = 25']}
  caption={<>One image condition, 128 seeds, a vertical slice. <b>Cream</b> is the region more than 90% of seeds agree is solid; <b>red</b> is the shell where seeds disagree. At γ=1 the whole column is wrapped in red and the animal on top has no clear outline; at γ=25 only a thin red line remains. The shell’s share of the total: 58% → 27% → 16% → 13%. But this is far slower than <code>1/(γ−1)</code>: <code>γ−1</code> spans a factor of 96 and the variance only falls to 30–61%. Section 4 explains why.</>} />

<p>Drag the second slider, σu, until the unconditional distribution is as wide as a single mode (0.5): <strong>the narrowing vanishes</strong>. In other words:</p>

<p className="pull">Whether a mode narrows depends on <strong>how narrow the mode is</strong> relative to <strong>how wide the unconditional distribution is</strong> — the larger the gap, the stronger the narrowing. γ is only an amplifier: when the two are equally wide, any γ merely moves the mode without shrinking it.</p>

<p>That premise does not always hold in a real model: <strong>half of the directions violate it.</strong> Take the latent distribution under one condition, run PCA, keep the twelve leading directions, and compare conditional and unconditional widths direction by direction:</p>

<table>
<tbody>
<tr><th>direction</th><th>width at γ=25, relative to γ=1</th></tr>
<tr><td>six directions where the conditional was narrower</td><td>0.21–0.45 (narrowing, as effect 3 predicts)</td></tr>
<tr><td>six directions where the conditional was wider</td><td><strong>expansion</strong>, peaking at 1.95× at γ=3 in the widest direction</td></tr>
</tbody>
</table>

<p>And the expansion peaks at <strong>γ=2–5</strong> — the range people actually use. So:</p>

<p className="pull">CFG is not an isotropic contraction. It compresses the directions in which the conditional was already narrower and <strong>expands</strong> the ones in which it was wider. A scalar variance sums the two, shows a net contraction, and hides the fact that the two families of directions move in opposite senses.</p>

<h3>Where samples concentrate as γ → ∞</h3>

<p><code>r^(γ−1)</code> is an exponential amplifier: in the limit, all of the mass collapses onto the point where <code>r</code> is largest — <strong>not the point where <code>p(x|c)</code> is largest</strong>.</p>

<p className="pull">The limit is “the c that is most distinguishable from unconditional”, not “the most typical c”. At moderate γ the two barely differ; at large γ they separate quickly.</p>

<h2><span className="num">03</span>Where the gap between ideal and real comes from</h2>

<p>The sampled distribution does not match the ideal <code>p_γ</code>, and the reason is specific: <strong>the tilt and the noising happen in the wrong order.</strong></p>

<p>In the ideal model, the tilt acts on the <strong>clean-data</strong> distribution and produces <code>p_γ</code>. For the sampler to actually end at <code>p_γ</code>, what it sees at every step must be <code>p_γ</code> after noising — <strong>tilt first, then noise</strong>.</p>

<p>But what the model learned is <code>p_t(x|c)</code> and <code>p_t(x)</code>: clean data <strong>noised directly</strong>, with no tilt in between. CFG can only tilt those two already-noised distributions — <strong>noise first, then tilt</strong>.</p>

<pre><code>needed:     clean data ──tilt──▶ p_γ ──noise──▶ what the sampler sees
CFG gives:  clean data ──noise──▶ two distributions ──tilt──▶ what the sampler sees</code></pre>

<p><strong>The two operations do not commute.</strong> Only with no noise at all do the two paths agree. <code>p_γ</code> is defined at zero noise, so <code>p_γ</code> itself is not miscalculated; the sampler simply follows the other path and lands somewhere else. <strong>This is not a precision issue</strong> — with infinitely many steps, a perfectly trained model and a deterministic sampler, the path is still the other one, and the result is still not <code>p_γ</code>.</p>

<BlurThenTilt lang="en" />

<h2><span className="num">04</span>Many steps: how the three effects change</h2>

<p>The ideal applies CFG once. Real sampling applies it at every one of several dozen steps, <strong>each at a different noise level</strong>. The same tilt does different things at different noise levels.</p>

<h3>Prediction: each effect has its own noise window</h3>

<p>One quantity governs all three effects: <strong>how narrow a conditional mode is against how wide the unconditional distribution is.</strong> Noise widens both, so the gap changes with the noise level — and each effect gets its own active window.</p>

<table>
<tbody>
<tr><th /><th>high noise<br />start of sampling</th><th>mid</th><th>low noise<br />end of sampling</th></tr>
<tr><td>Effect 1: modes reweighted</td>
    <td>modes still merged; nothing to amplify or suppress</td>
    <td><strong>active</strong></td>
    <td>already decided; cannot change</td></tr>
<tr><td>Effect 2: centres move, then stop</td>
    <td>keeps moving outward</td>
    <td>displacement starts to converge</td>
    <td>already resting on <code>x*</code></td></tr>
<tr><td>Effect 3: each mode narrows</td>
    <td>almost none — noise has flattened both widths</td>
    <td>starts to appear</td>
    <td><strong>strongest</strong></td></tr>
</tbody>
</table>

<EffectWindows lang="en" />

<h3>Measured: one prediction out of three holds</h3>

<p>Every measurement is on our own 3D rectified-flow model. The CFG and no-CFG arms use <strong>the same seeds and the same initial noise</strong>, and the two arms’ estimates of the clean sample are compared step by step. <code>t′</code> is the noise level the model actually receives, 1 being pure noise; sampling runs from right to left over 45 steps.</p>

<table className="verdict">
<tbody>
<tr><th>effect</th><th>predicted</th><th>measured</th></tr>
<tr><td>Effect 1</td><td>strongest mid-way</td>
    <td><strong>Wrong.</strong> Finished within the high-noise band</td></tr>
<tr><td>Effect 2</td><td>strongest at high noise</td>
    <td><strong>Right.</strong> Displacement peaks at the highest noise, then decays monotonically to one seventh</td></tr>
<tr><td>Effect 3</td><td>strongest at low noise</td>
    <td><strong>Needs correction.</strong> At high noise CFG first <em>expands</em> the distribution; net narrowing appears only at low noise, where effect 3 is the only effect still active</td></tr>
</tbody>
</table>

<h3>Effect 1 | Reweighting between modes: finished in the high-noise band</h3>

<p>At every step, both arms are projected onto a mode axis and the mass on each mode is read off. The fit allows the whole cloud to translate along the axis, so what is read is mass genuinely moving from one mode to the other, not an artefact of translation.</p>

<table>
<tbody>
<tr><th>noise level <code>t′</code></th><th>0.992<br />step 1</th><th>0.881</th><th>0.832</th><th>0.706</th></tr>
<tr><td>fraction of the between-arm weight gap completed</td><td><strong>61%</strong></td><td>87%</td><td>98%</td><td>100%</td></tr>
</tbody>
</table>

<p>The second row is how much of the eventual difference in mode weight between the two arms has already appeared by that noise level. <strong>61% in the first step, 98% by <code>t′=0.832</code>, nothing further below <code>t′=0.71</code>.</strong> The prediction said mid-way; the measurement says it is essentially over at the highest noise.</p>

<p>This contradicts the prediction head-on: at <code>t′=0.99</code> the two modes overlap completely — how can mass move between them? <strong>Because noising does not change mixture weights.</strong> The forward process shrinks each component toward the origin and blurs them into one another, but the weight in front of each component is untouched at every noise level. What high noise destroys is the components’ <em>positions</em> — which is why a single sample cannot be classified there — not the weight that CFG acts on.</p>

<p>Separating the two arms shows one more thing: <strong>the CFG arm’s mode weight stops changing at <code>t′=0.96</code> and moves by 0.002 over the remaining 39 steps</strong>, while the no-CFG arm keeps redistributing until <code>t′≈0.71</code>. The gap keeps widening because the <em>no-CFG</em> arm is moving — not because CFG is still acting.</p>

<h3>Effect 2 | Centres move, then stop: the first half holds, the second does not</h3>

<table>
<tbody>
<tr><th>noise level <code>t′</code></th><th>highest</th><th>mid</th><th>end</th></tr>
<tr><td>distance between the two arms’ centres</td><td><strong>2.60</strong></td><td>0.46</td><td>0.39</td></tr>
</tbody>
</table>

<p>The unit is the no-CFG arm’s spread at the end. <strong>The displacement is largest at the highest noise and decays monotonically to one seventh</strong> — the “strongest at high noise” prediction holds, the only one of the three that does.</p>

<p>But the ideal also said the centre would <strong>stop</strong> at <code>x*</code>, where both branches agree. It does not. Fit a saturating curve to the displacement against γ, and the measured points overshoot the curve’s own limit — <strong>this model has no <code>x*</code></strong>. Samples stop because the 45 steps run out, not because they have reached that point.</p>

<h3>Effect 3 | Each mode narrows: expansion first, narrowing late</h3>

<InflationChart lang="en" />

<p>The prediction said strongest at low noise. In the high-noise band the measured direction is the reverse: <strong>CFG does not narrow the distribution there — it expands it, to 1.9×</strong> (figure above; the reason is in its caption). The expansion decays as noise falls, net narrowing appears only below <code>t′≈0.65</code>, and what survives to the end is 8% of the expansion (28% and 16% on two other inputs).</p>

<p>This explains why Section 2’s <code>1/(γ−1)</code> is so far off: <code>γ−1</code> spans a factor of 96 and the variance only falls to 30–61% — <strong>most of the “contraction” is undoing the earlier expansion.</strong></p>

<p>Half the prediction still stands: <strong>at low noise, effect 3 is the only effect still active</strong> — not because narrowing is strongest there, but because the other two have stopped.</p>

<h3>What survives from Section 2</h3>

<p><strong>Every directional conclusion holds; no numerical form matches the ideal model.</strong></p>

<table className="split">
<tbody>
<tr><th>effect</th><th>direction: holds</th><th>magnitude: fails</th></tr>
<tr><td>Effect 1</td>
    <td>Modes are selected by <code>r</code>, not by density. Under <code>a crane</code> the minority mode at 10% is amplified threefold; low temperature would drive a minority to zero</td>
    <td>The ideal predicts share ratios growing exponentially in γ. They do at small γ; at large γ they barely move</td></tr>
<tr><td>Effect 2</td>
    <td>Centres move away from the unconditional distribution</td>
    <td>The ideal predicts a stop at <code>x*</code>. The centre does not stop, and overshoots the limit of a fitted saturating curve — <strong>no <code>x*</code> in this model</strong></td></tr>
<tr><td>Effect 3</td>
    <td>Variance falls with γ</td>
    <td>The ideal predicts variance ∝ <code>1/(γ−1)</code>. It falls far more slowly and has a floor: <code>γ−1</code> spans 96×, the variance reaches only 30–61%</td></tr>
</tbody>
</table>

<p>The directional statements are not merely “still looking right”; several are theorems. Wu et al.<Cite n={2} /> prove that CFG lowers the differential entropy of the output distribution and raises classification confidence, for DDPM and DDIM alike; Li and Jiao<Cite n={3} /> prove for general data distributions that CFG lowers the expected reciprocal of the classifier probability. <strong>The directional conclusions are the most reliable ones — and they are also the useful ones.</strong></p>

<h2><span className="num">05</span>So why does quality improve?</h2>

<p>Here is the real problem. None of the three effects — reweighting, centre shift, narrowing — <strong>explains why generation quality goes up.</strong> Section 2’s last conclusion makes it worse: at large γ, samples concentrate on the point most distinguishable from the unconditional distribution, not on the most typical one. That should look <em>less</em> like real data.</p>

<p>One premise is missing:</p>

<p className="pull">Everything so far assumes the model is correct. Admit that the model itself is biased, and the contradiction disappears.</p>

<h3>A very short argument</h3>

<p>Suppose the model at γ=1 returns the true conditional distribution. Then any γ&gt;1 can only move the result away from the truth, and every quality metric should degrade monotonically from γ=1 upward.</p>

<p>In practice nobody samples at γ=1. The best γ is always above 1 — universal experience, and the shape of every FID-versus-γ curve in the literature. Therefore:</p>

<pre><code>some γ &gt; 1 beats γ = 1   ⟹   the model at γ = 1 was already biased</code></pre>

<p>Simple reasoning, large conclusion: <strong>CFG is not correcting the distribution. It is correcting the model’s error.</strong></p>

<h3>What error, and why r can fix it</h3>

<p>Karras et al.<Cite n={4} /> give a concrete account: score-matching training makes the model place probability where real data never occur, producing outliers, and CFG removes those outliers.</p>

<Fig label="Measured" title="An outlier repaired by a small γ" src="/images/blog/cfg/fig-outlier.png" alt="The same seed at γ = 1, 1.25, 1.5 and 2" width={1015} height={250}
  axis={['γ = 1', 'γ = 1.25', 'γ = 1.5', 'γ = 2']}
  caption={<>The same seed throughout. <b>Broken at γ=1</b> — the body is split and fragments float; 33,370 occupied voxels against roughly 14,000 for the rest of the batch. <b>Repaired by γ=1.25.</b> A ready example of the outlier Karras et al. describe: the no-CFG sampler put probability where real data do not occur, and a small γ pulled the sample back into range. Of the 1,280 samples in this batch, none lies beyond twice the median distance — such breakages are rare enough to exhibit, but not to count.</>} />

<details>
<summary>Why score matching puts probability where there is no data</summary>
<div className="det-body">
<p>The training objective minimises <code>KL(p_data ‖ p_model)</code>, and the two ways of being wrong cost very differently:</p>
<ul>
<li>data present, model density near zero — the <code>log</code> term diverges; infinite penalty</li>
<li>data absent, model density positive — the <code>p_data ≈ 0</code> factor in front makes the penalty almost nothing</li>
</ul>
<p><strong>Missing real data is catastrophic; spreading density where there is none is nearly free.</strong> With unlimited capacity both can be satisfied at once; with finite capacity they conflict, and the model errs toward spreading.</p>
<p>The learned density is therefore flatter and wider than the truth, with gaps that should be empty filled in. Karras et al.’s two-dimensional example shows exactly this: a tree-shaped distribution whose learned density is visibly wider, so samples fall into the spaces between branches.</p>
<p>This is an <strong>estimation</strong> error, not a property of diffusion itself — with enough data and capacity, score matching converges to the true score. Section 6’s “the CFG strength a model needs reflects its error” rests on this.</p>
</div>
</details>

<p>What matters is the nature of this error: <strong>it comes from the model being insufficiently accurate, not from the condition</strong> — the conditional and unconditional branches make the same kind of mistake, only more severely on the unconditional side. Because both branches have it, it cancels in the ratio <code>r</code>: those regions have <code>r ≈ 1</code>, and <code>r^(γ−1)</code> suppresses them.</p>

<p>This yields a falsifiable prediction: <strong>only the error shared by both branches is removed; error specific to the conditional branch is amplified.</strong> That is different from “CFG removes outliers”, under which it would not matter which branch the error came from.</p>

<h3>The three effects, read again</h3>

<table>
<tbody>
<tr><th>effect</th><th>distribution view</th><th>error view</th></tr>
<tr><td>Effect 1</td><td>reweight modes by r</td><td>suppress modes that exist only because density was spread</td></tr>
<tr><td>Effect 2</td><td>move toward where the branches agree</td><td>leave the regions dominated by the unconditional branch’s error</td></tr>
<tr><td>Effect 3</td><td>narrow each mode</td><td>remove the excess variance that spreading added</td></tr>
</tbody>
</table>

<p>This agrees with the line of work that decomposes <code>Δ</code> into components — Li et al.<Cite n={5} /> isolate a term that “suppresses generic features common across unconditional data”. Two descriptions of the same thing.</p>

<h3>Where the optimum γ lies</h3>

<p>Too small, and the error is not fully cancelled; too large, and the bias the tilt introduces exceeds the error it removes. The best γ balances the two — which is why quality metrics are U-shaped in γ.</p>

<h3>And a part that has nothing to do with distributions</h3>

<p>Some of the “improvement” is not distributional at all. People prefer high contrast, saturated colour and clean composition, and <strong>high γ delivers exactly those</strong>. Distribution metrics cannot see this; human evaluation can — and aesthetic preference is a different thing from “closer to real data”, sometimes the opposite.</p>

<p>So “looks better” is at least three things stacked together: <strong>error cancelled</strong> (a genuine improvement), <strong>bias from the tilt</strong> (a genuine degradation), and <strong>aesthetic preference</strong> (a property of the metric). Separating them is what this article set out to do.</p>

<h2><span className="num">06</span>What this means for training</h2>

<p>If CFG is fundamentally correcting model error, a few conclusions follow directly.</p>

<h3>The CFG strength a model needs reflects its error</h3>

<p>In the limit, a perfectly accurate model needs no CFG — so the more accurate the model, the smaller the γ it needs. The same fact can be exploited the other way round: Karras et al.<Cite n={4} /> replace the unconditional branch with a deliberately under-trained version of the same model, so that <code>r</code> points more purely along the error direction — FID 1.01 on ImageNet. Both routes share a premise: <strong>what CFG acts on is the error, not the condition.</strong></p>

<h3>Two different thresholds when tuning γ</h3>

<p>Raising γ meets two events in turn: a value where quality peaks, and, further on, visible defects — oversaturation in images, structural collapse in geometry. <strong>These are two different thresholds, set by different factors.</strong></p>

<table>
<tbody>
<tr><th /><th>set by</th><th>as the model improves</th></tr>
<tr><td>the γ where quality peaks</td><td>the gap between the conditional and unconditional branches’ errors</td><td>falls</td></tr>
<tr><td>the γ where defects appear</td><td>the model’s own accuracy — larger γ is more extrapolation</td><td>rises</td></tr>
</tbody>
</table>

<p>So <strong>the usable range between them widens as training proceeds.</strong> We have not seen this separation reported, and it can be measured on any series of checkpoints. Tracking the optimal γ also shows how much the conditional branch has improved relative to the unconditional one — γ stops being merely an inference-time knob.</p>

<h3>Designing a schedule</h3>

<table>
<tbody>
<tr><th>band</th><th>what applying CFG here buys</th></tr>
<tr><td>high noise</td><td>Which mode a sample lands in, and where its centre moves, are both decided here. Cutting this band means giving up control of the result</td></tr>
<tr><td>low noise</td><td>Only effect 3 is still active. Cut this band and the narrowing is gone</td></tr>
</tbody>
</table>

<p>So a schedule that applies CFG only within some noise band <strong>can buy very different things on different models</strong>, depending on where that model’s modes are decided. That position is measurable — apply CFG band by band and compare mode shares — so measure it before choosing a schedule.</p>

<details>
<summary>How the experiments were run</summary>
<div className="det-body">
<p>Scope: every measurement is on one model — an image/text-conditioned 3D rectified-flow model producing a 64³ occupancy field. The results describe what happens on that model; they do not vouch for others.</p>
<table>
<tbody>
<tr><th /><th /></tr>
<tr><td>Model</td><td>image/text-conditioned 3D rectified flow, 45 steps, 64³ continuous occupancy output</td></tr>
<tr><td>Scale</td><td>≈13,000 samples; ≈5 GPU-hours on 8×B200</td></tr>
<tr><td>γ grid</td><td>1, 1.25, 1.5, 2, 3, 5, 6, 9, 15, 25; 128 seeds per point</td></tr>
<tr><td>Pairing</td><td>the CFG and no-CFG arms share seeds and initial noise, so per-sample comparison is valid</td></tr>
<tr><td>Variance</td><td>mean pairwise squared distance over 2 (the trace of the covariance); standard error from 400 bootstrap resamples</td></tr>
<tr><td>Mode classification</td><td>occupancy pooled to 16³ and normalised by total mass; one axis built from hand-picked exemplars; leave-one-out accuracy 93.3%</td></tr>
<tr><td>Rendering</td><td>DDA with flat per-face shading, normals from the cube face the ray crosses. Not a smooth isosurface — the data are voxels</td></tr>
</tbody>
</table>
<p>Implementation details that mattered: γ=1 takes a different code path (the pipeline branches on <code>cfg&gt;1</code>); the “unconditional” branch ships with a default negative prompt, not an empty string; Euclidean distance in latent space barely separates conditions (total variance differs by only 12% across nine conditions), so all clustering is on geometric features; noise bands must be defined by the <code>t′</code> the denoiser actually receives, not by step index; and the sampler is chaotic — any perturbation diverges to 0.08–0.11σ over 45 steps, so the <code>t′&lt;0.6</code> row is only 1.7× that floor and only <code>t′&lt;0.8</code> is unambiguous.</p>
</div>
</details>
    </>
  );
}
