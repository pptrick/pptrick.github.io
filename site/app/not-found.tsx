import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="pointer-events-auto py-24 sm:py-32">
      <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--accent)]">
        404
      </p>
      <h1 className="mt-4 font-mono text-3xl font-medium leading-[1.1] tracking-[-0.02em] sm:text-4xl">
        Nothing here
      </h1>
      <p className="mt-6 max-w-prose text-[1.0625rem] leading-[1.75] text-[var(--fg-2)]">
        That page does not exist. It may have moved when this site was rebuilt.
      </p>
      <nav className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
        {[
          { href: '/', label: 'Home' },
          { href: '/publications/', label: 'Research' },
          { href: '/about/', label: 'About' },
        ].map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="border-b border-transparent pb-[3px] font-mono text-[15px] text-[var(--fg-2)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
