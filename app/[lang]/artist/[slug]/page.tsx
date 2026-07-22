import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllArtists, getArtistBySlug } from '@/lib/artists';
import { PageShell } from '@/components/PageShell';
import { ArtistEventList } from '@/components/ArtistEventList';
import { UI, LOCALES, type Locale } from '@/lib/i18nLabels';
import styles from '@/app/blog/blog.module.css';

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
  const desc = `${artist.name} · ${artist.events.length}${params.lang === 'ko' ? '개 일정' : params.lang === 'ja' ? '件' : ' events'}`;
  return {
    title: `${artist.name} | ${UI[params.lang].siteName}`,
    description: desc,
    alternates: { canonical: url },
    openGraph: { title: artist.name, description: desc, url, images: artist.image ? [{ url: artist.image }] : undefined },
  };
}

export default async function ArtistDetailPage({ params }: Props) {
  if (!isLocale(params.lang)) notFound();
  const lang = params.lang;
  const ui = UI[lang];
  const artist = await getArtistBySlug(params.slug, lang);
  if (!artist) notFound();

  return (
    <PageShell lang={lang}>
      <article className={styles.post}>
        <a href={`/${lang}/artist`} className={styles.backLink}>{ui.backToList}</a>
        <header className={styles.postHeader}>
          <h1 className={styles.postH1}>{artist.name}</h1>
          <p className={styles.postLead}>
            {artist.events.length}{lang === 'ko' ? '개 일정' : lang === 'ja' ? '件' : ' events'}
            {artist.upcomingCount > 0 ? ` · ${artist.upcomingCount}${ui.artistUpcomingCount}` : ''}
          </p>
        </header>

        {artist.events.length === 0 ? (
          <p className={styles.empty}>{ui.artistNoEvents}</p>
        ) : (
          <ArtistEventList events={artist.events} />
        )}
      </article>
    </PageShell>
  );
}
