import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllVenues } from '@/lib/venues';
import { UI, LOCALES, OG_LOCALE, type Locale } from '@/lib/i18nLabels';
import { PageShell } from '@/components/PageShell';
import { PageHeader } from '@/components/PageHeader';
import { RevealGroup, RevealItem } from '@/components/motion/Reveal';
import styles from '@/app/blog/blog.module.css';

interface Props { params: { lang: string }; }
function isLocale(v: string): v is Locale { return (LOCALES as string[]).includes(v); }

export async function generateStaticParams() {
  return LOCALES.map(lang => ({ lang }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!isLocale(params.lang)) return {};
  const ui = UI[params.lang];
  const url = `https://whenstage.com/${params.lang}/venue`;
  return {
    title: ui.venueListTitle,
    description: ui.venueListSubtitle,
    alternates: { canonical: url },
    openGraph: { title: ui.venueListTitle, description: ui.venueListSubtitle, url, locale: OG_LOCALE[params.lang] },
  };
}

export default async function VenueListPage({ params }: Props) {
  if (!isLocale(params.lang)) notFound();
  const lang = params.lang;
  const ui = UI[lang];
  const venues = await getAllVenues(lang);

  return (
    <PageShell lang={lang}>
      <section className={styles.indexSection}>
        <PageHeader
          icon="ic-pin"
          title={ui.venueListTitle}
          subtitle={ui.venueListSubtitle}
          count={venues.length}
          countLabel={lang === 'ko' ? '곳' : lang === 'ja' ? '会場' : 'venues'}
        />

        {venues.length === 0 ? (
          <p className={styles.empty}>{ui.artistNoEvents}</p>
        ) : (
          <RevealGroup as="ul" className={styles.postList}>
            {venues.map(v => {
              const eventsLabel = `${v.events.length}${lang === 'ko' ? '개 일정' : lang === 'ja' ? '件' : ' events'}`;
              const upcomingLabel = v.upcomingCount > 0 ? ` · ${v.upcomingCount}${ui.artistUpcomingCount}` : '';
              return (
                <RevealItem key={v.slug} as="li" className={styles.postCard}>
                  <a href={`/${lang}/venue/${encodeURIComponent(v.slug)}`} className={styles.postLink}>
                    <div className={styles.postTitle}>{v.name}</div>
                    <p className={styles.postDesc}>{eventsLabel}{upcomingLabel}</p>
                  </a>
                </RevealItem>
              );
            })}
          </RevealGroup>
        )}
      </section>
    </PageShell>
  );
}
