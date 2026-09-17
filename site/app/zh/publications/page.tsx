import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { strings } from '@/lib/i18n';
import { PublicationsView } from '@/app/views/publications-view';
import { JsonLd } from '@/app/json-ld';
import { publicationsSchema } from '@/lib/structured-data';

export const metadata: Metadata = pageMetadata({
  lang: 'zh',
  path: '/publications/',
  title: '研究',
  description: strings('zh').meta.research,
});


export default function Page() {
  return (
    <>
      <JsonLd data={publicationsSchema('zh')} />
      <PublicationsView lang="zh" />
    </>
  );
}
