import type { Metadata } from 'next';
import { PublicationsView } from '@/app/views/publications-view';

export const metadata: Metadata = { title: '研究' };

export default function Page() {
  return <PublicationsView lang="zh" />;
}
