// Writes `lang` onto <html> in the exported pages.
//
// Next's App Router has a single root layout for both language trees, so a
// literal `lang` in the JSX would be wrong for one of them; multiple root
// layouts via route groups would fix it, but they force a full page load on
// every language switch (tearing down the WebGL scene) and leave `not-found`
// without a root layout to render in. So the attribute is stamped here
// instead, where the language is just the output path.
//
// This is the copy a crawler reads, and it has to agree with the hreflang
// tags — a Chinese page declaring lang="en" contradicts its own alternates.
import { access, readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const OUT = new URL('../out/', import.meta.url).pathname;
const PUBLIC = new URL('../public/', import.meta.url).pathname;

const exists = (path) => access(path).then(() => true, () => false);

async function* pages(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* pages(path);
    else if (entry.name.endsWith('.html')) yield path;
  }
}

let stamped = 0;
for await (const file of pages(OUT)) {
  const rel = relative(OUT, file);
  // public/ is copied into out/ byte-for-byte, and it holds the legacy
  // redirect pages, which carry their own <html> tag. Those are not ours.
  if (await exists(join(PUBLIC, rel))) continue;
  const segments = rel.split(sep);
  const lang = segments[0] === 'zh' ? 'zh-CN' : 'en';
  const html = await readFile(file, 'utf8');
  // Next emits the opening tag verbatim from the layout, so it is `<html>`
  // with no attributes. Fail loudly rather than silently skipping: a changed
  // layout that reintroduces `lang` must not leave this step quietly inert.
  if (!html.includes('<html>')) {
    throw new Error(`no bare <html> tag in ${rel} — has the root layout changed?`);
  }
  await writeFile(file, html.replace('<html>', `<html lang="${lang}">`));
  stamped++;
}
console.log(`stamped lang on ${stamped} exported pages`);
