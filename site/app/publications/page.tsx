import type { Metadata } from 'next';
import { PublicationsView } from '@/app/views/publications-view';

export const metadata: Metadata = { title: 'Research' };

export default function Page() {
  return <PublicationsView lang="en" />;
}
