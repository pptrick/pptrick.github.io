import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import matter from 'gray-matter';
import { z } from 'zod';

const CONTENT = path.join(process.cwd(), 'content');

/* ------------------------------------------------------------------ *
 * Schemas. These run at build time, so a typo in a content file fails
 * `npm run build` with a real message instead of rendering "undefined"
 * onto the live site.
 * ------------------------------------------------------------------ */

const YearMonth = z
  .string()
  .regex(/^(\d{4}-\d{2}|present)$/, 'expected YYYY-MM or "present"');

const SiteSchema = z.object({
  name: z.string(),
  nameZh: z.string(),
  me: z.string(),
  title: z.string(),
  titleZh: z.string().optional(),
  org: z.string(),
  orgUrl: z.string().url(),
  location: z.string(),
  locationShort: z.string().optional(),
  locationZh: z.string().optional(),
  email: z.string().email(),
  tagline: z.string(),
  taglineZh: z.string().optional(),
  interests: z.array(z.string()),
  interestsZh: z.array(z.string()).optional(),
  bio: z.string(),
  bioZh: z.string().optional(),
  links: z.object({
    github: z.string().url(),
    scholar: z.string().url(),
    linkedin: z.string().url(),
    cv: z.string(),
  }),
});

const RoleSchema = z.object({
  title: z.string(),
  start: YearMonth,
  end: YearMonth,
  bullets: z.array(z.string()).default([]),
});

const ExperienceSchema = z.array(
  z.object({
    org: z.string(),
    url: z.string().url().optional(),
    location: z.string().optional(),
    roles: z.array(RoleSchema).min(1),
    advisor: z.string().optional(),
    stack: z.array(z.string()).default([]),
  }),
);

const EducationSchema = z.array(
  z.object({
    school: z.string(),
    department: z.string(),
    degree: z.string(),
    field: z.string().optional(),
    start: YearMonth,
    end: YearMonth,
    logo: z.string().optional(),
  }),
);

const PublicationSchema = z.object({
  title: z.string(),
  authors: z.array(z.string()).min(1),
  equalContribution: z.boolean().default(false),
  venue: z.string(),
  venueShort: z.string().optional(),
  venueNote: z.string().optional(),
  year: z.number().int(),
  date: z.coerce.date(),
  thumb: z.string(),
  featured: z.boolean().default(false),
  links: z
    .object({
      paper: z.string().optional(),
      project: z.string().optional(),
      code: z.string().optional(),
      video: z.string().optional(),
      poster: z.string().optional(),
    })
    .default({}),
});

export type Site = z.infer<typeof SiteSchema>;
export type Experience = z.infer<typeof ExperienceSchema>;
export type Education = z.infer<typeof EducationSchema>;
export type Publication = z.infer<typeof PublicationSchema> & {
  slug: string;
  abstract: string;
};

/* ------------------------------------------------------------------ */

/** Renders zod issues as "path: message" lines, so a bad content file names itself. */
function explain(error: z.ZodError): string {
  return error.issues
    .map((issue) => `  ${issue.path.join('.') || '(root)'}: ${issue.message}`)
    .join('\n');
}

// Generic over the schema, not over its output: z.ZodType<T> collapses zod's
// input and output types, which breaks as soon as a field has a .default().
function readYaml<S extends z.ZodTypeAny>(file: string, schema: S): z.infer<S> {
  const raw = yaml.load(fs.readFileSync(path.join(CONTENT, file), 'utf8'));
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(`content/${file} is invalid:\n${explain(parsed.error)}`);
  }
  return parsed.data;
}

export function getSite(): Site {
  return readYaml('site.yaml', SiteSchema);
}

export function getExperience(): Experience {
  return readYaml('experience.yaml', ExperienceSchema);
}

export function getEducation(): Education {
  return readYaml('education.yaml', EducationSchema);
}

/** Two lines at the card's column width. */
const SUMMARY_MAX = 155;

export function getPublications(): Publication[] {
  const dir = path.join(CONTENT, 'publications');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'));

  const pubs = files.map((file) => {
    const slug = file.replace(/\.md$/, '');
    const { data, content } = matter(fs.readFileSync(path.join(dir, file), 'utf8'));
    const parsed = PublicationSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error(
        `content/publications/${file} is invalid:\n${explain(parsed.error)}`,
      );
    }
    // The card shows this as a two-line summary, not a full abstract. Enforced
    // here so it fails the build rather than quietly reflowing to three lines;
    // the cap is measured against the card's column width.
    const abstract = content.trim();
    if (abstract.length > SUMMARY_MAX) {
      throw new Error(
        `content/publications/${file}: summary is ${abstract.length} characters, ` +
          `over the ${SUMMARY_MAX} limit. It renders on the card as at most two ` +
          `lines — condense it to the paper's actual contribution.`,
      );
    }
    return { ...parsed.data, slug, abstract };
  });

  return pubs.sort((a, b) => b.date.getTime() - a.date.getTime());
}

/* ---------------------------- formatting --------------------------- */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "2023-11" -> "Nov 2023" / "2023 年 11 月"; "present" -> "Present" / "至今" */
export function formatMonth(value: string, lang: 'en' | 'zh' = 'en'): string {
  if (value === 'present') return lang === 'zh' ? '至今' : 'Present';
  const [year, month] = value.split('-');
  if (lang === 'zh') return `${year} 年 ${Number(month)} 月`;
  return `${MONTHS[Number(month) - 1]} ${year}`;
}

export function formatRange(start: string, end: string, lang: 'en' | 'zh' = 'en'): string {
  return `${formatMonth(start, lang)} – ${formatMonth(end, lang)}`;
}
