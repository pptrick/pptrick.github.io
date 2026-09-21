import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { getPost } from '@/lib/posts';
import { JsonLd } from '@/app/json-ld';
import { articleSchema } from '@/lib/structured-data';
import { CfgPostView } from './post-view';

const post = getPost('cfg');

export const metadata: Metadata = pageMetadata({
  lang: 'en',
  path: `/blog/${post.slug}/`,
  title: post.title,
  description: post.summary,
});

export default function Page() {
  return (
    <>
      <JsonLd data={articleSchema('en', post)} />
      <CfgPostView lang="en" />
    </>
  );
}
