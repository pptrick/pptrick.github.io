import { localized, type Lang } from './i18n';

/**
 * The blog index. Posts are written as React components under app/blog/<slug>/
 * — they carry interactive figures, which markdown could not — so this file
 * is the one place that knows a post exists. Add an entry here and the index,
 * the sitemap and the structured data all pick it up.
 */
export type Post = {
  slug: string;
  /** ISO date, YYYY-MM-DD. */
  date: string;
  eyebrow: string;
  eyebrowZh: string;
  title: string;
  titleZh: string;
  /** One or two sentences; doubles as the article's standfirst and the meta description. */
  summary: string;
  summaryZh: string;
  /** Reading time differs by script: Chinese reads faster per character. */
  minutes: number;
  minutesZh: number;
};

const POSTS: Post[] = [
  {
    slug: 'cfg',
    date: '2026-09-21',
    eyebrow: 'Classifier-free guidance',
    eyebrowZh: 'Classifier-free guidance',
    title: 'What CFG actually does',
    titleZh: 'CFG 到底做了什么',
    summary:
      'Classifier-free guidance is switched on in almost every diffusion and flow sampler. It improves prompt adherence and usually quality — but what it does to the output distribution is still disputed. An idealised model, measured against a real 3D generator.',
    summaryZh:
      'CFG 是扩散模型和流模型采样时几乎默认开启的技巧，公认能让输出更贴合条件，生成质量通常也更高。但 CFG 对输出分布究竟做了什么，一直没有共识。',
    minutes: 28,
    minutesZh: 22,
  },
];

export function getPosts(): Post[] {
  return [...POSTS].sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPost(slug: string): Post {
  const post = POSTS.find((p) => p.slug === slug);
  if (!post) throw new Error(`no post with slug "${slug}" in lib/posts.ts`);
  return post;
}

export function postTitle(lang: Lang, post: Post): string {
  return localized(lang, post.title, post.titleZh);
}

export function postSummary(lang: Lang, post: Post): string {
  return localized(lang, post.summary, post.summaryZh);
}

/** "2026-09-21" -> "Sep 21, 2026" / "2026 年 9 月 21 日" */
export function formatDate(iso: string, lang: Lang): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (lang === 'zh') return `${y} 年 ${m} 月 ${d} 日`;
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}
