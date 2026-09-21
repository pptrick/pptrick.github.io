import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { strings } from '@/lib/i18n';
import { BlogView } from '@/app/views/blog-view';

export const metadata: Metadata = pageMetadata({
  lang: 'en',
  path: '/blog/',
  title: 'Blog',
  description: strings('en').meta.blog,
});

export default function Page() {
  return <BlogView lang="en" />;
}
