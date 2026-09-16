import type { Metadata } from 'next';
import { ExperienceView } from '@/app/views/experience-view';

export const metadata: Metadata = { title: 'Experience' };

export default function Page() {
  return <ExperienceView lang="en" />;
}
