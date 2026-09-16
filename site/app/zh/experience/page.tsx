import type { Metadata } from 'next';
import { ExperienceView } from '@/app/views/experience-view';

export const metadata: Metadata = { title: '工作经历' };

export default function Page() {
  return <ExperienceView lang="zh" />;
}
