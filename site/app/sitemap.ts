import type { MetadataRoute } from 'next';

const BASE = 'https://pptrick.github.io';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['', '/publications', '/building', '/experience', '/blog', '/about'];
  // both languages, English at the root and Chinese under /zh
  return ['', '/zh'].flatMap((prefix) =>
    routes.map((route) => ({
      url: `${BASE}${prefix}${route}/`,
      lastModified: new Date(),
      changeFrequency: (route === '' ? 'monthly' : 'yearly') as 'monthly' | 'yearly',
      priority: route === '' ? (prefix === '' ? 1 : 0.9) : 0.7,
    })),
  );
}
