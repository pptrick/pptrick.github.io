'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { isHomePath, langOf } from '@/lib/i18n';

/**
 * Keeps the two per-route attributes of <html> in sync during client
 * navigation: the landing lock, and the language.
 *
 * `lang` is not written in the layout's JSX. A static export has one root
 * layout for both language trees, so any literal there would be wrong for one
 * of them — and if React held `lang` in its virtual DOM it would patch the
 * correct value back to the literal on hydration. So the attribute is left out
 * of the tree entirely: `tools/stamp-lang.mjs` writes the right one into every
 * exported file after the build (which is what a crawler reads), and this
 * effect maintains it across soft navigation (which is what a visitor gets).
 */
export function RootAttributes() {
  const pathname = usePathname() || '/';
  const landing = isHomePath(pathname);
  const lang = langOf(pathname);

  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  }, [lang]);

  useEffect(() => {
    // The landing page is a fixed frame: it fills the window exactly and does
    // not scroll. Every other page scrolls normally, so the lock is per route.
    const root = document.documentElement;
    root.classList.toggle('landing', landing);
    return () => root.classList.remove('landing');
  }, [landing]);

  return null;
}
