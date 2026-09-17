import type { MetadataRoute } from 'next';
import { SITE_URL as BASE } from '@/lib/site-url';

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
      // declaring the pair in the sitemap as well as in <link rel=alternate>
      // is what Google recommends for reliable language pairing
      alternates: {
        languages: {
          en: `${BASE}${route}/`,
          'zh-CN': `${BASE}/zh${route}/`,
        },
      },
    })),
  );
}
