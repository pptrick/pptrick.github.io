'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { isHomePath } from '@/lib/i18n';
import type { HeroScene, ViewMode } from './engine';

/**
 * Mounted once in the root layout, never inside a page.
 *
 * The App Router keeps the layout mounted across navigation, so the canvas is
 * never torn down and the camera keeps its state — which is what makes the
 * dolly between the home view and a sub-page possible at all. Putting this in
 * page.tsx would re-initialise WebGL on every click.
 */
export function SceneCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<HeroScene | null>(null);
  const [ready, setReady] = useState(false);
  const pathname = usePathname();
  const isHome = isHomePath(pathname);

  // ---- boot once ----
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let disposed = false;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const resolveLight = () => {
      const stamped = document.documentElement.getAttribute('data-theme');
      if (stamped === 'light') return true;
      if (stamped === 'dark') return false;
      return window.matchMedia('(prefers-color-scheme: light)').matches;
    };

    // Dynamic import: three.js and the geometry stay out of the first-paint
    // bundle, so the hero text renders before any of this arrives.
    import('./engine')
      .then(({ createHeroScene }) =>
        createHeroScene(canvas, { reducedMotion, light: resolveLight() }),
      )
      .then((scene) => {
        if (disposed) {
          scene.dispose();
          return;
        }
        sceneRef.current = scene;
        scene.setView(isHomePath(window.location.pathname) ? 'home' : 'page');
        setReady(true);
      })
      .catch((err) => {
        // A missing buffer or no WebGL should cost the page nothing: the hero
        // simply stays as type on the background colour.
        console.warn('hero scene unavailable:', err);
      });

    // the theme toggle stamps data-theme on <html>
    const observer = new MutationObserver(() => sceneRef.current?.setTheme(resolveLight()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    const media = window.matchMedia('(prefers-color-scheme: light)');
    const onMedia = () => sceneRef.current?.setTheme(resolveLight());
    media.addEventListener('change', onMedia);

    return () => {
      disposed = true;
      observer.disconnect();
      media.removeEventListener('change', onMedia);
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, []);

  // ---- dolly on route change ----
  useEffect(() => {
    const mode: ViewMode = isHome ? 'home' : 'page';
    sceneRef.current?.setView(mode);
  }, [isHome]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-700"
      style={{ opacity: ready ? 1 : 0 }}
    >
      <canvas
        ref={canvasRef}
        // Up close on a sub-page the scene is texture, so it must not eat
        // scrolls or clicks; on the home view it is draggable.
        className={
          isHome
            ? 'pointer-events-auto h-full w-full cursor-grab touch-none'
            : 'h-full w-full'
        }
        style={
          isHome
            ? undefined
            : {
                // Sub-page content spans the full width, so the left-biased
                // scrim cannot protect it — the scene itself has to sit further
                // back than the hero's 22% or the body copy reads as noisy.
                opacity: 0.12,
                filter: 'blur(1.3px)',
                transition: 'opacity .7s ease, filter .7s ease',
              }
        }
      />
    </div>
  );
}
