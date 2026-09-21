import { Cite, Fig } from './fig';
import { BlurThenTilt, EffectWindows, InflationChart, ShareChart, ThreeEffects } from './demos';

/** The Chinese article body. Prose is ordinary JSX; every figure is a shared component. */
export function ContentZh() {
  return (
    <>
<p className="lead">Classifier-free Guidance（CFG）<Cite n={1} />的做法很简单：采样的每一步让模型算两次，一次带条件、一次不带，再把两个结果按一个系数 γ 组合起来。γ 越大，输出越贴合条件，生成质量通常也越高——这一点在实践中相当稳定，所以几乎没有人把 γ 设回 1。</p>

<p>至于「为什么会这样」，最早那批工作给出的解释是：<strong>CFG 相当于降低采样温度，让分布变得更尖锐、更集中在高概率的地方。</strong>这个说法流传最广，也写进了很多教程。</p>

<p>但这个说法很可能是错的。过去两年有多篇论文各自否定了其他论文对 CFG 的理解，而且分歧不在措辞，在于 CFG 到底把输出分布变成了什么样子。</p>

<p>而在所有分歧之上，还有一个大家都默认、却很少明确指出的矛盾：</p>

<p className="pull">如果 CFG 把分布推离了真实数据，为什么 γ 调到 5 的结果，比 γ=1 更好？</p>

<p>这篇文章分三层回答。</p>

<p><strong>第一层，CFG 想做什么（第二节）。</strong>在一个理想模型下——假设 CFG 只作用一次，而且采样结果就是这一次算出来的分布——把 γ 调大，同一个条件下的输出会怎么变：哪些 mode 变得更常见、每个 mode 的中心往哪移、同一个 mode 内的样本还剩多少差异。这三件事都能推出确切的形式。</p>

<p><strong>第二层，实际和理想有差距（第三、四节）。</strong>真实采样得到的分布并不是理想模型算出来的那个，有两个原因：CFG 的 tilt 和加噪的顺序反了，以及 CFG 不是作用一次而是每一步作用一次。前一个原因和步数无关，也和采样器是不是确定性的无关——步数取到无穷多也消不掉。</p>

<p><strong>第三层，为什么生成质量仍然变好（第五、六节）。</strong>因为 CFG 修的不是分布，是模型本身的误差。</p>

<p>第一节先把公式和记号交代清楚。行文以 rectified flow / flow matching 为主，DDPM 和 DDIM 只在需要对照时出现。</p>

<h2><span className="num">01</span>CFG 的公式，和背后那个分布</h2>

<p>先交代采样过程。Rectified flow 的采样从纯噪声出发，沿一条轨迹走到干净数据：每一步，模型根据当前的 <code>x</code> 和噪声水平 <code>t</code>，输出一个<strong>速度</strong>——往哪个方向走、走多少。把这些步积分到 <code>t=0</code>，就得到一个样本。</p>

<p>不加 CFG 时，模型每步只运行一次，输入条件得到 <code>v_c</code>，沿 <code>v_c</code> 走一步。</p>

<p>CFG 改的就是这一步：<strong>每步运行两次</strong>——一次带条件得到 <code>v_c</code>，一次去掉条件得到 <code>v_u</code>——然后用两者的线性组合去走：</p>

<pre><code>这一步实际走的 = v_u + γ · (v_c − v_u)</code></pre>

<p><code>γ</code> 就是各家 pipeline 里的 <code>guidance_scale</code>。γ=1 时右边化简成 <code>v_c</code>，回到不加 CFG 的情况；γ&gt;1 则是<strong>沿着条件带来的那一点差别再多走一段</strong>。</p>

<p className="note">DDPM 和 DDIM 里模型输出的不是速度，而是噪声 <code>ε</code>，但 CFG 的写法完全相同，只需把上式的 <code>v</code> 换成 <code>ε</code>。下面的结论两种参数化都成立，理由在折叠块里。</p>

<h3>这一步在分布层面等于什么</h3>

<p>模型输出的速度和分布的 score（<code>∇log p</code>）之间是一一对应的——知道速度就能算出 score，反过来也一样。所以<strong>把两个速度线性组合，等价于把两个 score 线性组合</strong>：</p>

<pre><code>(1−γ) · ∇log p(x)  +  γ · ∇log p(x|c)</code></pre>

<p>而这一串恰好是 <code>log[ p(x|c)^γ · p(x)^(1−γ) ]</code> 的梯度。换句话说，CFG 每一步沿着的，是<strong>这个分布</strong>的 score。整理后得到：</p>

<pre><code>p_γ(x|c)  ∝  p(x|c) · r(x)^(γ−1)

其中  r(x) = p(x|c) / p(x)</code></pre>

<p>所以 γ 在分布层面做的事是：<strong>把 <code>p(x|c)</code> 按 <code>r</code> 重新加权一遍</strong>。<code>r</code> 大的地方被放大，<code>r</code> 小的地方被压低，γ 决定力度。</p>

<p>「把一个分布乘上一个权重函数再归一化」这个操作有个现成的名字，叫 <strong>tilt</strong>。下文一律用 tilt 指代 CFG 在分布层面做的这件事——<strong>CFG 就是对 <code>p(x|c)</code> 做了一次以 <code>r^(γ−1)</code> 为权重的 tilt</strong>。</p>

<p>后面会反复用到三个词，先给出定义：</p>

<table>
<tbody>
<tr><th>词</th><th>指什么</th></tr>
<tr><td>密度</td><td>某个具体输出出现的相对可能性。<code>p(x|c)</code> 在哪里高，采样就更容易落到哪里。</td></tr>
<tr><td>占比</td><td>采样很多次之后，落在某一类结果里的样本比例。占比是密度在那一类结果上的积分，也是实验里真正能数出来的量。</td></tr>
<tr><td>r</td><td>同一个输出在 <code>p(x|c)</code> 下的密度，除以在 <code>p(x)</code> 下的密度。</td></tr>
</tbody>
</table>

<p><code>r</code> 是这篇文章里最重要的一个量，需要单独说明。r 衡量的是：<strong>这个输出在多大程度上是因为条件才出现的。</strong></p>

<ul>
<li><code>r</code> 很大 —— 这种结果基本只有给了条件才会出现</li>
<li><code>r</code> 接近 1 —— 不给条件也一样会出现，所以这样的结果和条件关系不大</li>
</ul>

<p>换个角度：<code>r</code> 正比于「看到这个输出、条件是 c 的概率」，也就是模型内部隐含的那个分类器。CFG 没有真的训练分类器，但始终在依据这个比值决定方向。</p>

<details>
<summary>推导：两步贝叶斯</summary>
<div className="det-body">
<p>classifier guidance 把 classifier 项乘上一个系数 γ：score 变成
<code>∇log p(x) + γ∇log p(c|x)</code>。给对数梯度乘 γ，等于给那一项取 γ 次幂，所以这一串是 <code>p(x)·p(c|x)^γ</code> 的 score。</p>
<p>再用一次贝叶斯消掉分类器：<code>∇log p(c|x) = ∇log p(x|c) − ∇log p(x)</code>，代回去得到
<code>(1−γ)∇log p(x) + γ∇log p(x|c)</code>，正是 CFG 的线性组合。对应的分布
<code>p(x|c)^γ p(x)^(1−γ)</code> 整理后即为上式。</p>
<p>flow matching 下的换算：<code>∇log p_t(x) = −[x + (1−t)v(x,t)]/t</code>，于是
<code>∇log r = −((1−t)/t)(v_c − v_u)</code>。系数恒正且不依赖 x，所以下文所有关于符号、零点、单调性的结论，在 v 参数化和 ε 参数化下完全一致。</p>
</div>
</details>

<h3>全文的符号</h3>

<table className="sym">
<tbody>
<tr><th>符号</th><th>含义</th><th>典型值</th></tr>
<tr><td>x</td><td>数据点（模型内部的 latent）</td><td>—</td></tr>
<tr><td>c</td><td>条件</td><td>—</td></tr>
<tr><td>t</td><td>噪声水平</td><td>0 = 干净，1 = 纯噪声</td></tr>
<tr><td>γ</td><td>guidance scale</td><td>1 = 不加 CFG；文生图常用 5–9；SDS 用 100</td></tr>
<tr><td>v_c, v_u</td><td>conditional / unconditional 分支的输出</td><td>—</td></tr>
<tr><td>Δ</td><td>v_c − v_u，CFG 的方向</td><td>—</td></tr>
<tr><td>r</td><td>conditional 密度 / unconditional 密度</td><td>—</td></tr>
<tr><td>x*</td><td>Δ = 0 的点，两个分支给出相同预测的地方</td><td>—</td></tr>
</tbody>
</table>

<h2><span className="num">02</span>单步理想模型：CFG 想做什么</h2>

<p>这一节讨论一个<strong>理想模型</strong>，前提是两件事：</p>

<ol>
<li>CFG <strong>只作用一次</strong>，作用在干净数据的分布上</li>
<li><strong>采样结果就是</strong>这一次作用算出来的 <code>p_γ</code></li>
</ol>

<p>真实采样中这两条都不成立，后面两节分别处理。但先把理想模型讲透是值得的：<strong>下面三个结论在真实采样里方向依然成立，只是数值并不一致</strong>——没有这个理想模型，就不知道该去测什么。</p>

<p>在这个理想模型下，把 γ 调大会发生三件事：</p>

<table>
<tbody>
<tr><th /><th>发生了什么</th><th>形式</th></tr>
<tr><td>效应一：mode 之间重新分配</td><td>有的 mode 被放大，有的被压低，而且差距是指数级的</td><td>占比之比 ∝ <code>(r_A/r_B)^(γ−1)</code></td></tr>
<tr><td>效应二：中心挪开然后停下</td><td>中心离开原位，但会停在一个固定的点上</td><td>停在一个固定的点 <code>x*</code></td></tr>
<tr><td>效应三：每个 mode 变窄</td><td>同一个 mode 内部的样本越来越像</td><td>方差 ∝ <code>1/(γ−1)</code></td></tr>
</tbody>
</table>

<ThreeEffects lang="zh" />

<h3 className="eff"><span className="k">效应一</span>mode 之间按 r 重新分配</h3>

<p>先看这条结论为什么成立。<code>p_γ</code> 是 <code>p(x|c)</code> 乘上 <code>r^(γ−1)</code>。单个 mode 很窄，<code>r</code> 在这个 mode 内部近似是个常数 <code>r_j</code>，所以这一整个 mode 的占比就是<strong>原来的占比乘上 <code>r_j^(γ−1)</code></strong>：</p>

<pre><code>占比_j  ≈  w_j · r_j^(γ−1)        w_j 是这个 mode 在 p(x|c) 下的占比

占比_A / 占比_B  =  (w_A / w_B) · (r_A / r_B)^(γ−1)</code></pre>

<p>γ 在指数上，所以差距是指数级拉开的。<strong>但关键不在「指数」，在于被拉开的是 r 的比，不是密度的比。</strong>图里 mode A 起始占比 0.6、B 只有 0.4，但 A 坐落在 unconditional 分布（虚线）的正中央，B 在尾巴上，所以 <code>r_B &gt; r_A</code>。把 γ 增大到 4，<strong>更高的那个峰降下去，更矮的那个升上来</strong>，翻转发生在 γ≈1.8。</p>

<p className="pull">CFG 挑的不是「最可能」的 mode，是「最只能由条件解释」的 mode。</p>

<Fig label="实测" title="同一个种子，γ 变大时鸟变成了起重机" src="/images/blog/cfg/fig-crane-gamma.png" alt="四个种子在四个 γ 下的 a crane 生成结果" width={875} height={875}
  axis={['γ = 1', 'γ = 2', 'γ = 6', 'γ = 25']}
  caption={<>条件是 <code>a crane</code>，行是种子，列是 γ，同一行只有 γ 在变。 <b>γ=1 那一列是有腿、有躯干的生物形态；到 γ=6 全都成了塔吊。</b> 英文 crane 同时指起重机和鹤，不加 CFG 时模型两个都做；γ 增大后，鸟这一类就消失了。 <br /><br /> 种子并非人工挑选：16 个种子在 γ=1 时按判别轴打分，取最偏「生物」的四个。</>} />

<ShareChart lang="zh" />

<h3>一个流行说法为什么不成立：CFG 不是低温采样</h3>

<p>低温采样做的是 <code>p(x|c)^γ</code>，只有分子，mode 占比之比是 <code>(w_A/w_B)^γ</code>——<strong>只会让本来就大的 mode 更大</strong>。CFG 多了一个分母 <code>p(x)^(1−γ)</code>，专门惩罚「不给条件也常见」。在图里这个例子上：</p>

<pre><code>低温采样：A 持续占优     (0.6/0.4)^γ 单调增大
CFG    ：B 反超         γ≈1.8 之后反转</code></pre>

<p><strong>同一个分布、同一个 γ，两种操作把样本推向相反的 mode。</strong>所以「CFG 约等于降低温度」不只是不精确——在选哪个 mode 这件事上，方向是反的。</p>

<h3 className="eff"><span className="k">效应二</span>每个 mode 的中心挪开，然后停下</h3>

<p>在单个 mode 内部，中心会离开原位，朝着<em>远离 unconditional 分布</em>的方向移动，但不会一直走。把 CFG 公式括号里的那个差值记为：</p>

<pre><code>Δ  =  v_c − v_u        整个 CFG 就是「在 v_u 的基础上，沿 Δ 多走 γ 倍」</code></pre>

<p className="pull">x* 就是 Δ = 0 的地方——两个分支给出相同预测的那个点。</p>

<p><code>Δ</code> 正比于 <code>∇log r</code>（换算在折叠块里），而 <code>x*</code> 是 <code>r</code> 的极大点，梯度为零，所以 <code>Δ</code> 在那里也等于零，CFG 恰好消失，而且样本会被吸向这个点。图里第二个小图是 mode B 的中心随 γ 的变化：<strong>起初上升很快，随后迅速趋平，停在 x* 上</strong>，γ 从 5 增大到 12 几乎不再移动。</p>

<p>注意这里有一件反直觉的事：<strong>γ 越大，样本越接近 CFG 自己消失的那个点。</strong>第四节会看到，这个模型上并不存在这样一个点。</p>

<h3 className="eff"><span className="k">效应三</span>每个 mode 变窄，速度是 1/(γ−1)</h3>

<p>同一个 mode 内部的方差按 <code>1/(γ−1)</code> 下降。标准差则按 <code>1/√(γ−1)</code> 收缩，比中心停下来慢——这意味着 γ 大到一定程度之后，<strong>采到的样本不再改变，只是彼此越来越像。</strong></p>

<details>
<summary>推导：为什么是 1/(γ−1)</summary>
<div className="det-body">
<p>写 <code>β = γ−1</code>。目标是 <code>p(x|c)·r^β</code>，取对数后在 <code>x*</code> 处展开：<code>log r</code> 的一阶项为零（极值点），二阶项带上 β 权重，于是 β 主导了曲率。配方之后得到一个高斯，协方差是 <code>H⁻¹/β</code>，其中 <code>H</code> 是 <code>−∇²log r(x*)</code>。所以方差正比于 <code>1/(γ−1)</code>，均值以同样的速度趋近 <code>x*</code>。</p>
<p>在一维高斯的例子上数值核对过：γ=100 时精确解方差 0.01329，这个近似给 0.01347。</p>
</div>
</details>

<Fig label="实测" title="种子之间的分歧壳，γ 越大越薄" src="/images/blog/cfg/fig-shell.png" alt="四个 γ 下，128 个种子的一致核心与分歧壳的竖切面" width={1536} height={384}
  axis={['γ = 1', 'γ = 2', 'γ = 6', 'γ = 25']}
  caption={<>同一个图像条件、128 个种子，取竖切面。<b>米色</b>是九成以上种子都认为实心的部分，<b>红色</b>是种子之间有分歧的壳。 γ=1 时整根柱子裹着红边、上面那只动物轮廓模糊；到 γ=25 只剩一条细红线。 壳占整体的比例是 58% → 27% → 16% → 13%。 但收缩远比 <code>1/(γ−1)</code> 慢：<code>γ−1</code> 变化 96 倍，方差只降到 30–61%，第四节会说为什么。</>} />

<p>拖第二个滑块 σu，把 unconditional 的宽度调到和单个 mode 一样（0.5），<strong>收窄就消失了</strong>。也就是说：</p>

<p className="pull">一个 mode 会不会变窄，取决于<strong>这个 mode 自己有多窄</strong>和 <strong>unconditional 分布有多宽</strong>——两者差得越多，收窄越强。γ 只是个放大器：两者一样宽时，γ 再大也只是把整个 mode 挪走。</p>

<p>这个前提在真实模型上并不总是成立：<strong>有一半的方向不满足。</strong>把一个条件下的 latent 分布做主成分分解，取前十二个主方向，逐个方向比较 conditional 和 unconditional 的宽度：</p>

<table>
<tbody>
<tr><th>方向</th><th>γ 从 1 增大到 25，宽度变成原来的</th></tr>
<tr><td>六个方向，conditional 本来更窄</td><td>0.21–0.45（收窄，符合效应三）</td></tr>
<tr><td>六个方向，conditional 本来更宽</td><td><strong>扩张</strong>，最宽的那个方向在 γ=3 处达到 1.95 倍</td></tr>
</tbody>
</table>

<p>而且扩张的峰值落在 <strong>γ=2–5</strong>，正是实际在用的区间。所以：</p>

<p className="pull">CFG 不是各向同性的收缩。CFG 一边把 conditional 本来就更窄的方向继续压缩，一边把 conditional 本来更宽的方向<strong>扩张</strong>。用一个标量方差去衡量，两者部分相抵，只看得到一个净收窄，看不出两类方向的变化方向相反。</p>

<h3>γ 推到极限，样本会集中到哪</h3>

<p><code>r^(γ−1)</code> 是个指数放大器：γ 推到极限，所有概率都集中到 <code>r</code> 最大的那个点，<strong>而不是 <code>p(x|c)</code> 最大的那个点</strong>。</p>

<p className="pull">极限处得到的是「最能和 unconditional 区分开的 c」，不是「最典型的 c」——γ 不大时两者差别不明显，γ 增大后差别迅速拉开。</p>

<h2><span className="num">03</span>理想和实际的差距从哪来</h2>

<p>实际采样得到的分布，和上一节理想模型算出来的 <code>p_γ</code> 并不一致。原因出在一个很具体的地方：<strong>CFG 的 tilt 和加噪这两件事的先后顺序反了。</strong></p>

<p>理想模型里，tilt 作用在<strong>干净数据</strong>的分布上，得到 <code>p_γ</code>。要让采样真的结束在 <code>p_γ</code> 上，采样器每一步看到的就必须是 <code>p_γ</code> 加噪之后的样子——<strong>先 tilt，再加噪</strong>。</p>

<p>但模型学的是 <code>p_t(x|c)</code> 和 <code>p_t(x)</code>：干净数据<strong>直接加噪</strong>得到的两个分布，中间没有经过 tilt。CFG 的 tilt 只能加在这两个已经加过噪的分布之上——<strong>先加噪，再 tilt</strong>。</p>

<pre><code>需要的：  干净数据 ──tilt──▶ p_γ ──加噪──▶ 采样器看到的
CFG 给的：干净数据 ──加噪──▶ 两个分布 ──tilt──▶ 采样器看到的</code></pre>

<p><strong>这两个操作不可交换。</strong>只有在完全没加噪时，两条路给出的才是同一个分布。<code>p_γ</code> 是按干净数据定义的，所以 <code>p_γ</code> 本身没算错；但采样沿着的是另一条路，最后落在别处。<strong>这不是精度问题</strong>——就算步数取到无穷多、模型学得完全准、用确定性采样器，走的仍然是另一条路，结果照样不是 <code>p_γ</code>。</p>

<BlurThenTilt lang="zh" />



<h2><span className="num">04</span>多步采样下，三个效应的变化</h2>

<p>理想模型里 CFG 只作用一次。实际采样里 CFG 在几十步中每一步都作用一次，<strong>而且每一步作用在不同的噪声水平上</strong>。同一个 tilt 放在不同的噪声水平上，效果并不一样。</p>

<h3>预测：每个效应有自己的噪声区间</h3>

<p>决定三个效应各自强弱的是同一个量：<strong>conditional 的单个 mode 有多窄，和 unconditional 分布有多宽，两者差多少。</strong>噪声会同时抹宽这两个分布，所以这个差距随噪声水平变化——于是每个效应有自己的活跃区间。</p>

<table>
<tbody>
<tr><th /><th>高噪声<br />采样刚开始</th><th>中噪声</th><th>低噪声<br />采样快结束</th></tr>
<tr><td>效应一：mode 之间重新分配</td>
    <td>mode 还混在一起，无从加强或削弱</td>
    <td><strong>起作用</strong></td>
    <td>已经确定，无法改变</td></tr>
<tr><td>效应二：中心挪开然后停下</td>
    <td>持续外移</td>
    <td>位移开始收敛</td>
    <td>已经停在 <code>x*</code> 上</td></tr>
<tr><td>效应三：每个 mode 变窄</td>
    <td>几乎没有——两边的宽度被噪声抹平了</td>
    <td>开始出现</td>
    <td><strong>最强</strong></td></tr>
</tbody>
</table>

<EffectWindows lang="zh" />

<h3>实测：三条预测只有一条成立</h3>

<p>以下结果都在我们自己的 3D rectified-flow 模型上测得。开 CFG 和不开 CFG 两组使用<strong>同一批种子、同一份初始噪声</strong>，逐步比较两组对干净样本的估计。<code>t′</code> 是模型实际收到的噪声水平，1 是纯噪声，采样从右往左走，共 45 步。</p>

<table className="verdict">
<tbody>
<tr><th>效应</th><th>预测</th><th>实测</th></tr>
<tr><td>效应一</td><td>中段最强</td>
    <td><strong>错。</strong>在高噪声段就已完成</td></tr>
<tr><td>效应二</td><td>高噪声最强</td>
    <td><strong>对。</strong>位移在最高噪声处最大，之后单调衰减到七分之一</td></tr>
<tr><td>效应三</td><td>低噪声最强</td>
    <td><strong>需要修正。</strong>高噪声处 CFG 先使分布<em>扩张</em>，净收窄要到低噪声才出现；低噪声段只有效应三在起作用</td></tr>
</tbody>
</table>

<h3>效应一｜mode 之间重新分配：在高噪声段已经完成</h3>

<p>每一步把两组样本投影到一条 mode 轴上，读出落在每个 mode 上的质量。拟合时允许整团样本沿这条轴平移，所以读到的是真正从一个 mode 转移到另一个 mode 的质量，不是平移造成的假象。</p>

<table>
<tbody>
<tr><th>噪声水平 <code>t′</code></th><th>0.992<br />第 1 步</th><th>0.881</th><th>0.832</th><th>0.706</th></tr>
<tr><td>两组权重差距完成的比例</td><td><strong>61%</strong></td><td>87%</td><td>98%</td><td>100%</td></tr>
</tbody>
</table>

<p>第二行是到这个噪声水平为止，两组 mode 权重之差相对终点的总变化量已经完成了多少。<strong>第一步就完成 61%，到 <code>t′=0.832</code> 完成 98%，<code>t′=0.71</code> 以下不再变化。</strong>预测说中段最强，实测在最高噪声处就基本结束。</p>

<p>这和预测直接冲突：<code>t′=0.99</code> 时两个 mode 已经重叠在一起，怎么还能在两者之间转移质量？<strong>因为加噪不改变混合权重。</strong>前向过程把每个成分压向原点、彼此重叠，但每个成分前面的权重在任何噪声水平上都原封不动。高噪声抹去的是两个成分的<em>位置</em>信息——所以单个样本在那里无法归类——而不是 CFG 作用的那个权重。</p>

<p>把两组分开看，还有一件事：<strong>开 CFG 那一组的 mode 权重在 <code>t′=0.96</code> 就不再变化，剩下 39 步只改变了 0.002</strong>，而不开 CFG 那一组持续变化到 <code>t′≈0.71</code> 才停。所以两组之间的差距继续拉大，是不开 CFG 那一组在变化，不是 CFG 还在起作用。</p>

<h3>效应二｜中心挪开然后停下：前半句成立，后半句不成立</h3>

<table>
<tbody>
<tr><th>噪声水平 <code>t′</code></th><th>最高</th><th>中段</th><th>终点</th></tr>
<tr><td>两组中心之间的距离</td><td><strong>2.60</strong></td><td>0.46</td><td>0.39</td></tr>
</tbody>
</table>

<p>距离的单位是不开 CFG 那一组在终点的散开程度。<strong>中心位移在最高噪声处最大，之后单调衰减到七分之一</strong>——预测说的「高噪声最强」成立，而且是三条预测里唯一成立的一条。</p>

<p>但理想模型还说了后半句：中心会<strong>停</strong>在 <code>x*</code>，也就是两个分支给出相同预测的那个点。实测中心并不停下。把中心位移对 γ 拟合一条会饱和的曲线，实测的点越过了那条曲线预测的极限值——<strong>这个模型上不存在 <code>x*</code></strong>，样本停下来不是因为走到了那个点，是因为 45 步走完了。</p>

<h3>效应三｜每个 mode 变窄：先扩张，很晚才收窄</h3>

<InflationChart lang="zh" />

<p>预测说低噪声最强。实测的方向在高噪声段是反的：<strong>CFG 在那里不是收窄，而是使分布扩张到 1.9 倍</strong>（上图，原因见图注）。扩张随噪声下降而衰减，净收窄要到 <code>t′≈0.65</code> 之后才出现，而且最终只剩那次扩张的 8%（另两个输入上 28% 和 16%）。</p>

<p>这解释了第二节的 <code>1/(γ−1)</code> 为什么和实测相差这么多：<code>γ−1</code> 变化 96 倍，方差只降到 30–61% 就停住——<strong>大部分收缩只是在抵消此前的扩张。</strong></p>

<p>不过预测里还有一半是对的：<strong>低噪声段确实只有效应三在起作用</strong>——但理由不是收窄在那里最强，而是另外两个已经停了。</p>

<h3>第二节的结论还剩下什么</h3>

<p><strong>方向性的结论均成立，而具体数值与理想模型的公式不符。</strong></p>

<table className="split">
<tbody>
<tr><th>效应</th><th>方向：成立</th><th>数值：不成立</th></tr>
<tr><td>效应一</td>
    <td>按 <code>r</code> 而不是按密度选 mode。<code>a crane</code> 下只占 10% 的少数 mode 被放大了三倍，低温采样只会把少数压向零</td>
    <td>理想模型说两个 mode 的占比之比随 γ 指数增长。γ 较小时确实如此，γ 较大时几乎不再变化</td></tr>
<tr><td>效应二</td>
    <td>中心朝远离 unconditional 分布的方向移动</td>
    <td>理想模型说中心会停在 <code>x*</code>。实际不停，而且越过了饱和曲线预测的极限值——<strong>这个模型上没有 <code>x*</code></strong></td></tr>
<tr><td>效应三</td>
    <td>方差随 γ 下降</td>
    <td>理想模型说方差正比于 <code>1/(γ−1)</code>。实际下降慢得多，而且有下限：<code>γ−1</code> 变化 96 倍，方差只降到 30–61%</td></tr>
</tbody>
</table>

<p>这些关于方向的结论不只是「看起来还对」，其中几条已被严格证明：Wu 等人<Cite n={2} />证明 CFG 会降低输出分布的微分熵、提高分类置信度，DDPM 和 DDIM 都成立；Li 和 Jiao<Cite n={3} />在一般分布下证明 CFG 会降低分类概率倒数的期望。<strong>关于方向的结论最可靠，而这些结论恰好也是最有用的。</strong></p>

<h2><span className="num">05</span>那为什么生成质量会变好</h2>

<p>到这里出现一个真正的问题。三个效应——mode 之间重新分配、中心挪开、mode 变窄——<strong>没有一个能解释生成质量为什么会变好</strong>。尤其是第二节最后那个结论：γ 推到极限时，样本集中到的是「最能和 unconditional 区分开」的点，而不是最典型的点——照理应该<em>更不</em>像真实数据。</p>

<p>缺的是一个前提：</p>

<p className="pull">到这里为止的所有分析都默认模型是对的。一旦承认模型本身是偏的，这个矛盾就没有了。</p>

<h3>一个很简单的推论</h3>

<p>假设 γ=1 时模型给出的就是真实的条件分布。那么任何 γ&gt;1 都只会让结果离真实分布更远，质量指标应该从 γ=1 起单调变差。</p>

<p>但实践中没有人把 γ 设成 1。最优的 γ 总是大于 1，这是普遍的使用经验，文献里的 FID-γ 曲线也是这个形状。于是：</p>

<pre><code>存在 γ &gt; 1 优于 γ = 1   ⟹   γ = 1 时模型本来就是偏的</code></pre>

<p>推理很简单，结论并不小：<strong>CFG 修的不是分布，是模型的误差。</strong></p>

<h3>这是什么误差，r 为什么能修</h3>

<p>Karras 等人<Cite n={4} />给了一个具体的说法：score matching 训练会让模型把概率放到真实数据根本不会出现的地方，产生 outlier，而 CFG 会去掉这些 outlier。</p>

<Fig label="实测" title="一个 outlier，被很小的 γ 修复" src="/images/blog/cfg/fig-outlier.png" alt="同一个种子在 γ=1、1.25、1.5、2 下的结果" width={1015} height={250}
  axis={['γ = 1', 'γ = 1.25', 'γ = 1.5', 'γ = 2']}
  caption={<>同一个种子。<b>γ=1 时是破碎的</b>——躯体断开、有浮空碎块，占据体素 33370 个，而同批其他样本约 14000。 <b>γ=1.25 就已修复。</b>这是 Karras 等人所说的那种 outlier 的一个现成例子： 不开 CFG 的采样把概率放到了真实数据不会出现的地方，而很小的 γ 就把这个样本拉回了正常范围。 这批 1280 个样本里，超过中位距离两倍的一个也没有——这类破碎样本少到只能举例，不能统计。</>} />

<details>
<summary>为什么 score matching 会把概率放到没有数据的地方</summary>
<div className="det-body">
<p>训练目标本质上在最小化 <code>KL(p_data ‖ p_model)</code>。两种错误的代价完全不对称：</p>
<ul>
<li>数据存在、模型给出接近零的密度 —— <code>log</code> 项发散，惩罚无穷大</li>
<li>数据不存在、模型给出正的密度 —— 前面乘的 <code>p_data ≈ 0</code>，几乎没有惩罚</li>
</ul>
<p><strong>漏掉真实数据的代价极大，在没有数据的地方多放密度几乎没有代价。</strong>容量无限时两者都能做到；容量有限时二者冲突，模型只能偏向把密度铺得更开。</p>
<p>结果是学出来的密度比真实的更平、更散，本该是零的空隙被填上。Karras 等人的二维例子展示的就是这一点：真实分布是树状结构，学到的密度明显更宽，采样会落到枝杈之间的空白处。</p>
<p>注意这是<strong>估计误差</strong>，不是扩散模型的固有性质——数据和容量都够时，score matching 能收敛到真实 score。第六节「CFG 的必要强度反映模型的误差」这一条就建立在这一点上。</p>
</div>
</details>

<p>关键在于这种误差的性质：<strong>误差来自模型学得不够准，和给不给条件无关</strong>——conditional 和 unconditional 两个分支犯的是同一种错，只是 unconditional 那边更重。既然两边都有，在 <code>r</code> 这个比值里就抵消了，那些区域的 <code>r ≈ 1</code>，于是被 <code>r^(γ−1)</code> 压低。</p>

<p>这个说法给出一个可以证伪的推论：<strong>只有两个分支共有的误差会被消除，conditional 分支独有的误差会被放大。</strong>这一点和「CFG 去掉 outlier」的说法不同——按后者，误差来自哪一个分支并不重要。</p>

<h3>三个效应，换个角度重读</h3>

<table>
<tbody>
<tr><th>效应</th><th>分布角度</th><th>误差角度</th></tr>
<tr><td>效应一</td><td>按 r 重新分配 mode</td><td>压低因密度铺开而多出来的、本不该存在的 mode</td></tr>
<tr><td>效应二</td><td>朝两个分支更一致的方向移动</td><td>离开 unconditional 分支误差主导的区域</td></tr>
<tr><td>效应三</td><td>mode 变窄</td><td>去掉密度铺得过开带来的额外方差</td></tr>
</tbody>
</table>

<p>这和把 <code>Δ</code> 分解为多个分量来分析的那一类工作是一致的——Li 等人<Cite n={5} />分解出的一项正是「压制 unconditional 数据里普遍存在的通用特征」。同一件事的两种说法。</p>

<h3>最优的 γ 在哪</h3>

<p>γ 太小，误差没抵消完；γ 太大，tilt 带来的偏差超过了被抵消的误差。最优的 γ 就是两者平衡的地方——这就是质量指标对 γ 呈 U 形的原因。</p>

<h3>还有一部分和分布无关</h3>

<p>还有一部分「变好」和分布没关系。人偏好高对比、饱和、构图干净的图像，而<strong>高 γ 恰好给的就是这些</strong>。分布指标衡量不到这一部分，人类评测能，而审美偏好和「更接近真实数据」是两回事，有时甚至相反。</p>

<p>所以「看起来变好」至少是三件事叠在一起：<strong>误差被抵消</strong>（真的变好）、<strong>tilt 带来的偏差</strong>（真的变差）、<strong>审美偏好</strong>（评价标准本身的问题）。把这三件事拆开，是这篇文章想做的事。</p>

<h2><span className="num">06</span>这对训练模型意味着什么</h2>

<p>如果 CFG 本质上是在修模型的误差，有几条可以直接使用的推论。</p>

<h3>CFG 的必要强度，反映的是模型的误差</h3>

<p>极限情况是一个完全准确的模型不需要 CFG，所以模型越准，需要的 γ 越小。反过来也可以利用这一点：Karras 等人<Cite n={4} />用同一个模型刻意训练不足的版本代替 unconditional 分支，让 <code>r</code> 更纯粹地指向误差的方向，ImageNet 上达到 FID 1.01。两条路线的前提相同——CFG 的作用对象是误差，不是条件。</p>

<h3>调 γ 时会遇到两个不同的临界点</h3>

<p>增大 γ 会先后遇到两件事：到某个值时效果最好；继续增大，输出开始出现明显缺陷——图像上是过饱和，几何上是结构崩坏。<strong>这是两个不同的临界点，由不同的因素决定。</strong></p>

<table>
<tbody>
<tr><th /><th>决定因素</th><th>模型变好时</th></tr>
<tr><td>效果最好的那个 γ</td><td>conditional 和 unconditional 两个分支误差的差距</td><td>下降</td></tr>
<tr><td>开始出现缺陷的那个 γ</td><td>模型本身的精度——γ 越大越是在外推</td><td>上升</td></tr>
</tbody>
</table>

<p>所以<strong>随着训练推进，两者之间可用的范围会变宽</strong>。我们没有见到文献报告过这种分离，而在任何一组 checkpoint 上都可以测。跟踪最优 γ 的变化，还能看出 conditional 分支相比 unconditional 分支改进了多少——γ 就不只是推理时调的参数了。</p>

<h3>调度怎么设计</h3>

<table>
<tbody>
<tr><th>区间</th><th>在这里施加 CFG 会得到什么</th></tr>
<tr><td>高噪声</td><td>样本落在哪个 mode、中心往哪个方向移动，全部在这一段决定。去掉这一段等于放弃对结果的控制</td></tr>
<tr><td>低噪声</td><td>只剩效应三在起作用。去掉这一段，收窄就没有了</td></tr>
</tbody>
</table>

<p>所以「只在某一段噪声上施加 CFG」这类调度，<strong>在不同的模型上得到的结果可能完全不同</strong>——取决于该模型的 mode 在哪一段噪声上被决定。这个位置可以测（把 CFG 分段施加，比较 mode 占比），建议先测再定调度。</p>

<details>
<summary>实验是怎么做的</summary>
<div className="det-body">
<p>范围：上面所有实测都在一个模型上完成——一个图像/文本条件的 3D rectified-flow 模型，64³ 的占据场。这些结果能说明的是这个模型上发生了什么，不能替其他模型作保。</p>
<table>
<tbody>
<tr><th /><th /></tr>
<tr><td>模型</td><td>图像/文本条件的 3D rectified-flow，45 步，输出 64³ 连续占据场</td></tr>
<tr><td>规模</td><td>约 13000 个样本，8×B200 上约 5 GPU-小时</td></tr>
<tr><td>γ 网格</td><td>1, 1.25, 1.5, 2, 3, 5, 6, 9, 15, 25。每点 128 个种子</td></tr>
<tr><td>配对</td><td>开 CFG 与不开 CFG 两组共用种子和初始噪声，所以逐样本的比较成立</td></tr>
<tr><td>方差</td><td>样本两两平方距离的均值除以 2（协方差的迹），400 次自助法给标准误</td></tr>
<tr><td>mode 判别</td><td>占据场池化到 16³ 并除以总质量，用手选 exemplar 建的一条轴；留一验证 93.3%</td></tr>
<tr><td>渲染</td><td>DDA 逐面平直着色，法线取射线穿过的立方体面。不是光滑等值面——数据是体素</td></tr>
</tbody>
</table>
<p>几个必须注意的实现细节：γ=1 走的是另一条代码路径（管线按 <code>cfg&gt;1</code> 分支）；「unconditional」分支默认带着出厂的负提示词，不是空串；latent 的欧氏度量几乎分不出条件（九个条件之间总方差只差 12%），所以聚类都在几何特征上做；噪声分段不能按步数索引定义，必须读 denoiser 实际收到的 <code>t′</code>；采样器本身是混沌的，任意微扰在 45 步里都会发散到 0.08–0.11σ，所以 <code>t′&lt;0.6</code> 那一行只有底噪的 1.7 倍，<code>t′&lt;0.8</code> 才是明确的。</p>
</div>
</details>
    </>
  );
}
