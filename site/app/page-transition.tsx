'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

/**
 * Fades the page content in on navigation.
 *
 * Scoped to the content, not the document: the header, the footer and the
 * WebGL canvas all stay put. That is deliberate — the canvas is mid-animation
 * and the camera is dollying between its home and sub-page framings on exactly
 * these navigations, so a document-level transition (the View Transitions API,
 * say) would cross-fade a frozen snapshot of the bunny against the live one and
 * fight the dolly. Leaving the backdrop alone lets the two read as one motion:
 * the camera pulls in over 0.7s while the new copy settles in 0.3s.
 *
 * The `key` is what makes it work at all. React would otherwise reuse this
 * element and reconcile only the text inside it, and a CSS animation does not
 * restart for that; keying on the pathname replaces the element, which starts
 * the animation from the top.
 *
 * The first page painted is deliberately NOT animated. Starting the landing
 * copy at opacity 0 would push out Largest Contentful Paint, since an element
 * is not a paint candidate until it is visible — a cost paid by every first
 * visitor to save nothing, as there is no previous page to transition from.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/';

  // Records the path once its render has committed. Null until the first
  // commit, which is precisely "nothing has been painted yet". A ref rather
  // than state because flipping it must not itself cause a re-render: that
  // would add the class to the already-painted first element and animate the
  // very thing this is avoiding.
  const painted = useRef<string | null>(null);
  useEffect(() => {
    painted.current = pathname;
  }, [pathname]);

  return (
    <div key={pathname} className={painted.current === null ? undefined : 'page-enter'}>
      {children}
    </div>
  );
}
