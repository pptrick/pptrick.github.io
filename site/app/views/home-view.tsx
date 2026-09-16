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
      <section className="flex h-[calc(100svh-var(--header-h))] flex-col justify-center overflow-hidden py-[4vh]">
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
          <div className="mb-[clamp(1rem,3.5vh,2.5rem)] max-w-[25rem]">
            <div className="mx-auto aspect-square w-[clamp(6.5rem,23vh,16rem)] overflow-hidden rounded-full border border-[var(--line-2)] bg-[var(--surface)]">
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
          <p className="mb-[clamp(.5rem,1.4vh,1.25rem)] font-mono text-[12px] font-medium uppercase tracking-[0.2em] text-[var(--accent)]">
            {t.eyebrow}
          </p>
          <h1 className="font-mono text-[clamp(1.9rem,5.2vh,3.55rem)] font-medium leading-[1.08] tracking-[-0.018em] [word-spacing:-0.24em]">
            {site.name}
          </h1>

          <p className="mt-[clamp(.65rem,1.8vh,1.25rem)] font-mono text-[13.5px] leading-[1.7] text-[var(--muted)]">
            {(lang === 'zh' ? site.titleZh : site.title) ?? site.title} ·{' '}
            <a href={site.orgUrl} className="text-[var(--fg-2)] underline decoration-[var(--line-2)] underline-offset-2 hover:text-[var(--accent)] hover:decoration-[var(--accent)]">
              {site.org}
            </a>{' '}
            · {(lang === 'zh' ? site.locationZh : site.locationShort) ?? site.location}
          </p>

          <p className="mt-[clamp(1rem,3vh,2rem)] max-w-[30rem] text-[clamp(.95rem,2vh,1.2rem)] leading-[1.7] text-[var(--fg-2)]">
            {(lang === 'zh' ? site.taglineZh : site.tagline) ?? site.tagline}
          </p>

          {/* A plain row, just given the size and spacing it needed: 15px in
              --fg-2 rather than 12px in --muted, which read as a caption. */}
          <nav className="mt-[clamp(1.25rem,3.5vh,2.5rem)] flex flex-wrap gap-x-7 gap-y-2">
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
