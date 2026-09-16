export type Lang = 'en' | 'zh';

export const LANGS: Lang[] = ['en', 'zh'];

/**
 * UI strings only. Long-form content — paper titles, abstracts, post bodies —
 * stays in English, because keeping two versions of every abstract in sync is a
 * standing cost with little payoff for this audience. Short content (role,
 * location, tagline, bio) is translated in content/site.yaml.
 */
export const T = {
  en: {
    research: 'Research',
    building: 'Building',
    blog: 'Blog',
    about: 'About',
    cv: 'CV',
    eyebrow: '3D AI / Graphics / Vision',
    selectedResearch: 'Selected research',
    allPublications: 'All publications',
    publicationCount: (n: number) => `${n} publication${n === 1 ? '' : 's'}`,
    researchIntro:
      'Work in 3D reconstruction, object-centric representation learning, and digital humans.',
    experience: 'Experience',
    education: 'Education',
    advisor: 'Advisor',
    equalContribution: 'equal contribution',
    role: 'Role',
    location: 'Location',
    email: 'Email',
    interests: 'Interests',
    present: 'Present',
    notesEyebrow: 'Notes',
    blogEmpty: 'Nothing published yet.',
    buildingEmpty: 'Coming soon.',
    notFound: 'Nothing here',
    notFoundBody: 'That page does not exist. It may have moved when this site was rebuilt.',
    home: 'Home',
    links: {
      paper: 'Paper',
      project: 'Project page',
      code: 'Code',
      video: 'Video',
      poster: 'Poster',
    },
    switchTheme: 'Switch theme',
    switchLang: '切换到中文',
    langLabel: 'EN',
  },
  zh: {
    research: '研究',
    building: '项目',
    blog: '博客',
    about: '关于',
    cv: '简历',
    eyebrow: '3D AI / 图形学 / 视觉',
    selectedResearch: '精选研究',
    allPublications: '全部论文',
    publicationCount: (n: number) => `${n} 篇论文`,
    researchIntro: '研究方向为三维重建、以物体为中心的表征学习，以及数字人。',
    experience: '工作经历',
    education: '教育经历',
    advisor: '导师',
    equalContribution: '同等贡献',
    role: '职位',
    location: '地点',
    email: '邮箱',
    interests: '研究兴趣',
    present: '至今',
    notesEyebrow: '文章',
    blogEmpty: '暂无文章。',
    buildingEmpty: '敬请期待。',
    notFound: '页面不存在',
    notFoundBody: '该页面不存在，可能在网站重建时已经迁移。',
    home: '首页',
    links: {
      paper: '论文',
      project: '项目主页',
      code: '代码',
      video: '视频',
      poster: '海报',
    },
    switchTheme: '切换主题',
    switchLang: 'Switch to English',
    langLabel: '中',
  },
} as const;

export function strings(lang: Lang) {
  return T[lang];
}

/** Prefix a route for the given language. English lives at the root. */
export function href(lang: Lang, path: string): string {
  const clean = path === '/' ? '/' : path;
  return lang === 'en' ? clean : `/zh${clean === '/' ? '/' : clean}`;
}

/** The language a given pathname is in. */
export function langOf(pathname: string): Lang {
  return pathname === '/zh' || pathname.startsWith('/zh/') ? 'zh' : 'en';
}

/** Same page, other language — used by the header toggle. */
export function swapLang(pathname: string): string {
  if (langOf(pathname) === 'zh') {
    const rest = pathname.replace(/^\/zh/, '');
    return rest === '' || rest === '/' ? '/' : rest;
  }
  return pathname === '/' ? '/zh/' : `/zh${pathname}`;
}

/** True for the landing page in either language. */
export function isHomePath(pathname: string): boolean {
  const rest = pathname.replace(/^\/zh/, '').replace(/\/$/, '');
  return rest === '';
}
