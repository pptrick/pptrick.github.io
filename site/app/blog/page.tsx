import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { strings } from '@/lib/i18n';
import { SimpleView } from '@/app/views/simple-view';

export const metadata: Metadata = pageMetadata({
  lang: 'en',
  path: '/blog/',
  title: 'Blog',
  description: strings('en').meta.blog,
});


export default function Page() {
  const t = strings('en');
  return (
    <SimpleView
      lang="en"
      eyebrow={'Notes'}
      title={t.blog}
      body={t.blogEmpty}
    />
  );
}
