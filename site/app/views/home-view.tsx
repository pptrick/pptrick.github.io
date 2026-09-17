import Link from 'next/link';
import Image from 'next/image';
import { Fragment } from 'react';
import { getSite } from '@/lib/content';
import { href, localized, strings, type Lang } from '@/lib/i18n';

export function HomeView({ lang }: { lang: Lang }) {
  const t = strings(lang);
  const site = getSite();
  const destinations = [
    { path: '/about/', label: t.about },
    { path: '/experience/', label: t.experience },
    { path: '/publications/', label: t.research },
    { path: '/building/', label: t.building },
    { path: '/blog/', label: t.blog },
  ];

  return (
    <section className="home-hero" aria-labelledby="home-name">
      <div className="home-intro">
        <Link href={href(lang, '/about/')} className="home-portrait" aria-label={lang === 'zh' ? `关于${site.nameZh}` : `About ${site.name}`}>
          <Image src="/images/profile.jpg" alt="" width={750} height={750} priority sizes="(max-width: 600px) 160px, 208px" />
        </Link>
        <h1 id="home-name" className="home-name">{localized(lang, site.name, site.nameZh)}</h1>
        <p className="home-statement">
          <span>{lang === 'zh' ? '构建系统，探索' : 'Building systems for'}</span>
          {/* English breaks the emphasised clause onto its own line, so it needs
              the word space. Chinese keeps the clause inline and sets no space
              across the join — 探索三维 is one phrase, not two words. */}
          {lang === 'en' ? ' ' : null}
          <span className="home-statement-focus">
            {lang === 'zh' ? '三维世界建模与生成。' : '3D world modeling and generation.'}
          </span>
          <span className="home-statement-coda">
            {lang === 'zh' ? '以混合现实释放想象力。' : 'Unleashing imagination through mixed reality.'}
          </span>
        </p>

        <nav className="home-actions" aria-label={lang === 'zh' ? '了解更多' : 'Explore my work'}>
          {destinations.map(({ path, label }, index) => (
            <Fragment key={path}>
              <span className="home-action">
                <Link href={href(lang, path)}>{label}</Link>
                {index < destinations.length - 1 && <span className="home-action-separator" aria-hidden="true">·</span>}
              </span>
              {index === 2 && <span className="home-action-break" aria-hidden="true" />}
            </Fragment>
          ))}
        </nav>
      </div>
    </section>
  );
}
