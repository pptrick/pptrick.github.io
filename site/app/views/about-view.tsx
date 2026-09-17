import Image from 'next/image';
import { getSite } from '@/lib/content';
import { localized, strings, type Lang } from '@/lib/i18n';

export function AboutView({ lang }: { lang: Lang }) {
  const t = strings(lang);
  const site = getSite();

  return (
    <div className="pointer-events-auto py-16 sm:py-20">
      {/* ---------------- bio ---------------- */}
      <section className="grid gap-10 sm:grid-cols-[10rem_1fr] sm:gap-14">
        <div className="aspect-square w-32 self-start overflow-hidden rounded-full border border-[var(--line-2)] bg-[var(--surface)] sm:w-40">
          <Image
            src="/images/profile.jpg"
            alt={localized(lang, site.name, site.nameZh)}
            width={750}
            height={750}
            priority
            className="h-full w-full object-cover"
          />
        </div>
        <div>
          <h1 className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
            {t.about}
          </h1>
          <p className="mt-6 max-w-prose text-[1.0625rem] leading-[1.75] text-[var(--fg-2)]">
            {localized(lang, site.bio, site.bioZh)}
          </p>

          <dl className="mt-10 grid gap-x-8 gap-y-4 font-mono text-xs sm:grid-cols-2">
            <div>
              <dt className="text-[var(--muted)]">{t.role}</dt>
              <dd className="mt-1.5">
                {localized(lang, site.title, site.titleZh)} ·{' '}
                <a href={site.orgUrl} className="text-[var(--accent)]">
                  {site.org}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-[var(--muted)]">{t.location}</dt>
              <dd className="mt-1.5">{localized(lang, site.location, site.locationZh)}</dd>
            </div>
            <div>
              <dt className="text-[var(--muted)]">{t.email}</dt>
              <dd className="mt-1.5">
                <a href={`mailto:${site.email}`} className="text-[var(--accent)]">
                  {site.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-[var(--muted)]">{t.interests}</dt>
              <dd className="mt-1.5">{localized(lang, site.interests, site.interestsZh).join(' · ')}</dd>
            </div>
          </dl>

          <p className="mt-10 flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs">
            <a href={site.links.github} className="link-quiet">GitHub</a>
            <a href={site.links.scholar} className="link-quiet">Google Scholar</a>
            <a href={site.links.linkedin} className="link-quiet">LinkedIn</a>
            {/* The CV opens in its own tab: it is a PDF, and handing the tab
                over to the browser's viewer would drop the reader out of the
                site with only Back to return. */}
            <a
              href={site.links.cv}
              target="_blank"
              rel="noopener"
              className="link-quiet"
            >
              {t.cv} (PDF)
            </a>
          </p>
        </div>
      </section>

    </div>
  );
}
