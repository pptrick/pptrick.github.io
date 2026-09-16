import type { Metadata } from 'next';
import { SimpleView } from '@/app/views/simple-view';
import { strings } from '@/lib/i18n';

export const metadata: Metadata = { title: 'Blog' };

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
