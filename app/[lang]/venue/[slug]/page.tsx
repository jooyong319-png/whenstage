import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllVenues, getVenueBySlug } from '@/lib/venues';
import { PageShell } from '@/components/PageShell';
import { EventList } from '@/components/EventList';
import { UI, LOCALES, type Locale } from '@/lib/i18nLabels';
import styles from '@/app/blog/blog.module.css';

interface Props { params: { lang: string; slug: string }; }
function isLocale(v: string): v is Locale { return (LOCALES as string[]).includes(v); }

export async function generateStaticParams() {
  const params: { lang: Locale; slug: string }[] = [];
  for (const lang of LOCALES) {
    const venues = await getAllVenues(lang);
    for (const v of venues) params.push({ lang, slug: v.slug });
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!isLocale(params.lang)) return {};
  const venue = await getVenueBySlug(params.slug, params.lang);
  if (!venue) return { title: UI[params.lang].notFound };
  const url = `https://whenstage.com/${params.lang}/venue/${encodeURIComponent(venue.slug)}`;
  const desc = `${venue.name} · ${venue.events.length}${params.lang === 'ko' ? '개 일정' : params.lang === 'ja' ? '件' : ' events'}`;
  return {
    title: `${venue.name} | ${UI[params.lang].siteName}`,
    description: desc,
    alternates: { canonical: url },
  };
}

export default async function VenueDetailPage({ params }: Props) {
  if (!isLocale(params.lang)) notFound();
  const lang = params.lang;
  const ui = UI[lang];
  const venue = await getVenueBySlug(params.slug, lang);
  if (!venue) notFound();

  return (
    <PageShell lang={lang}>
      <article className={styles.post}>
        <a href={`/${lang}/venue`} className={styles.backLink}>{ui.backToList}</a>
        <header className={styles.postHeader}>
          <h1 className={styles.postH1}>{venue.name}</h1>
          <p className={styles.postLead}>
            {venue.events.length}{lang === 'ko' ? '개 일정' : lang === 'ja' ? '件' : ' events'}
            {venue.upcomingCount > 0 ? ` · ${venue.upcomingCount}${ui.artistUpcomingCount}` : ''}
          </p>
        </header>

        {venue.events.length === 0 ? (
          <p className={styles.empty}>{ui.artistNoEvents}</p>
        ) : (
          <EventList events={venue.events} />
        )}
      </article>
    </PageShell>
  );
}
