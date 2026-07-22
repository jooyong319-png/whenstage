import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllPosts, getPostBySlug, getPostTranslation, getTranslatedSlugs, getRelatedPosts, markdownToHtml, formatPostDate } from '@/lib/blog';
import { UI, LOCALES, type Locale } from '@/lib/i18nLabels';
import { PageShell } from '@/components/PageShell';
import { BlogHero } from '@/components/BlogHero';
import { SidebarSection } from '@/components/SidebarSection';
import { RelatedArticleCard } from '@/components/RelatedArticleCard';
import styles from '@/app/blog/blog.module.css';

interface Props {
  params: { lang: string; slug: string };
}

function isLocale(v: string): v is Locale {
  return (LOCALES as string[]).includes(v);
}

export async function generateStaticParams() {
  const params: { lang: Locale; slug: string }[] = [];
  for (const lang of LOCALES) {
    const slugs = lang === 'ko' ? (await getAllPosts()).map(p => p.slug) : await getTranslatedSlugs(lang);
    for (const slug of slugs) params.push({ lang, slug });
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!isLocale(params.lang)) return {};
  const lang = params.lang;
  const post = await getPostBySlug(params.slug);
  if (!post) return { title: UI[lang].notFound };
  const t = lang === 'ko' ? { title: post.title, description: post.description, content: post.content } : await getPostTranslation(params.slug, lang);
  if (!t) return { title: `${post.title} — ${UI[lang].siteName}`, robots: { index: false } };

  const url = `https://whenstage.com/${lang}/blog/${params.slug}`;
  return {
    title: `${t.title} | ${UI[lang].siteName}`,
    description: t.description.slice(0, 158),
    alternates: {
      canonical: url,
      languages: {
        ko: `https://whenstage.com/ko/blog/${params.slug}`,
        en: `https://whenstage.com/en/blog/${params.slug}`,
        ja: `https://whenstage.com/ja/blog/${params.slug}`,
      },
    },
    openGraph: { title: t.title, description: t.description, url, type: 'article' },
  };
}

export default async function LocaleBlogPage({ params }: Props) {
  if (!isLocale(params.lang)) notFound();
  const lang = params.lang;
  const ui = UI[lang];

  const post = await getPostBySlug(params.slug);
  if (!post) notFound();
  const t = lang === 'ko' ? { title: post.title, description: post.description, content: post.content } : await getPostTranslation(params.slug, lang);
  const koUrl = `https://whenstage.com/ko/blog/${params.slug}`;

  // 관련 아티클 — 태그 겹침 기준(getRelatedPosts). 번역이 있으면 그 언어 제목/링크로, 없으면 KO로 폴백.
  const relatedRaw = await getRelatedPosts(params.slug, 3);
  const related = await Promise.all(relatedRaw.map(async r => {
    if (lang === 'ko') return { slug: r.slug, title: r.title, date: r.date, href: `/ko/blog/${r.slug}` };
    const rt = await getPostTranslation(r.slug, lang);
    return rt
      ? { slug: r.slug, title: rt.title, date: r.date, href: `/${lang}/blog/${r.slug}` }
      : { slug: r.slug, title: r.title, date: r.date, href: `/ko/blog/${r.slug}` };
  }));
  const relatedLabel = lang === 'ko' ? '관련 아티클' : lang === 'ja' ? '関連記事' : 'Related Articles';
  const seeAllBlog = lang === 'ko' ? '모아보기 전체 글' : lang === 'ja' ? 'まとめ記事一覧' : 'See all roundups';
  const sidebar = related.length > 0 ? (
    <SidebarSection title={relatedLabel} moreHref={`/${lang}/blog`} moreLabel={seeAllBlog}>
      {related.map(r => <RelatedArticleCard key={r.slug} href={r.href} title={r.title} dateText={formatPostDate(r.date)} />)}
    </SidebarSection>
  ) : undefined;

  // redirect()는 이 라우트의 정적 캐싱과 충돌해 신뢰할 수 없이 동작해 일반 조건부 렌더로 대체.
  if (!t) {
    return (
      <PageShell lang={lang} sidebar={sidebar}>
        <article className={styles.post}>
          <h1 className={styles.postH1}>{post.title}</h1>
          <p>{ui.notTranslated}</p>
          <p><a href={koUrl} className="detail-link">{ui.viewOriginal}</a></p>
        </article>
      </PageShell>
    );
  }

  const html = markdownToHtml(t.content);

  return (
    <PageShell lang={lang} sidebar={sidebar}>
      <article className={styles.post}>
        <a href={`/${lang}/blog`} className={styles.backLink}>{ui.backToList}</a>
        {post.heroImage && <BlogHero src={post.heroImage} alt={t.title} />}
        <header className={styles.postHeader}>
          <time className={styles.postDate}>{formatPostDate(post.date)}</time>
          <h1 className={styles.postH1}>{t.title}</h1>
          {t.description && <p className={styles.postLead}>{t.description}</p>}
        </header>
        <div className={styles.postBody} dangerouslySetInnerHTML={{ __html: html }} />
        {lang !== 'ko' && (
          <p>
            <a href={koUrl} className="detail-link">{ui.viewOriginal}</a>
          </p>
        )}
      </article>
    </PageShell>
  );
}
