import Image from 'next/image';
import type { Publication } from '@/lib/content';
import { localized, strings, type Lang } from '@/lib/i18n';

/** Bolds the site owner within the author list, and marks equal contribution. */
function Authors({ authors, me }: { authors: string[]; me: string }) {
  return (
    <p className="mt-3 text-[0.9375rem] leading-[1.7] text-[var(--fg-2)]">
      {authors.map((author, i) => {
        const isMe = author.replace(/\*$/, '') === me;
        return (
          <span key={author}>
            <span className={isMe ? 'font-semibold text-[var(--fg)]' : undefined}>
              {author}
            </span>
            {i < authors.length - 1 ? ', ' : ''}
          </span>
        );
      })}
    </p>
  );
}

export function PubCard({
  pub,
  me,
  lang = 'en',
  compact = false,
}: {
  pub: Publication;
  me: string;
  lang?: Lang;
  compact?: boolean;
}) {
  const t = strings(lang);
  const links = Object.entries(pub.links).filter(([, href]) => Boolean(href));

  return (
    <li>
      {/* A bordered surface per entry, so each publication reads as its own
          object rather than as a run of text. The venue label leads because
          that is what a reader scanning a research page looks for first. */}
      <article className="group grid gap-6 rounded border border-[var(--line)] bg-[var(--surface)] p-5 transition-colors hover:border-[var(--line-2)] sm:grid-cols-[minmax(0,19rem)_1fr] sm:gap-8 sm:p-6">
        {/* Fixed aspect box so every card has the same rhythm, and `contain`
            rather than `cover` because these are research figures — cropping
            one to fill a frame throws away the part that carries the result. */}
        <div className="aspect-[16/10] self-start overflow-hidden rounded-[3px] border border-[var(--line)] bg-[var(--bg-2)]">
          <Image
            src={pub.thumb}
            alt={pub.title}
            width={608}
            height={380}
            className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
          />
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--accent)]">
              {localized(lang, pub.venueShort ?? pub.venue, pub.venueShortZh ?? pub.venueZh)}
              <span className="tabular-nums"> {pub.year}</span>
              {pub.venueNote ? (
                <span className="text-[var(--muted)]">
                  {' · '}
                  {localized(lang, pub.venueNote, pub.venueNoteZh)}
                </span>
              ) : null}
            </p>
            {pub.role ? (
              <span className="rounded-[3px] border border-[var(--line-2)] px-1.5 py-[3px] font-mono text-[10px] uppercase tracking-[0.12em] leading-none text-[var(--fg-2)]">
                {t.roles[pub.role]}
              </span>
            ) : null}
          </div>

          <h3 className="mt-3 text-xl font-semibold leading-[1.28] tracking-[-0.012em] text-balance sm:text-[1.375rem]">
            {pub.links.paper ? (
              <a
                href={pub.links.paper}
                className="decoration-[var(--line-2)] underline-offset-4 hover:underline hover:decoration-[var(--accent)]"
              >
                {pub.title}
              </a>
            ) : (
              pub.title
            )}
          </h3>

          <Authors authors={pub.authors} me={me} />

          <p className="mt-2 font-mono text-[11px] leading-[1.7] text-[var(--muted)]">
            {localized(lang, pub.venue, pub.venueZh)}
            {pub.equalContribution ? ` · * ${t.equalContribution}` : ''}
          </p>

          {!compact && (
            <p className="mt-4 max-w-prose text-[0.9375rem] leading-[1.8] text-[var(--fg-2)]">
              {localized(lang, pub.abstract, pub.summaryZh)}
            </p>
          )}

          {links.length > 0 && (
            <p className="mt-5 flex flex-wrap gap-2">
              {links.map(([key, href]) => (
                <a
                  key={key}
                  href={href as string}
                  className="rounded-[3px] border border-[var(--line-2)] bg-[var(--surface-2)] px-3 py-1.5 font-mono text-[11px] tracking-wide text-[var(--fg-2)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                >
                  {t.links[key as keyof typeof t.links] ?? key}
                </a>
              ))}
            </p>
          )}
        </div>
      </article>
    </li>
  );
}
