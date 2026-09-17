import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { strings } from '@/lib/i18n';
import { SimpleView } from '@/app/views/simple-view';

export const metadata: Metadata = pageMetadata({
  lang: 'zh',
  path: '/blog/',
  title: '博客',
  description: strings('zh').meta.blog,
});


export default function Page() {
  const t = strings('zh');
  return (
    <SimpleView
      lang="zh"
      eyebrow={'文章'}
      title={t.blog}
      body={t.blogEmpty}
    />
  );
}
