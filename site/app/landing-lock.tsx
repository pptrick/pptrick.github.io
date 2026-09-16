'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { isHomePath } from '@/lib/i18n';

/**
 * The landing page is a fixed frame: it fills the window exactly and does not
 * scroll. Every other page scrolls normally, so the lock is applied per route
 * rather than globally.
 */
export function LandingLock() {
  const pathname = usePathname() || '/';
  const landing = isHomePath(pathname);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('landing', landing);
    return () => root.classList.remove('landing');
  }, [landing]);

  return null;
}
