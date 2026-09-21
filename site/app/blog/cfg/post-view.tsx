import Link from 'next/link';
import { href, localized, strings, type Lang } from '@/lib/i18n';
import { formatDate, getPost, postSummary, postTitle } from '@/lib/posts';
import { References } from './fig';
import { ContentEn } from './content-en';
import { ContentZh } from './content-zh';
import './post.css';

export function CfgPostView({ lang }: { lang: Lang }) {
  const t = strings(lang);
  const post = getPost('cfg');
  return (
    <article className="post pointer-events-auto py-16 sm:py-20">
      <header>
        <p className="eyebrow">{localized(lang, post.eyebrow, post.eyebrowZh)}</p>
        <h1 className="post-title">{postTitle(lang, post)}</h1>
        <p className="sub">{postSummary(lang, post)}</p>
        <p className="post-meta">
          <time dateTime={post.date}>{formatDate(post.date, lang)}</time>
          {' · '}
          {t.readingTime(localized(lang, post.minutes, post.minutesZh))}
        </p>
      </header>

      {lang === 'zh' ? <ContentZh /> : <ContentEn />}

      <References heading={lang === 'zh' ? '参考文献' : 'References'} />

      <p className="post-back">
        <Link href={href(lang, '/blog/')} className="link-quiet">← {t.backToBlog}</Link>
      </p>
    </article>
  );
}
