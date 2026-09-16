'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { href, langOf, strings, swapLang, type Lang } from '@/lib/i18n';

/** One shape for every control in the header, so they share a baseline and height. */
const CONTROL =
  'inline-flex h-[30px] items-center justify-center gap-1.5 rounded-[3px] border ' +
  'border-[var(--line-2)] px-2.5 font-mono text-[13px] leading-none text-[var(--fg-2)] ' +
  'transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]';

const ROUTES = [
  { path: '/about/', key: 'about' },
  { path: '/experience/', key: 'experience' },
  { path: '/publications/', key: 'research' },
  { path: '/building/', key: 'building' },
  { path: '/blog/', key: 'blog' },
] as const;

function SunIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor"
         strokeWidth="1.3" strokeLinecap="round" aria-hidden="true">
      <circle cx="8" cy="8" r="3.1" />
      <path d="M8 1v1.6M8 13.4V15M1 8h1.6M13.4 8H15M3.1 3.1l1.1 1.1M11.8 11.8l1.1 1.1M12.9 3.1l-1.1 1.1M4.2 11.8l-1.1 1.1" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor"
         strokeWidth="1.3" strokeLinecap="round" aria-hidden="true">
      <path d="M13.2 10.4A5.6 5.6 0 0 1 5.6 2.8a5.6 5.6 0 1 0 7.6 7.6Z" />
    </svg>
  );
}

export function SiteHeader({ name, cvHref }: { name: string; cvHref: string }) {
  const pathname = usePathname() || '/';
  const lang: Lang = langOf(pathname);
  const t = strings(lang);
  const [theme, setTheme] = useState<'dark' | 'light' | null>(null);

  useEffect(() => {
    setTheme(document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark');
  }, []);

  function toggleTheme() {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem('theme', next);
    } catch {
      // private mode or blocked storage: the choice just will not persist
    }
  }

  const isActive = (path: string) => pathname === href(lang, path);

  return (
    <header
      className="relative z-10 border-b"
      style={{ borderColor: 'var(--line)', background: 'var(--bg)' }}
    >
      <nav className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-7 gap-y-3 px-4 py-5 sm:px-8">
        <Link
          href={href(lang, '/')}
          className="font-mono text-[0.9375rem] font-medium tracking-tight [word-spacing:-0.2em] hover:text-[var(--accent)]"
        >
          {name}
        </Link>

        <span className="grow" />

        {ROUTES.map((r) => (
          <Link
            key={r.path}
            href={href(lang, r.path)}
            aria-current={isActive(r.path) ? 'page' : undefined}
            className={
              'font-mono text-[13px] tracking-wide underline-offset-[6px] decoration-[var(--accent)] hover:text-[var(--fg)] hover:underline ' +
              (isActive(r.path) ? 'text-[var(--fg)] underline' : 'text-[var(--fg-2)]')
            }
          >
            {t[r.key]}
          </Link>
        ))}

        <a href={cvHref} className={CONTROL}>
          {t.cv}
        </a>

        {/* Language and theme share the control shape, so the row has one baseline. */}
        <Link href={swapLang(pathname)} className={CONTROL} title={t.switchLang} aria-label={t.switchLang}>
          {lang === 'en' ? 'EN' : '中'}
        </Link>

        <button
          type="button"
          onClick={toggleTheme}
          className={CONTROL}
          title={t.switchTheme}
          aria-label={t.switchTheme}
        >
          {theme === 'light' ? <MoonIcon /> : <SunIcon />}
        </button>
      </nav>
    </header>
  );
}
