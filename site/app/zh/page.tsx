import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { strings } from '@/lib/i18n';
import { HomeView } from '@/app/views/home-view';
import { JsonLd } from '@/app/json-ld';
import { personSchema, siteSchema } from '@/lib/structured-data';

export const metadata: Metadata = pageMetadata({
  lang: 'zh',
  path: '/',
  description: strings('zh').meta.home,
});

export default function Page() {
  return (
    <>
      <JsonLd data={personSchema('zh')} />
      <JsonLd data={siteSchema('zh')} />
      <HomeView lang="zh" />
    </>
  );
}
