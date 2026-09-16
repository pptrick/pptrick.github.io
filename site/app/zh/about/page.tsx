import type { Metadata } from 'next';
import { AboutView } from '@/app/views/about-view';

export const metadata: Metadata = { title: '关于' };

export default function Page() {
  return <AboutView lang="zh" />;
}
