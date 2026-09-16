import type { Metadata } from 'next';
import { SimpleView } from '@/app/views/simple-view';
import { strings } from '@/lib/i18n';

export const metadata: Metadata = { title: '博客' };

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
