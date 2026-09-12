import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllNews, getNewsBySlug, getRelatedNews, markdownToHtml, formatPostDate } from '@/lib/news';
import { UI, LOCALES, OG_LOCALE, DEFAULT_OG_IMAGE, type Locale } from '@/lib/i18nLabels';
import { PageShell } from '@/components/PageShell';
import { BlogHero } from '@/components/BlogHero';
import { SidebarSection } from '@/components/SidebarSection';
import { RelatedArticleCard } from '@/components/RelatedArticleCard';
import { breadcrumbLd, jsonLd } from '@/lib/seo';
import styles from '@/app/blog/blog.module.css';
import n from '@/app/news/news.module.css';

interface Props {
  params: { lang: string; slug: string };
}

function isLocale(v: string): v is Locale {
  return (LOCALES as string[]).includes(v);
}

// 빌드에 없는 slug는 하드 404(soft-404 방지) — 콘텐츠가 모두 빌드 시점에 정해지므로 안전
export const dynamicParams = false;

export async function generateStaticParams() {
  const params: { lang: Locale; slug: string }[] = [];
  for (const lang of LOCALES) {
    const slugs = (await getAllNews(lang)).map(it => it.slug);
    for (const slug of slugs) params.push({ lang, slug });
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!isLocale(params.lang)) return {};
  const lang = params.lang;
  const item = await getNewsBySlug(params.slug, lang);
  if (!item) return { title: UI[lang].notFound };

  const url = `https://whenstage.com/${lang}/news/${item.slug}`;
  return {
    title: item.title,
    description: item.description.slice(0, 158),
    // 색인하지 않는다 (2026-09-12). 이 기사들은 타 매체 보도를 우리 말로 다시 쓴 것이라
    // 원문에 없는 값이 없다 — 293편을 쌓는 동안 GSC 상위 25개에서 벌어온 클릭은 20일간 6개,
    // 같은 기간 공연 상세는 104개였다. 검색에서 원문을 이길 수도 없고(백링크 0·도메인 2개월),
    // "독창성 없는 콘텐츠를 대량으로"는 구글 스팸 정책이 정확히 겨냥하는 형태다.
    // 사이트 안에서는 계속 쓸모가 있으므로(공연 상세로 보내는 내부 링크·독자용 소식) 지우지 않고
    // follow는 남긴다. 되돌리려면 이 줄과 app/sitemap.ts의 newsUrls만 되살리면 된다.
    robots: { index: false, follow: true },
    alternates: { canonical: url },
    openGraph: {
      title: item.title,
      description: item.description,
      url,
      type: 'article',
      locale: OG_LOCALE[lang],
      images: item.heroImage ? [{ url: item.heroImage }] : [DEFAULT_OG_IMAGE],
    },
  };
}

export default async function LocaleNewsPage({ params }: Props) {
  if (!isLocale(params.lang)) notFound();
  const lang = params.lang;
  const ui = UI[lang];

  const item = await getNewsBySlug(params.slug, lang);
  if (!item) notFound();

  const html = markdownToHtml(item.content);

  const newsLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: item.title,
    description: item.description,
    datePublished: item.date,
    dateModified: item.date,
    inLanguage: lang,
    url: `https://whenstage.com/${lang}/news/${item.slug}`,
    image: item.heroImage || 'https://whenstage.com/og-image.png',
    author: { '@type': 'Organization', name: 'WhenStage' },
    publisher: {
      '@type': 'Organization',
      name: 'WhenStage',
      logo: { '@type': 'ImageObject', url: 'https://whenstage.com/og-image.png' },
    },
  };

  const related = await getRelatedNews(params.slug, lang, 3);
  const relatedLabel = lang === 'ko' ? '관련 뉴스' : lang === 'ja' ? '関連ニュース' : 'Related News';
  const seeAllNews = lang === 'ko' ? '뉴스 전체 보기' : lang === 'ja' ? 'ニュース一覧' : 'See all news';
  const sidebar = related.length > 0 ? (
    <SidebarSection title={relatedLabel} moreHref={`/${lang}/news`} moreLabel={seeAllNews}>
      {related.map(r => <RelatedArticleCard key={r.slug} href={`/${lang}/news/${r.slug}`} title={r.title} dateText={formatPostDate(r.date)} />)}
    </SidebarSection>
  ) : undefined;

  const crumbLd = breadcrumbLd([
    { name: 'WhenStage', url: `https://whenstage.com/${lang}` },
    { name: lang === 'ja' ? 'ニュース' : lang === 'en' ? 'News' : '뉴스', url: `https://whenstage.com/${lang}/news` },
    { name: item.title, url: `https://whenstage.com/${lang}/news/${item.slug}` },
  ]);

  return (
    <PageShell lang={lang} sidebar={sidebar}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(newsLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(crumbLd) }} />
      <article className={styles.post}>
        <a href={`/${lang}/news`} className={styles.backLink}>{ui.backToList}</a>
        {item.heroImage && <BlogHero src={item.heroImage} alt={item.title} />}
        <header className={styles.postHeader}>
          <time className={styles.postDate}>
            {formatPostDate(item.date)}
            {item.source && <span className={n.sourceBadge}>{item.source}</span>}
          </time>
          <h1 className={styles.postH1}>{item.title}</h1>
          {item.description && <p className={styles.postLead}>{item.description}</p>}
        </header>
        <div className={styles.postBody} dangerouslySetInnerHTML={{ __html: html }} />
        {item.sourceUrl && (
          <div className={n.sourceBox}>
            <strong>{ui.source}</strong>: {item.source && `${item.source} · `}
            <a href={item.sourceUrl} target="_blank" rel="noopener nofollow">{item.sourceUrl}</a>
          </div>
        )}
      </article>
    </PageShell>
  );
}
