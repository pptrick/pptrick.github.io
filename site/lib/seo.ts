import type { Metadata } from 'next';
import { getSite } from './content';
import { href, type Lang } from './i18n';
import { SITE_URL } from './site-url';

export { SITE_URL };

/** Absolute URL for a route in a given language. */
export function absolute(lang: Lang, path: string): string {
  return `${SITE_URL}${href(lang, path)}`;
}

/**
 * Per-route metadata.
 *
 * Without this every page inherited the root's openGraph block, so all twelve
 * declared og:url as the site root — a share of /publications/ resolved to the
 * homepage. Each page now carries its own canonical, its own og:url, and
 * hreflang alternates pointing at its counterpart in the other language, so the
 * two language trees are understood as translations rather than duplicates.
 */
export function pageMetadata(opts: {
  lang: Lang;
  path: string;
  title?: string;
  description: string;
}): Metadata {
  const { lang, path, title, description } = opts;
  const site = getSite();
  const url = absolute(lang, path);
  const displayName = lang === 'zh' ? site.nameZh : site.name;

  return {
    // Always absolute, never the layout's `%s · Chuanyu Pan` template: the
    // template is fixed at the layout and would put the English name after a
    // Chinese page title. Passing `title: undefined` is also not an option —
    // it clears the layout's title.default and the page ships with no <title>
    // at all. The landing pages carry both scripts, which is what someone
    // searching 潘传宇 will match.
    title: {
      absolute: title
        ? `${title} · ${displayName}`
        : lang === 'zh'
          ? `${site.nameZh} ${site.name}`
          : site.name,
    },
    description,
    alternates: {
      canonical: url,
      languages: {
        en: absolute('en', path),
        'zh-CN': absolute('zh', path),
        // x-default points at the language an unmatched visitor should get
        'x-default': absolute('en', path),
      },
    },
    openGraph: {
      type: path === '/' ? 'profile' : 'website',
      title: title ? `${title} · ${displayName}` : displayName,
      description,
      url,
      siteName: site.name,
      locale: lang === 'zh' ? 'zh_CN' : 'en_US',
      alternateLocale: lang === 'zh' ? 'en_US' : 'zh_CN',
    },
    twitter: {
      card: 'summary_large_image',
      title: title ? `${title} · ${displayName}` : displayName,
      description,
    },
  };
}
