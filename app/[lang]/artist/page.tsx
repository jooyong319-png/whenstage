import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllArtists } from '@/lib/artists';
import { CATEGORY_META } from '@/lib/types';
import { PageShell } from '@/components/PageShell';
import { ArtistCard } from '@/components/ArtistCard';
import { RevealGroup, RevealItem } from '@/components/motion/Reveal';
import { UI, LOCALES, type Locale } from '@/lib/i18nLabels';
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
  return {
    title: ui.artistListTitle,
    description: ui.artistListSubtitle,
    alternates: { canonical: `https://whenstage.com/${params.lang}/artist` },
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
        <header className={blogStyles.header}>
          <h1 className={blogStyles.title}>
            <svg className="ic" aria-hidden="true"><use href="#ic-star" /></svg> {ui.artistListTitle}
          </h1>
          <p className={blogStyles.subtitle}>{ui.artistListSubtitle}</p>
        </header>

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
                <RevealItem key={a.slug}>
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
