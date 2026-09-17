import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { strings } from '@/lib/i18n';
import { AboutView } from '@/app/views/about-view';
import { JsonLd } from '@/app/json-ld';
import { personSchema } from '@/lib/structured-data';

export const metadata: Metadata = pageMetadata({
  lang: 'en',
  path: '/about/',
  title: 'About',
  description: strings('en').meta.about,
});


export default function Page() {
  return (
    <>
      <JsonLd data={personSchema('en')} />
      <AboutView lang="en" />
    </>
  );
}
