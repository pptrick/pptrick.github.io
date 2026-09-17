import type { Metadata } from 'next';
import { getSite } from '@/lib/content';
import { SITE_URL } from '@/lib/site-url';
import { SiteHeader } from './site-header';
import { SceneCanvas } from './scene/scene-canvas';
import { RootAttributes } from './root-attributes';
import { SiteFooter } from './site-footer';
import { PageTransition } from './page-transition';
import './globals.css';

const site = getSite();

export const metadata: Metadata = {
  title: { default: site.name, template: `%s · ${site.name}` },
  description: site.tagline,
  keywords: ['Chuanyu Pan', '潘传宇', '3D AI', 'computer graphics', '3D vision', 'Meshy'],
  authors: [{ name: site.name }],
  metadataBase: new URL(SITE_URL),
  // openGraph and canonical live per route in lib/seo.ts; a block here
  // would be inherited and every page would claim to be the homepage.
  verification: { google: 'RisFS-DjchuTNwiHmyLFchX4R3TSW4H2DcU57Zza9d0' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // No `lang` on <html> here: one root layout serves both language trees, so
  // see RootAttributes for where the attribute actually comes from.
  return (
    <html>
      <head>
        <script
          // Must run before paint: reads the saved choice and stamps it, so a
          // returning visitor never sees the other theme flash first.
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t)}catch(e){}`,
          }}
        />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&family=IBM+Plex+Sans:wght@300;400;500;600&family=Noto+Sans+SC:wght@300;400;500&display=swap"
        />
      </head>
      <body className="min-h-screen">
        {/* Lives in the layout, not a page: it must survive navigation for the
            camera dolly to work. Sits behind everything at z-0. */}
        <RootAttributes />
        <SceneCanvas />

        {/* Scrim: keeps the copy legible where the scene passes behind it, and
            fades out by 72% of the width so the model is not blacked out. */}
        <div
          aria-hidden="true"
          className="scene-scrim pointer-events-none fixed inset-0 z-0"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0 opacity-[0.035] dark:opacity-[0.035]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />

        <SiteHeader name={site.name} nameZh={site.nameZh} cvHref={site.links.cv} />

        {/* pointer-events-none so drags reach the canvas behind; each page turns
            them back on for its own content. Without this <main> covers the
            whole viewport at z-10 and the model cannot be grabbed at all. */}
        <main className="pointer-events-none relative z-10 mx-auto max-w-7xl px-4 sm:px-8">
          <PageTransition>{children}</PageTransition>
        </main>

        <SiteFooter name={site.name} nameZh={site.nameZh} />
      </body>
    </html>
  );
}
