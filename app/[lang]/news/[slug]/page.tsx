import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllNews, getNewsBySlug, getNewsTranslation, getTranslatedNewsSlugs, markdownToHtml, formatPostDate } from '@/lib/news';
import { UI, LOCALES, type Locale } from '@/lib/i18nLabels';
import { PageShell } from '@/components/PageShell';
import { BlogHero } from '@/components/BlogHero';
import styles from '@/app/blog/blog.module.css';
import n from '@/app/news/news.module.css';

interface Props {
  params: { lang: string; slug: string };
}

function isLocale(v: string): v is Locale {
  return (LOCALES as string[]).includes(v);
}

export async function generateStaticParams() {
  const params: { lang: Locale; slug: string }[] = [];
  for (const lang of LOCALES) {
    const slugs = lang === 'ko' ? (await getAllNews()).map(n => n.slug) : await getTranslatedNewsSlugs(lang);
    for (const slug of slugs) params.push({ lang, slug });
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!isLocale(params.lang)) return {};
  const lang = params.lang;
  const item = await getNewsBySlug(params.slug);
  if (!item) return { title: UI[lang].notFound };
  const t = lang === 'ko' ? { title: item.title, description: item.description, content: item.content } : await getNewsTranslation(item.slug, lang);
  if (!t) return { title: `${item.title} — ${UI[lang].siteName}`, robots: { index: false } };

  const url = `https://whenstage.com/${lang}/news/${item.slug}`;
  return {
    title: `${t.title} | ${UI[lang].siteName}`,
    description: t.description.slice(0, 158),
    alternates: {
      canonical: url,
      languages: {
        ko: `https://whenstage.com/ko/news/${item.slug}`,
        en: `https://whenstage.com/en/news/${item.slug}`,
        ja: `https://whenstage.com/ja/news/${item.slug}`,
      },
    },
    openGraph: { title: t.title, description: t.description, url, type: 'article' },
  };
}

export default async function LocaleNewsPage({ params }: Props) {
  if (!isLocale(params.lang)) notFound();
  const lang = params.lang;
  const ui = UI[lang];

  const item = await getNewsBySlug(params.slug);
  if (!item) notFound();
  const t = lang === 'ko' ? { title: item.title, description: item.description, content: item.content } : await getNewsTranslation(item.slug, lang);
  const koUrl = `https://whenstage.com/ko/news/${item.slug}`;

  // redirect()는 이 라우트의 정적 캐싱과 충돌해 신뢰할 수 없이 동작해 일반 조건부 렌더로 대체.
  if (!t) {
    return (
      <PageShell lang={lang}>
        <article className={styles.post}>
          <h1 className={styles.postH1}>{item.title}</h1>
          <p>{ui.notTranslated}</p>
          <p><a href={koUrl} className="detail-link">{ui.viewOriginal}</a></p>
        </article>
      </PageShell>
    );
  }

  const html = markdownToHtml(t.content);

  return (
    <PageShell lang={lang}>
      <article className={styles.post}>
        <a href={`/${lang}/news`} className={styles.backLink}>{ui.backToList}</a>
        {item.heroImage && <BlogHero src={item.heroImage} alt={t.title} />}
        <header className={styles.postHeader}>
          <time className={styles.postDate}>
            {formatPostDate(item.date)}
            {item.source && <span className={n.sourceBadge}>{item.source}</span>}
          </time>
          <h1 className={styles.postH1}>{t.title}</h1>
          {t.description && <p className={styles.postLead}>{t.description}</p>}
        </header>
        <div className={styles.postBody} dangerouslySetInnerHTML={{ __html: html }} />
        {item.sourceUrl && (
          <div className={n.sourceBox}>
            <strong>{ui.source}</strong>: {item.source && `${item.source} · `}
            <a href={item.sourceUrl} target="_blank" rel="noopener nofollow">{item.sourceUrl}</a>
          </div>
        )}
        {lang !== 'ko' && (
          <p>
            <a href={koUrl} className="detail-link">{ui.viewOriginal}</a>
          </p>
        )}
      </article>
    </PageShell>
  );
}
