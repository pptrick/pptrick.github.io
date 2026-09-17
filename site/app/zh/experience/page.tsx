import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { strings } from '@/lib/i18n';
import { ExperienceView } from '@/app/views/experience-view';

export const metadata: Metadata = pageMetadata({
  lang: 'zh',
  path: '/experience/',
  title: '工作经历',
  description: strings('zh').meta.experience,
});


export default function Page() {
  return <ExperienceView lang="zh" />;
}
