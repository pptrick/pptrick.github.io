import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { strings } from '@/lib/i18n';
import { SimpleView } from '@/app/views/simple-view';

export const metadata: Metadata = pageMetadata({
  lang: 'zh',
  path: '/building/',
  title: '项目',
  description: strings('zh').meta.building,
});


export default function Page() {
  const t = strings('zh');
  return (
    <SimpleView
      lang="zh"
      eyebrow={'在做'}
      title={t.building}
      body={t.buildingEmpty}
    />
  );
}
