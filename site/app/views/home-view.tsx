import Link from 'next/link';
import Image from 'next/image';
import { getSite } from '@/lib/content';
import { href, strings, type Lang } from '@/lib/i18n';

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
    <div>
      {/* The WebGL bunny lands behind this block; the text composition is final. */}
      <section className="flex min-h-[calc(100svh-4.75rem)] flex-col justify-center py-16 pb-[14vh]">
        {/* The photo centres on the text column while the copy stays flush
            left — the asymmetry is deliberate. Photo above the name is
            GitHub-profile style; it keeps the hero to two columns
            (profile | scene) rather than three. The studio photo is used
            exactly as shot: a circular crop makes the white background a
            non-issue. Swap rounded-full for rounded-[3px] to get a plate. */}
        <div className="pointer-events-auto max-w-[42rem]">
          {/* Centred on a 25rem span rather than on the 42rem copy column, so it
              sits clearly left of the column's centre rather than drifting
              right. Narrow this span to move the photo further left. */}
          <div className="mb-10 max-w-[25rem]">
            <div className="mx-auto aspect-square w-[11rem] overflow-hidden rounded-full border border-[var(--line-2)] bg-[var(--surface)] sm:w-52 lg:w-[16rem]">
              <Image
                src="/images/profile.jpg"
                alt={site.name}
                width={750}
                height={750}
                priority
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          {/* Slashes, not dots: the role byline below the name is already a
              dot-separated line, and two of them read as the same element. */}
          <p className="mb-5 font-mono text-[12px] font-medium uppercase tracking-[0.2em] text-[var(--accent)]">
            {t.eyebrow}
          </p>
          <h1 className="font-mono text-[2.2rem] font-medium leading-[1.08] tracking-[-0.018em] [word-spacing:-0.24em] sm:text-5xl lg:text-[3.55rem]">
            {site.name}
          </h1>

          <p className="mt-5 font-mono text-[13.5px] leading-[1.7] text-[var(--muted)]">
            {(lang === 'zh' ? site.titleZh : site.title) ?? site.title} ·{' '}
            <a href={site.orgUrl} className="text-[var(--fg-2)] underline decoration-[var(--line-2)] underline-offset-2 hover:text-[var(--accent)] hover:decoration-[var(--accent)]">
              {site.org}
            </a>{' '}
            · {(lang === 'zh' ? site.locationZh : site.locationShort) ?? site.location}
          </p>

          <p className="mt-8 max-w-[30rem] text-[1.02rem] leading-[1.7] text-[var(--fg-2)] sm:text-[1.2rem]">
            {(lang === 'zh' ? site.taglineZh : site.tagline) ?? site.tagline}
          </p>

          {/* A plain row, just given the size and spacing it needed: 15px in
              --fg-2 rather than 12px in --muted, which read as a caption. */}
          <nav className="mt-10 flex flex-wrap gap-x-7 gap-y-3">
            {destinations.map((d) => (
              <Link
                key={d.path}
                href={href(lang, d.path)}
                className="border-b border-transparent pb-[3px] font-mono text-[16px] text-[var(--fg-2)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                {d.label}
              </Link>
            ))}
            <a
              href={site.links.cv}
              className="border-b border-transparent pb-[3px] font-mono text-[16px] text-[var(--fg-2)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              {t.cv}
            </a>
          </nav>
        </div>
      </section>

    </div>
  );
}
