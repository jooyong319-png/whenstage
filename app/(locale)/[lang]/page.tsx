import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllGames, getLastUpdated } from '@/lib/games';
import { getArtistAliases, getArtistImageMap } from '@/lib/artists';
import { normalizeArtistKey } from '@/lib/types';
import { Home } from '@/components/Home';
import { UI, LOCALES, OG_LOCALE, type Locale } from '@/lib/i18nLabels';

interface Props {
  params: { lang: string };
}

function isLocale(v: string): v is Locale {
  return (LOCALES as string[]).includes(v);
}

export async function generateStaticParams() {
  return LOCALES.map(lang => ({ lang }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!isLocale(params.lang)) return {};
  const ui = UI[params.lang];
  const url = `https://whenstage.com/${params.lang}`;
  return {
    title: ui.siteName,
    description: ui.siteDescription,
    alternates: {
      canonical: url,
      languages: {
        ko: 'https://whenstage.com/ko',
        en: 'https://whenstage.com/en',
        ja: 'https://whenstage.com/ja',
        'x-default': 'https://whenstage.com/',
      },
    },
    openGraph: { title: ui.siteName, description: ui.siteDescription, url, type: 'website', locale: OG_LOCALE[params.lang] },
  };
}

export default async function LocaleHomePage({ params }: Props) {
  if (!isLocale(params.lang)) notFound();
  const lang = params.lang;
  const ui = UI[lang];

  const games = await getAllGames(lang);
  const lastUpdated = await getLastUpdated(lang);
  const artistAliases = await getArtistAliases();
  // 카드 이미지 맵(gameId → 최적 이미지): 콘서트 image_url 우선, 없으면 developer로 아티스트
  // 큐레이션 이미지 폴백. "다가오는 일정" 이미지 스트립이 이걸로 밋밋한 빈 카드를 줄인다.
  const artistImgs = await getArtistImageMap();
  const cardImages: Record<string, string> = {};
  for (const g of games) {
    const img = g.image_url || (g.developer ? artistImgs[normalizeArtistKey(g.developer)] : undefined);
    if (img) cardImages[g.id] = img;
  }
  const serverNow = new Date().toISOString();

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: ui.siteName,
    url: `https://whenstage.com/${lang}`,
    description: ui.siteDescription,
    inLanguage: lang,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      <Home initialGames={games} lastUpdated={lastUpdated} serverNow={serverNow} artistAliases={artistAliases} cardImages={cardImages} />
    </>
  );
}
