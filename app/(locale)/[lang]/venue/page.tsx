import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllVenues } from '@/lib/venues';
import { UI, LOCALES, OG_LOCALE, DEFAULT_OG_IMAGE, type Locale } from '@/lib/i18nLabels';
import { PageShell } from '@/components/PageShell';
import { PageHeader } from '@/components/PageHeader';
import { RevealGroup, RevealItem } from '@/components/motion/Reveal';
import styles from '@/app/blog/blog.module.css';
import vs from './venue.module.css';

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
    openGraph: { title: ui.venueListTitle, description: ui.venueListSubtitle, url, locale: OG_LOCALE[params.lang], images: [DEFAULT_OG_IMAGE] },
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
          <RevealGroup as="ul" className={vs.grid}>
            {venues.map(v => {
              const eventsLabel = `${v.events.length}${lang === 'ko' ? '개 일정' : lang === 'ja' ? '件' : ' events'}`;
              const upcomingLabel = v.upcomingCount > 0 ? ` · ${v.upcomingCount}${ui.artistUpcomingCount}` : '';
              return (
                <RevealItem key={v.slug} as="li" className={vs.card}>
                  <a href={`/${lang}/venue/${encodeURIComponent(v.slug)}`} className={vs.link}>
                    <span className={vs.pin} aria-hidden="true"><svg className="ic"><use href="#ic-pin" /></svg></span>
                    <span className={vs.body}>
                      <span className={vs.name}>{v.name}</span>
                      <span className={vs.count}>{eventsLabel}{upcomingLabel}</span>
                    </span>
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
