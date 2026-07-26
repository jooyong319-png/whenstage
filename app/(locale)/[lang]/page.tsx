import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllGames, getLastUpdated } from '@/lib/games';
import { getArtistAliases, getArtistImageMap } from '@/lib/artists';
import { getAllNews } from '@/lib/news';
import { normalizeArtistKey } from '@/lib/types';
import { Home } from '@/components/Home';
import { UI, LOCALES, OG_LOCALE, DEFAULT_OG_IMAGE, type Locale } from '@/lib/i18nLabels';

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
    openGraph: { title: ui.siteName, description: ui.siteDescription, url, type: 'website', locale: OG_LOCALE[params.lang], images: [DEFAULT_OG_IMAGE] },
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

  // 홈 하단 "최신 소식" — 캘린더 아래 빈 공간을 실콘텐츠로 채우고, 매일 갱신되는 뉴스로
  // 크로스링크/체류시간을 늘린다. content 본문은 무거우니 카드에 필요한 필드만 추림.
  const allNews = await getAllNews(lang);
  const latestNews = allNews.slice(0, 4).map(n => ({
    slug: n.slug,
    title: n.title,
    description: n.description,
    date: n.date,
    heroImage: n.heroImage,
  }));

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: ui.siteName,
    url: `https://whenstage.com/${lang}`,
    description: ui.siteDescription,
    inLanguage: lang,
    // 사이트링크 검색창 — Home이 ?q= 파라미터를 읽어 공연명 검색을 실행한다.
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `https://whenstage.com/${lang}?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      <Home initialGames={games} lastUpdated={lastUpdated} serverNow={serverNow} artistAliases={artistAliases} cardImages={cardImages} latestNews={latestNews} />
    </>
  );
}
