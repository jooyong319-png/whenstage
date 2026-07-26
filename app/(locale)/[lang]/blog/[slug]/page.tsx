import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllPosts, getPostBySlug, getRelatedPosts, markdownToHtml, formatPostDate } from '@/lib/blog';
import { UI, LOCALES, OG_LOCALE, DEFAULT_OG_IMAGE, type Locale } from '@/lib/i18nLabels';
import { PageShell } from '@/components/PageShell';
import { BlogHero } from '@/components/BlogHero';
import { SidebarSection } from '@/components/SidebarSection';
import { RelatedArticleCard } from '@/components/RelatedArticleCard';
import { breadcrumbLd, jsonLd } from '@/lib/seo';
import styles from '@/app/blog/blog.module.css';

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
    const slugs = (await getAllPosts(lang)).map(p => p.slug);
    for (const slug of slugs) params.push({ lang, slug });
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!isLocale(params.lang)) return {};
  const lang = params.lang;
  const post = await getPostBySlug(params.slug, lang);
  if (!post) return { title: UI[lang].notFound };

  const url = `https://whenstage.com/${lang}/blog/${params.slug}`;
  return {
    title: post.title,
    description: post.description.slice(0, 158),
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      type: 'article',
      locale: OG_LOCALE[lang],
      images: post.heroImage ? [{ url: post.heroImage }] : [DEFAULT_OG_IMAGE],
    },
  };
}

export default async function LocaleBlogPage({ params }: Props) {
  if (!isLocale(params.lang)) notFound();
  const lang = params.lang;
  const ui = UI[lang];

  const post = await getPostBySlug(params.slug, lang);
  if (!post) notFound();

  const html = markdownToHtml(post.content);

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    inLanguage: lang,
    url: `https://whenstage.com/${lang}/blog/${params.slug}`,
    image: post.heroImage || 'https://whenstage.com/og-image.png',
    author: { '@type': 'Organization', name: 'WhenStage' },
    publisher: {
      '@type': 'Organization',
      name: 'WhenStage',
      logo: { '@type': 'ImageObject', url: 'https://whenstage.com/og-image.png' },
    },
  };

  const related = await getRelatedPosts(params.slug, lang, 3);
  const relatedLabel = lang === 'ko' ? '관련 아티클' : lang === 'ja' ? '関連記事' : 'Related Articles';
  const seeAllBlog = lang === 'ko' ? '모아보기 전체 글' : lang === 'ja' ? 'まとめ記事一覧' : 'See all roundups';
  const sidebar = related.length > 0 ? (
    <SidebarSection title={relatedLabel} moreHref={`/${lang}/blog`} moreLabel={seeAllBlog}>
      {related.map(r => <RelatedArticleCard key={r.slug} href={`/${lang}/blog/${r.slug}`} title={r.title} dateText={formatPostDate(r.date)} />)}
    </SidebarSection>
  ) : undefined;

  const crumbLd = breadcrumbLd([
    { name: 'WhenStage', url: `https://whenstage.com/${lang}` },
    { name: lang === 'ja' ? 'まとめ記事' : lang === 'en' ? 'Roundups' : '모아보기', url: `https://whenstage.com/${lang}/blog` },
    { name: post.title, url: `https://whenstage.com/${lang}/blog/${post.slug}` },
  ]);

  return (
    <PageShell lang={lang} sidebar={sidebar}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(crumbLd) }} />
      <article className={styles.post}>
        <a href={`/${lang}/blog`} className={styles.backLink}>{ui.backToList}</a>
        {post.heroImage && <BlogHero src={post.heroImage} alt={post.title} />}
        <header className={styles.postHeader}>
          <time className={styles.postDate}>{formatPostDate(post.date)}</time>
          <h1 className={styles.postH1}>{post.title}</h1>
          {post.description && <p className={styles.postLead}>{post.description}</p>}
        </header>
        <div className={styles.postBody} dangerouslySetInnerHTML={{ __html: html }} />
      </article>
    </PageShell>
  );
}
