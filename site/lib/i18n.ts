export type Lang = 'en' | 'zh';

export const LANGS: Lang[] = ['en', 'zh'];

/**
 * UI strings only; the content files carry their own translations.
 *
 * What deliberately stays in English on the Chinese pages: paper titles, author
 * names, venue names, company names, and terms of art that are read in English
 * by the people who work in this field (NeRF, LiDAR, PyTorch, CUDA). Everything
 * written as prose — roles, bullets, summaries, locations, university and
 * department names — is translated.
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
      'Work across 3D reconstruction and 3D generative models, and the representations underneath them — from LiDAR scenes to part-level mesh generation.',
    experience: 'Experience',
    education: 'Education',
    advisor: 'Advisor',
    equalContribution: 'equal contribution',
    roles: { 'project-lead': 'Project lead' },
    // Search-result copy. Distinct per page: a shared description gives Google
    // nothing to distinguish twelve pages by.
    meta: {
      home: 'Chuanyu Pan is Research Tech Lead at Meshy, building systems for 3D world modeling and generation, 3D foundation models, and mixed reality.',
      about: 'About Chuanyu Pan — Research Tech Lead at Meshy. Master of Engineering from UC Berkeley, bachelor from Tsinghua University. Computer graphics and 3D vision.',
      experience: 'Chuanyu Pan: Research Tech Lead at Meshy, previously Honda Research Institute and the FHL Vive Center at UC Berkeley. Education at Berkeley, Stanford and Tsinghua.',
      research: 'Publications by Chuanyu Pan on 3D reconstruction and 3D generative models, at SIGGRAPH Asia, CVPR, ICLR and CoRL — including SAM3D-Part, Faithful Contouring and LiDARGrid.',
      building: 'Systems and products Chuanyu Pan has built, including 3D foundation model work at Meshy.',
      blog: 'Notes by Chuanyu Pan on 3D reconstruction, 3D generation and graphics research.',
    },
    role: 'Role',
    location: 'Location',
    email: 'Email',
    interests: 'Interests',
    present: 'Present',
    notesEyebrow: 'Notes',
    blogIntro:
      'Long-form notes on generative 3D: what a method actually does, worked out on an idealised model and then checked against measurements on a real one.',
    readingTime: (n: number) => `${n} min read`,
    backToBlog: 'All posts',
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
    researchIntro: '研究涵盖三维重建与三维生成模型，以及支撑它们的表征方式——从 LiDAR 场景到部件级网格生成。',
    experience: '工作经历',
    education: '教育经历',
    advisor: '导师',
    equalContribution: '同等贡献',
    roles: { 'project-lead': '项目负责人' },
    meta: {
      home: '潘传宇（Chuanyu Pan），Meshy 研究技术负责人，研究三维世界建模与生成、三维基础模型与混合现实。',
      about: '关于潘传宇（Chuanyu Pan）——Meshy 研究技术负责人，加州大学伯克利分校工程硕士、清华大学学士，方向为计算机图形学与三维视觉。',
      experience: '潘传宇的经历：Meshy 研究技术负责人，此前任职于 Honda Research Institute 与加州大学伯克利分校 FHL Vive Center，曾就读于加州大学伯克利分校、斯坦福大学与清华大学。',
      research: '潘传宇（Chuanyu Pan）在三维重建与三维生成模型方向的论文，发表于 SIGGRAPH Asia、CVPR、ICLR 与 CoRL，包括 SAM3D-Part、Faithful Contouring 与 LiDARGrid。',
      building: '潘传宇构建的系统与产品，包括 Meshy 的三维基础模型工作。',
      blog: '潘传宇关于三维重建、三维生成与图形学研究的文章。',
    },
    role: '职位',
    location: '地点',
    email: '邮箱',
    interests: '研究兴趣',
    present: '至今',
    notesEyebrow: '文章',
    blogIntro: '关于三维生成的长文：一个方法到底做了什么，先在理想模型上推出来，再到真实模型上测一遍。',
    readingTime: (n: number) => `阅读约 ${n} 分钟`,
    backToBlog: '全部文章',
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

/**
 * Picks a translated value, falling back to the English one.
 *
 * Every translated content field is optional, so an entry added without a
 * translation renders in English rather than as a blank — the alternative is a
 * required field that invites a placeholder.
 */
export function localized<T>(lang: Lang, en: T, zh: T | null | undefined): T {
  return lang === 'zh' && zh != null ? zh : en;
}

/** Chinese uses a full-width comma, and sets no space around it. */
export function listSeparator(lang: Lang): string {
  return lang === 'zh' ? '\uff0c' : ', ';
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
