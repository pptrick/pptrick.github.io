import type { Metadata } from 'next';
import { SimpleView } from '@/app/views/simple-view';
import { strings } from '@/lib/i18n';

export const metadata: Metadata = { title: 'Building' };

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
