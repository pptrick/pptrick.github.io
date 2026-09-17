import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { strings } from '@/lib/i18n';
import { ExperienceView } from '@/app/views/experience-view';

export const metadata: Metadata = pageMetadata({
  lang: 'en',
  path: '/experience/',
  title: 'Experience',
  description: strings('en').meta.experience,
});


export default function Page() {
  return <ExperienceView lang="en" />;
}
