// Measure whether a page overflows its viewport, at several window sizes.
// Usage: node measure.mjs <debugPort> <url> "<w>x<h>,<w>x<h>,..."
import { writeFileSync } from 'node:fs';

const [, , port, url, sizes, shotPrefix] = process.argv;

const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
const page = targets.find((t) => t.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
let id = 0;
const pending = new Map();
const send = (method, params = {}) =>
  new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });

ws.addEventListener('message', (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); }
  if (m.method === 'Runtime.exceptionThrown') console.error('  [exception]', m.params.exceptionDetails.text);
});
await new Promise((r) => ws.addEventListener('open', r));
await send('Runtime.enable');
await send('Page.enable');

for (const size of sizes.split(',')) {
  const [w, h] = size.split('x').map(Number);
  await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url });
  await new Promise((r) => setTimeout(r, 6000));

  const { result } = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const d = document.documentElement;
      const overflowY = d.scrollHeight - d.clientHeight;
      const overflowX = d.scrollWidth - d.clientWidth;
      const cs = getComputedStyle(d);
      // does anything actually get cut off inside the hero?
      const hero = document.querySelector('section');
      let clipped = null;
      if (hero) {
        const hb = hero.getBoundingClientRect();
        const kids = [...hero.querySelectorAll('*')].filter(e => e.children.length === 0 && e.textContent.trim());
        const worst = kids.reduce((acc, e) => {
          const r = e.getBoundingClientRect();
          return Math.max(acc, Math.max(0, r.bottom - hb.bottom), Math.max(0, hb.top - r.top));
        }, 0);
        clipped = Math.round(worst);
      }
      return { overflowY, overflowX, htmlOverflow: cs.overflow, clipped,
               heroH: hero ? Math.round(hero.getBoundingClientRect().height) : null };
    })()`,
  });
  const v = result.value;
  const verdict = v.overflowY <= 0 && v.overflowX <= 0 && v.clipped === 0 ? 'FITS' : 'PROBLEM';
  console.log(`  ${size.padEnd(10)} overflowY ${String(v.overflowY).padStart(5)}  overflowX ${String(v.overflowX).padStart(4)}  ` +
              `html.overflow=${v.htmlOverflow.padEnd(7)} hero ${String(v.heroH).padStart(4)}px  clipped ${v.clipped}px  ${verdict}`);

  if (shotPrefix) {
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    writeFileSync(`${shotPrefix}-${size}.png`, Buffer.from(shot.data, 'base64'));
  }
}
ws.close();
process.exit(0);
