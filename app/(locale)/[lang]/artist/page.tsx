import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllArtists } from '@/lib/artists';
import { CATEGORY_META } from '@/lib/types';
import { PageShell } from '@/components/PageShell';
import { PageHeader } from '@/components/PageHeader';
import { ArtistCard } from '@/components/ArtistCard';
import { RevealGroup, RevealItem } from '@/components/motion/Reveal';
import { UI, LOCALES, OG_LOCALE, DEFAULT_OG_IMAGE, type Locale } from '@/lib/i18nLabels';
import { localeAlternates, breadcrumbLd, jsonLd } from '@/lib/seo';
import blogStyles from '@/app/blog/blog.module.css';
import styles from './artist.module.css';

interface Props { params: { lang: string }; }
function isLocale(v: string): v is Locale { return (LOCALES as string[]).includes(v); }

export async function generateStaticParams() {
  return LOCALES.map(lang => ({ lang }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!isLocale(params.lang)) return {};
  const ui = UI[params.lang];
  const url = `https://whenstage.com/${params.lang}/artist`;
  return {
    // 화면 제목은 짧아야 읽히지만, 검색 결과에는 사람이 실제로 치는 말이 나가야 한다
    title: ui.artistListMetaTitle,
    description: ui.artistListMetaDescription,
    alternates: localeAlternates('/artist', params.lang),
    openGraph: { title: ui.artistListMetaTitle, description: ui.artistListMetaDescription, url, locale: OG_LOCALE[params.lang], images: [DEFAULT_OG_IMAGE] },
  };
}

export default async function ArtistListPage({ params }: Props) {
  if (!isLocale(params.lang)) notFound();
  const lang = params.lang;
  const ui = UI[lang];
  const artists = await getAllArtists(lang);

  // 목록 페이지에도 경로를 알려 준다 — 상세에는 있는데 여기만 빠져 있었다
  const crumbLd = breadcrumbLd([
    { name: ui.home, url: `https://whenstage.com/${lang}` },
    { name: ui.artistListTitle, url: `https://whenstage.com/${lang}/artist` },
  ]);

  return (
    <PageShell lang={lang}>
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(crumbLd) }} />
      <section className={blogStyles.indexSection}>
        <PageHeader
          icon="ic-star"
          title={ui.artistListTitle}
          subtitle={ui.artistListSubtitle}
          count={artists.length}
          countLabel={lang === 'ko' ? '아티스트' : lang === 'ja' ? 'アーティスト' : 'artists'}
        />

        {artists.length === 0 ? (
          <p className={blogStyles.empty}>{ui.artistNoEvents}</p>
        ) : (
          <RevealGroup className={styles.grid}>
            {artists.map(a => {
              // 다가오는 일정이 있으면 그중 가장 가까운 것, 없으면 가장 최근 지난 항목의 카테고리색
              const upcoming = a.events.filter(g => g.release_date_approx || g.release_date >= new Date().toISOString().slice(0, 10));
              const repGame = upcoming[0] ?? a.events[a.events.length - 1];
              const catColor = CATEGORY_META[repGame.category].color;
              const eventsLabel = `${a.events.length}${lang === 'ko' ? '개 일정' : lang === 'ja' ? '件' : ' events'}`;
              return (
                <RevealItem key={a.slug} className={styles.cardWrap}>
                  <ArtistCard
                    href={`/${lang}/artist/${encodeURIComponent(a.slug)}`}
                    name={a.name}
                    image={a.image}
                    catColor={catColor}
                    upcomingLabel={a.upcomingCount > 0 ? `${a.upcomingCount}${ui.artistUpcomingCount}` : null}
                    metaText={eventsLabel}
                  />
                </RevealItem>
              );
            })}
          </RevealGroup>
        )}
      </section>
    </PageShell>
  );
}
