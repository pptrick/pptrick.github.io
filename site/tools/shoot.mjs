// Screenshot a page AFTER a delay, which `chrome --screenshot` cannot do:
// it fires at the load event, before a dynamically imported WebGL scene has
// fetched its geometry, compiled shaders and faded in.
// Usage: node shoot.mjs <debugPort> <url> <outFile> <waitMs> [width] [height]
import { writeFileSync } from 'node:fs';

const [, , port, url, out, waitMs = '6000', w = '1440', h = '900'] = process.argv;

const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
const page = targets.find((t) => t.type === 'page');
if (!page) throw new Error('no page target');

const ws = new WebSocket(page.webSocketDebuggerUrl);
let id = 0;
const pending = new Map();

const send = (method, params = {}) =>
  new Promise((resolve) => {
    const msgId = ++id;
    pending.set(msgId, resolve);
    ws.send(JSON.stringify({ id: msgId, method, params }));
  });

ws.addEventListener('message', (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg.result);
    pending.delete(msg.id);
  }
  // surface page console errors, which is half the point of doing this
  if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type !== 'log') {
    const text = msg.params.args.map((a) => a.value ?? a.description ?? '').join(' ');
    console.error(`  [console.${msg.params.type}] ${text}`);
  }
  if (msg.method === 'Runtime.exceptionThrown') {
    console.error(`  [exception] ${msg.params.exceptionDetails.text}`);
  }
});

await new Promise((r) => ws.addEventListener('open', r));
await send('Runtime.enable');
await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', {
  width: Number(w), height: Number(h), deviceScaleFactor: 1, mobile: false,
});
await send('Page.navigate', { url });
await new Promise((r) => setTimeout(r, Number(waitMs)));

const shot = await send('Page.captureScreenshot', { format: 'png' });
writeFileSync(out, Buffer.from(shot.data, 'base64'));
console.log(`wrote ${out}`);
ws.close();
process.exit(0);
