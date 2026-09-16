import { getSite, getPublications } from '@/lib/content';
import { href, strings, type Lang } from '@/lib/i18n';
import { PubCard } from '@/app/publications/pub-card';

export function PublicationsView({ lang }: { lang: Lang }) {
  const t = strings(lang);
  const site = getSite();
  const pubs = getPublications();

  return (
    <div className="pointer-events-auto py-14">
      <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--accent)]">
        {t.publicationCount(pubs.length)}
      </p>
      <h1 className="mt-4 font-mono text-3xl font-medium leading-[1.1] tracking-[-0.02em] sm:text-4xl">
        {t.research}
      </h1>
      <p className="mt-6 max-w-[34rem] text-[1.0625rem] leading-[1.75] text-[var(--fg-2)]">
        {t.researchIntro}
      </p>

      <ul className="mt-14 grid max-w-[64rem] gap-6">
        {pubs.map((pub) => (
          <PubCard key={pub.slug} pub={pub} me={site.me} lang={lang} />
        ))}
      </ul>
    </div>
  );
}
