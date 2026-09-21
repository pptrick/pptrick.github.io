import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { getPost } from '@/lib/posts';
import { JsonLd } from '@/app/json-ld';
import { articleSchema } from '@/lib/structured-data';
import { CfgPostView } from '@/app/blog/cfg/post-view';

const post = getPost('cfg');

export const metadata: Metadata = pageMetadata({
  lang: 'zh',
  path: `/blog/${post.slug}/`,
  title: post.titleZh,
  description: post.summaryZh,
});

export default function Page() {
  return (
    <>
      <JsonLd data={articleSchema('zh', post)} />
      <CfgPostView lang="zh" />
    </>
  );
}
