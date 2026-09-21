import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { strings } from '@/lib/i18n';
import { BlogView } from '@/app/views/blog-view';

export const metadata: Metadata = pageMetadata({
  lang: 'zh',
  path: '/blog/',
  title: '博客',
  description: strings('zh').meta.blog,
});

export default function Page() {
  return <BlogView lang="zh" />;
}
