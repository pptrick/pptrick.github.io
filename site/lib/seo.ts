import type { Metadata } from 'next';
import { getSite } from './content';
import { href, type Lang } from './i18n';

export const SITE_URL = 'https://pptrick.github.io';

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

  return {
    // Passing `title: undefined` CLEARS the layout's title.default and the page
    // ships with no <title> at all, so the key is omitted instead. The landing
    // pages get an absolute title — on /zh it carries both scripts, which is
    // what someone searching 潘传宇 will match.
    ...(title
      ? { title }
      : {
          title: {
            absolute: lang === 'zh' ? `${site.name} ${site.nameZh}` : site.name,
          },
        }),
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
      title: title ? `${title} · ${site.name}` : site.name,
      description,
      url,
      siteName: site.name,
      locale: lang === 'zh' ? 'zh_CN' : 'en_US',
      alternateLocale: lang === 'zh' ? 'en_US' : 'zh_CN',
    },
    twitter: {
      card: 'summary_large_image',
      title: title ? `${title} · ${site.name}` : site.name,
      description,
    },
  };
}
