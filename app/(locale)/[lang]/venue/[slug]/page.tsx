import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllVenues, getVenueBySlug, isVenueIndexable, venueDescription } from '@/lib/venues';
import { PageShell } from '@/components/PageShell';
import { EventList } from '@/components/EventList';
import { UI, LOCALES, OG_LOCALE, DEFAULT_OG_IMAGE, type Locale } from '@/lib/i18nLabels';
import { breadcrumbLd, jsonLd } from '@/lib/seo';
import styles from '@/app/blog/blog.module.css';

interface Props { params: { lang: string; slug: string }; }
function isLocale(v: string): v is Locale { return (LOCALES as string[]).includes(v); }

// 빌드에 없는 slug는 하드 404(soft-404 방지) — 콘텐츠가 모두 빌드 시점에 정해지므로 안전
export const dynamicParams = false;

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
  // 23자짜리 "이름 · N개 일정"이던 것을 실제 정보로 바꿨다(→ lib/venues.ts)
  const desc = venueDescription(venue, params.lang);
  return {
    title: venue.name,
    description: desc,
    alternates: { canonical: url },
    // 공연 하나뿐이면 그 공연 상세와 중복 — 색인 제외(follow는 유지)
    ...(isVenueIndexable(venue) ? {} : { robots: { index: false, follow: true } }),
    openGraph: { title: venue.name, description: desc, url, locale: OG_LOCALE[params.lang], images: [DEFAULT_OG_IMAGE] },
  };
}

export default async function VenueDetailPage({ params }: Props) {
  if (!isLocale(params.lang)) notFound();
  const lang = params.lang;
  const ui = UI[lang];
  const venue = await getVenueBySlug(params.slug, lang);
  if (!venue) notFound();

  const venueLd = {
    '@context': 'https://schema.org',
    '@type': 'MusicVenue',
    name: venue.name,
    url: `https://whenstage.com/${lang}/venue/${encodeURIComponent(venue.slug)}`,
  };

  const crumbLd = breadcrumbLd([
    { name: 'WhenStage', url: `https://whenstage.com/${lang}` },
    { name: lang === 'ja' ? '会場' : lang === 'en' ? 'Venues' : '공연장', url: `https://whenstage.com/${lang}/venue` },
    { name: venue.name, url: `https://whenstage.com/${lang}/venue/${encodeURIComponent(venue.slug)}` },
  ]);

  return (
    <PageShell lang={lang}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(venueLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(crumbLd) }} />
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
