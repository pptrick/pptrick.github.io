import { strings, type Lang } from '@/lib/i18n';

/** /building and /blog are both deliberately empty for now. */
export function SimpleView({
  lang,
  eyebrow,
  title,
  body,
}: {
  lang: Lang;
  eyebrow: string;
  title: string;
  body: string;
}) {
  void strings(lang);
  return (
    <div className="pointer-events-auto py-16 sm:py-20">
      <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--accent)]">
        {eyebrow}
      </p>
      <h1 className="mt-4 font-mono text-3xl font-medium leading-[1.1] tracking-[-0.02em] sm:text-4xl">
        {title}
      </h1>
      <p className="mt-6 max-w-[34rem] text-[1.0625rem] leading-[1.75] text-[var(--fg-2)]">
        {body}
      </p>
    </div>
  );
}
