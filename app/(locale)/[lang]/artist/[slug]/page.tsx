import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllArtists, getArtistBySlug } from '@/lib/artists';
import { PageShell } from '@/components/PageShell';
import { EventList } from '@/components/EventList';
import { ArtistAvatar } from '@/components/ArtistAvatar';
import { SidebarSection } from '@/components/SidebarSection';
import { RelatedArtistCard } from '@/components/RelatedArtistCard';
import { UI, LOCALES, OG_LOCALE, type Locale } from '@/lib/i18nLabels';
import styles from '@/app/blog/blog.module.css';
import artistStyles from '../artist.module.css';

interface Props { params: { lang: string; slug: string }; }
function isLocale(v: string): v is Locale { return (LOCALES as string[]).includes(v); }

export async function generateStaticParams() {
  const params: { lang: Locale; slug: string }[] = [];
  for (const lang of LOCALES) {
    const artists = await getAllArtists(lang);
    for (const a of artists) params.push({ lang, slug: a.slug });
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!isLocale(params.lang)) return {};
  const artist = await getArtistBySlug(params.slug, params.lang);
  if (!artist) return { title: UI[params.lang].notFound };
  const url = `https://whenstage.com/${params.lang}/artist/${encodeURIComponent(artist.slug)}`;
  const countTxt = `${artist.name} · ${artist.events.length}${params.lang === 'ko' ? '개 일정' : params.lang === 'ja' ? '件' : ' events'}`;
  const desc = artist.bio ? `${artist.bio.text} (${countTxt})` : countTxt;
  return {
    title: `${artist.name} | ${UI[params.lang].siteName}`,
    description: desc,
    alternates: { canonical: url },
    openGraph: { title: artist.name, description: desc, url, locale: OG_LOCALE[params.lang], images: artist.image ? [{ url: artist.image }] : undefined },
  };
}

export default async function ArtistDetailPage({ params }: Props) {
  if (!isLocale(params.lang)) notFound();
  const lang = params.lang;
  const ui = UI[lang];
  const artist = await getArtistBySlug(params.slug, lang);
  if (!artist) notFound();

  const others = (await getAllArtists(lang))
    .filter(a => a.slug !== artist.slug && a.upcomingCount > 0)
    .slice(0, 4);
  const popularLabel = lang === 'ko' ? '이런 아티스트는 어때요?' : lang === 'ja' ? '他にはこんなアーティストも' : 'You might also like';
  const seeAll = lang === 'ko' ? '아티스트 전체 목록' : lang === 'ja' ? 'アーティスト一覧' : 'See all artists';
  const sidebar = others.length > 0 ? (
    <SidebarSection title={popularLabel} moreHref={`/${lang}/artist`} moreLabel={seeAll}>
      {others.map(a => (
        <RelatedArtistCard
          key={a.slug}
          href={`/${lang}/artist/${encodeURIComponent(a.slug)}`}
          name={a.name}
          image={a.image}
          metaText={`${a.upcomingCount}${ui.artistUpcomingCount}`}
        />
      ))}
    </SidebarSection>
  ) : undefined;

  const artistLd = {
    '@context': 'https://schema.org',
    '@type': 'MusicGroup',
    name: artist.name,
    url: `https://whenstage.com/${lang}/artist/${encodeURIComponent(artist.slug)}`,
    ...(artist.image ? { image: artist.image } : {}),
    ...(artist.bio?.text ? { description: artist.bio.text } : {}),
  };

  return (
    <PageShell lang={lang} sidebar={sidebar}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(artistLd) }} />
      <article className={styles.post}>
        <a href={`/${lang}/artist`} className={styles.backLink}>{ui.backToList}</a>
        <header className={styles.postHeader}>
          <div className={artistStyles.headerRow}>
            <ArtistAvatar src={artist.image} name={artist.name} />
            <div className={artistStyles.headerText}>
              <h1 className={styles.postH1}>{artist.name}</h1>
              <p className={styles.postLead}>
                {artist.events.length}{lang === 'ko' ? '개 일정' : lang === 'ja' ? '件' : ' events'}
                {artist.upcomingCount > 0 ? ` · ${artist.upcomingCount}${ui.artistUpcomingCount}` : ''}
              </p>
            </div>
          </div>
        </header>

        {artist.bio && (
          <div className={artistStyles.bioSection}>
            <p className={artistStyles.bioText}>{artist.bio.text}</p>
            {(artist.bio.agency || artist.bio.members || artist.bio.debut) && (
              <div className={artistStyles.factGrid}>
                {artist.bio.agency && (
                  <div className={artistStyles.factCard}>
                    <span className={artistStyles.factLabel}>{ui.bioAgency}</span>
                    <span className={artistStyles.factValue}>{artist.bio.agency}</span>
                  </div>
                )}
                {artist.bio.members && (
                  <div className={artistStyles.factCard}>
                    <span className={artistStyles.factLabel}>{ui.bioMembers}</span>
                    <span className={artistStyles.factValue}>{artist.bio.members}</span>
                  </div>
                )}
                {artist.bio.debut && (
                  <div className={artistStyles.factCard}>
                    <span className={artistStyles.factLabel}>{ui.bioDebut}</span>
                    <span className={artistStyles.factValue}>{artist.bio.debut}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {artist.events.length === 0 ? (
          <p className={styles.empty}>{ui.artistNoEvents}</p>
        ) : (
          <EventList events={artist.events} />
        )}
      </article>
    </PageShell>
  );
}
