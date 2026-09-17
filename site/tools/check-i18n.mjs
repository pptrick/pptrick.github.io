// Fails the build when English content has been added without its Chinese
// counterpart.
//
// Every `*Zh` field in content/ is optional, so the site never renders a blank
// — it falls back to English. That fallback is exactly the problem: a new
// publication or role would quietly appear in English on /zh and nobody would
// notice. This turns that silence into a build error naming each missing field,
// so adding English content forces the translation to be written.
//
// Run it on its own with `npm run i18n:check`.
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import yaml from 'js-yaml';
import matter from 'gray-matter';

const CONTENT = new URL('../content/', import.meta.url).pathname;

/**
 * Fields whose Chinese counterpart is required, by file.
 *
 * Deliberately absent, because they stay English on both trees: publication
 * `title` and `authors` (that is how a paper is cited and searched), `venue`
 * for a named conference, `advisor` and other personal names, `org` for a
 * company, and `links`. Where a venue is prose rather than a name — "arXiv
 * preprint" — the translation lives in `venueZh` and is checked below.
 */
const RULES = {
  'site.yaml': { fields: ['name', 'title', 'location', 'tagline', 'bio', 'interests'] },
  'experience.yaml': {
    each: true,
    fields: ['location'],
    nested: { roles: ['title', 'bullets'] },
  },
  'education.yaml': {
    each: true,
    fields: ['school', 'department', 'degree', 'field'],
  },
};

const problems = [];

/** Reports `field` unless its `fieldZh` sibling is present and non-empty. */
function require_(obj, field, where) {
  if (obj[field] === undefined || obj[field] === null) return; // nothing to translate
  const zh = obj[`${field}Zh`];
  const missing =
    zh === undefined || zh === null || (Array.isArray(zh) ? zh.length === 0 : zh === '');
  if (missing) problems.push(`${where}: ${field}Zh is missing`);
  else if (Array.isArray(obj[field]) && Array.isArray(zh) && obj[field].length !== zh.length)
    problems.push(
      `${where}: ${field} has ${obj[field].length} entries but ${field}Zh has ${zh.length}`,
    );
}

for (const [file, rule] of Object.entries(RULES)) {
  const doc = yaml.load(await readFile(join(CONTENT, file), 'utf8'));
  const entries = rule.each ? doc : [doc];

  entries.forEach((entry, i) => {
    const label = rule.each
      ? `content/${file}[${i}] (${entry.org ?? entry.school ?? ''})`
      : `content/${file}`;
    for (const field of rule.fields) require_(entry, field, label);
    for (const [key, fields] of Object.entries(rule.nested ?? {})) {
      (entry[key] ?? []).forEach((child, j) => {
        for (const field of fields) require_(child, field, `${label}.${key}[${j}]`);
      });
    }
  });
}

const pubDir = join(CONTENT, 'publications');
for (const file of (await readdir(pubDir)).filter((f) => f.endsWith('.md')).sort()) {
  const { data, content } = matter(await readFile(join(pubDir, file), 'utf8'));
  const label = `content/publications/${file}`;
  // The summary is the markdown body, so it has no `*Zh` sibling to check.
  if (content.trim() && !data.summaryZh) problems.push(`${label}: summaryZh is missing`);
  // A venue that is prose rather than a conference name needs translating; a
  // named conference does not. "preprint" is the only prose case so far.
  if (/preprint/i.test(data.venue ?? '')) require_(data, 'venue', label);
  if (/oral|poster|presentation/i.test(data.venueNote ?? '')) require_(data, 'venueNote', label);
}

if (problems.length > 0) {
  console.error(
    `\nMissing Chinese translations (${problems.length}):\n` +
      problems.map((p) => `  ${p}`).join('\n') +
      '\n\nThe Chinese pages fall back to English for each of these, so they ' +
      'would ship half-translated.\nAdd the field, or ask Claude to translate ' +
      'the entry.\n',
  );
  process.exit(1);
}

console.log('i18n: every translated field is present');
