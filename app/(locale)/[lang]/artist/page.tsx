import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllArtists } from '@/lib/artists';
import { CATEGORY_META } from '@/lib/types';
import { PageShell } from '@/components/PageShell';
import { PageHeader } from '@/components/PageHeader';
import { ArtistCard } from '@/components/ArtistCard';
import { RevealGroup, RevealItem } from '@/components/motion/Reveal';
import { UI, LOCALES, OG_LOCALE, type Locale } from '@/lib/i18nLabels';
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
    title: ui.artistListTitle,
    description: ui.artistListSubtitle,
    alternates: { canonical: url },
    openGraph: { title: ui.artistListTitle, description: ui.artistListSubtitle, url, locale: OG_LOCALE[params.lang] },
  };
}

export default async function ArtistListPage({ params }: Props) {
  if (!isLocale(params.lang)) notFound();
  const lang = params.lang;
  const ui = UI[lang];
  const artists = await getAllArtists(lang);

  return (
    <PageShell lang={lang}>
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
