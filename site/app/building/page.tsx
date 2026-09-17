import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { strings } from '@/lib/i18n';
import { SimpleView } from '@/app/views/simple-view';

export const metadata: Metadata = pageMetadata({
  lang: 'en',
  path: '/building/',
  title: 'Building',
  description: strings('en').meta.building,
});


export default function Page() {
  const t = strings('en');
  return (
    <SimpleView
      lang="en"
      eyebrow={'Work'}
      title={t.building}
      body={t.buildingEmpty}
    />
  );
}
