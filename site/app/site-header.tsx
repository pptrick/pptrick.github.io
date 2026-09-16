'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { href, isHomePath, langOf, strings, swapLang, type Lang } from '@/lib/i18n';

const ROUTES = [
  { path: '/about/', key: 'about' },
  { path: '/experience/', key: 'experience' },
  { path: '/publications/', key: 'research' },
  { path: '/building/', key: 'building' },
  { path: '/blog/', key: 'blog' },
] as const;

function SunIcon() {
  return (
    <svg viewBox="0 0 16 16" width="18" height="18" fill="none" stroke="currentColor"
         strokeWidth="1.3" strokeLinecap="round" aria-hidden="true">
      <circle cx="8" cy="8" r="3.1" />
      <path d="M8 1v1.6M8 13.4V15M1 8h1.6M13.4 8H15M3.1 3.1l1.1 1.1M11.8 11.8l1.1 1.1M12.9 3.1l-1.1 1.1M4.2 11.8l-1.1 1.1" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 16 16" width="18" height="18" fill="none" stroke="currentColor"
         strokeWidth="1.3" strokeLinecap="round" aria-hidden="true">
      <path d="M13.2 10.4A5.6 5.6 0 0 1 5.6 2.8a5.6 5.6 0 1 0 7.6 7.6Z" />
    </svg>
  );
}

export function SiteHeader({ name, cvHref }: { name: string; cvHref: string }) {
  const pathname = usePathname() || '/';
  const lang: Lang = langOf(pathname);
  const isHome = isHomePath(pathname);
  const t = strings(lang);
  const [theme, setTheme] = useState<'dark' | 'light' | null>(null);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: light)');
    const syncTheme = () => {
      const explicit = document.documentElement.getAttribute('data-theme');
      setTheme(explicit === 'light' || explicit === 'dark' ? explicit : media.matches ? 'light' : 'dark');
    };
    syncTheme();
    media.addEventListener('change', syncTheme);
    return () => media.removeEventListener('change', syncTheme);
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
  const themeLabel = lang === 'zh'
    ? (theme === 'light' ? '切换到深色模式' : '切换到浅色模式')
    : (theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme');

  return (
    <header
      className={`site-header relative z-10 border-b${isHome ? ' site-header--home' : ''}`}
      style={{ borderColor: 'var(--line)', background: 'var(--bg)' }}
    >
      <nav aria-label={lang === 'zh' ? '主导航' : 'Main navigation'} className="site-navigation mx-auto flex h-[var(--header-h)] max-w-7xl items-center gap-x-7 px-4 sm:px-8">
        <Link
          href={href(lang, '/')}
          className="site-brand font-mono text-[0.9375rem] font-medium tracking-tight [word-spacing:-0.2em] hover:text-[var(--accent)]"
        >
          {name}
        </Link>

        <span className="grow" />

        {!isHome && <div className="site-navigation-links">
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
        </div>}

        <div className="site-utilities">
          <a href={cvHref} className="site-cv" aria-label={lang === 'zh' ? '查看简历（PDF）' : 'View CV (PDF)'}>
            {t.cv}<span aria-hidden="true">↗</span>
          </a>
          <div className="site-preferences">
            <div className="language-switch" role="group" aria-label={lang === 'zh' ? '语言' : 'Language'}>
              {(['en', 'zh'] as const).map((option) => {
                const label = option === 'en' ? 'EN' : '中文';
                return option === lang ? (
                  <span key={option} lang={option} aria-current="true" className="language-option language-option--active">{label}</span>
                ) : (
                  <Link key={option} href={swapLang(pathname)} hrefLang={option} lang={option} className="language-option" aria-label={t.switchLang}>
                    {label}
                  </Link>
                );
              })}
            </div>
            <button type="button" onClick={toggleTheme} className="theme-toggle" title={themeLabel} aria-label={themeLabel}>
              {theme === 'light' ? <MoonIcon /> : <SunIcon />}
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}
