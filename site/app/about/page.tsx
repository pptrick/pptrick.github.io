import type { Metadata } from 'next';
import { AboutView } from '@/app/views/about-view';

export const metadata: Metadata = { title: 'About' };

export default function Page() {
  return <AboutView lang="en" />;
}
