import Link from 'next/link';
import { href, localized, strings, type Lang } from '@/lib/i18n';
import { formatDate, getPosts, postSummary, postTitle } from '@/lib/posts';

export function BlogView({ lang }: { lang: Lang }) {
  const t = strings(lang);
  const posts = getPosts();

  return (
    <div className="pointer-events-auto py-14">
      <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--accent)]">
        {t.notesEyebrow}
      </p>
      <h1 className="mt-4 font-mono text-3xl font-medium leading-[1.1] tracking-[-0.02em] sm:text-4xl">
        {t.blog}
      </h1>
      <p className="mt-6 max-w-[34rem] text-[1.0625rem] leading-[1.75] text-[var(--fg-2)]">
        {t.blogIntro}
      </p>

      <ul className="mt-14 grid max-w-[48rem] gap-6">
        {posts.map((post) => (
          <li key={post.slug}>
            <article className="group rounded border border-[var(--line)] bg-[var(--surface)] p-5 transition-colors hover:border-[var(--line-2)] sm:p-6">
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--accent)]">
                {localized(lang, post.eyebrow, post.eyebrowZh)}
              </p>
              <h2 className="mt-3 text-xl font-semibold leading-[1.28] tracking-[-0.012em] sm:text-[1.375rem]">
                <Link
                  href={href(lang, `/blog/${post.slug}/`)}
                  className="decoration-[var(--line-2)] underline-offset-4 hover:underline hover:decoration-[var(--accent)]"
                >
                  {postTitle(lang, post)}
                </Link>
              </h2>
              <p className="mt-3 max-w-prose text-[0.9375rem] leading-[1.8] text-[var(--fg-2)]">
                {postSummary(lang, post)}
              </p>
              <p className="mt-4 font-mono text-[11px] leading-[1.7] text-[var(--muted)]">
                <time dateTime={post.date}>{formatDate(post.date, lang)}</time>
                {' · '}
                {t.readingTime(localized(lang, post.minutes, post.minutesZh))}
              </p>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}
