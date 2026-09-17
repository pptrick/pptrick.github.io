import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { strings } from '@/lib/i18n';
import { AboutView } from '@/app/views/about-view';
import { JsonLd } from '@/app/json-ld';
import { personSchema } from '@/lib/structured-data';

export const metadata: Metadata = pageMetadata({
  lang: 'zh',
  path: '/about/',
  title: '关于',
  description: strings('zh').meta.about,
});


export default function Page() {
  return (
    <>
      <JsonLd data={personSchema('zh')} />
      <AboutView lang="zh" />
    </>
  );
}
