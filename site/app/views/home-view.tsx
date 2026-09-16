import Link from 'next/link';
import Image from 'next/image';
import { getSite } from '@/lib/content';
import { href, strings, type Lang } from '@/lib/i18n';

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <path d={diagonal ? 'M6 18 18 6M6 6h12v12' : 'M4 12h15m-6-6 6 6-6 6'} />
    </svg>
  );
}

export function HomeView({ lang }: { lang: Lang }) {
  const t = strings(lang);
  const site = getSite();

  return (
    <section className="home-hero" aria-labelledby="home-name">
      <div className="home-intro">
        <p className="home-discipline"><span aria-hidden="true" />{t.eyebrow}</p>
        <h1 id="home-name" className="home-name">{site.name}</h1>
        <p className="home-statement">
          {lang === 'zh'
            ? '我构建重建与生成三维世界的系统。'
            : <>I build systems that reconstruct<br className="home-line-break" /> and generate 3D worlds.</>}
        </p>

        <div className="home-profile">
          <Link href={href(lang, '/about/')} className="home-portrait" aria-label={lang === 'zh' ? `关于${site.nameZh}` : `About ${site.name}`}>
            <Image src="/images/profile.jpg" alt="" width={750} height={750} priority sizes="64px" />
          </Link>
          <div>
            <p className="home-role">
              {(lang === 'zh' ? site.titleZh : site.title) ?? site.title}
              <span className="home-role-separator" aria-hidden="true"> / </span>
              <a href={site.orgUrl}>{site.org}</a>
            </p>
            <p className="home-location">{(lang === 'zh' ? site.locationZh : site.locationShort) ?? site.location}</p>
          </div>
        </div>

        <nav className="home-actions" aria-label={lang === 'zh' ? '了解更多' : 'Explore my work'}>
          <Link className="home-research-link" href={href(lang, '/publications/')}>
            {t.selectedResearch}<Arrow />
          </Link>
          <Link className="home-about-link" href={href(lang, '/about/')}>
            {lang === 'zh' ? '关于我' : 'About me'}<Arrow diagonal />
          </Link>
        </nav>
      </div>
    </section>
  );
}
