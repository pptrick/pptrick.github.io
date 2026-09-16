'use client';

import { usePathname } from 'next/navigation';
import { isHomePath } from '@/lib/i18n';

/** Hidden on the landing page, which is a single non-scrolling frame. */
export function SiteFooter({ name }: { name: string }) {
  const pathname = usePathname() || '/';
  if (isHomePath(pathname)) return null;

  return (
    <footer
      className="relative z-10 mx-auto mt-28 max-w-7xl border-t px-4 py-10 font-mono text-xs sm:px-8"
      style={{ borderColor: 'var(--line)', color: 'var(--muted)' }}
    >
      © {new Date().getFullYear()} {name}
    </footer>
  );
}
