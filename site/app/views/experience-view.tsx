import Image from 'next/image';
import { getExperience, getEducation, formatRange } from '@/lib/content';
import { listSeparator, localized, strings, type Lang } from '@/lib/i18n';

export function ExperienceView({ lang }: { lang: Lang }) {
  const t = strings(lang);
  const bullets = (role: { bullets: string[]; bulletsZh?: string[] }) =>
    localized(lang, role.bullets, role.bulletsZh);
  const experience = getExperience();
  const education = getEducation();

  return (
    <div className="pointer-events-auto py-16 sm:py-20">
      <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--accent)]">
        {lang === 'zh' ? '\u804c\u4e1a' : 'Career'}
      </p>
      <h1 className="mt-4 font-mono text-3xl font-medium leading-[1.1] tracking-[-0.02em] sm:text-4xl">
        {t.experience}
      </h1>

      <section className="mt-16">
  

        <ol className="mt-12 grid gap-16">
          {experience.map((job) => (
            <li key={job.org} className="grid gap-6 sm:grid-cols-[13rem_1fr] sm:gap-10">
              <div className="font-mono text-xs leading-[1.7] text-[var(--muted)]">
                <p className="text-[var(--fg-2)]">
                  {job.url ? (
                    <a href={job.url} className="hover:text-[var(--accent)]">
                      {localized(lang, job.org, job.orgZh)}
                    </a>
                  ) : (
                    localized(lang, job.org, job.orgZh)
                  )}
                </p>
                {job.location && <p className="mt-1">{localized(lang, job.location, job.locationZh)}</p>}
                {job.advisor && (
                  <p className="mt-1">
                    {t.advisor}
                    {lang === 'zh' ? '：' : ': '}
                    {job.advisor}
                  </p>
                )}
              </div>

              <div>
                {/* Several roles at one org read as a promotion, not as separate jobs. */}
                <ol className="grid gap-8">
                  {job.roles.map((role) => (
                    <li key={role.title}>
                      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                        <h3 className="font-medium">{localized(lang, role.title, role.titleZh)}</h3>
                        <p className="font-mono text-xs tabular-nums text-[var(--muted)]">
                          {formatRange(role.start, role.end, lang)}
                        </p>
                      </div>
                      {bullets(role).length > 0 && (
                        <ul className="mt-3 grid gap-2">
                          {bullets(role).map((bullet) => (
                            <li
                              key={bullet}
                              className="max-w-prose text-sm leading-[1.7] text-[var(--fg-2)]"
                            >
                              {bullet}
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ol>

                {job.stack.length > 0 && (
                  <p className="mt-5 font-mono text-[11px] leading-[1.9] text-[var(--muted)]">
                    {localized(lang, job.stack, job.stackZh).join(' · ')}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------------- education ---------------- */}
      <section className="mt-24 border-t border-[var(--line)] pt-14">
        <h2 className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
          {t.education}
        </h2>

        <ol className="mt-12 grid gap-12">
          {education.map((entry) => (
            <li
              key={`${entry.school}-${entry.start}`}
              className="grid gap-5 sm:grid-cols-[13rem_1fr] sm:gap-10"
            >
              <div className="flex items-start gap-4">
                {entry.logo && (
                  <Image
                    src={entry.logo}
                    alt={localized(lang, entry.school, entry.schoolZh)}
                    width={120}
                    height={120}
                    className="h-9 w-9 object-contain"
                  />
                )}
                <p className="font-mono text-xs tabular-nums leading-[1.7] text-[var(--muted)]">
                  {formatRange(entry.start, entry.end, lang)}
                </p>
              </div>

              <div>
                <h3 className="font-medium">{localized(lang, entry.school, entry.schoolZh)}</h3>
                <p className="mt-2 text-sm leading-[1.7] text-[var(--fg-2)]">
                  {localized(lang, entry.degree, entry.degreeZh)}
                  {entry.field
                    ? `${listSeparator(lang)}${localized(lang, entry.field, entry.fieldZh)}`
                    : ''}
                </p>
                <p className="mt-1 font-mono text-[11px] text-[var(--muted)]">
                  {localized(lang, entry.department, entry.departmentZh)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
