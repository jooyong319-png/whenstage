import type { MetadataRoute } from 'next';
import { getAllGames, getLastUpdated } from '@/lib/games';
import { getAllPosts } from '@/lib/blog';
import { getAllNews } from '@/lib/news';
import { getAllArtists, isArtistIndexable } from '@/lib/artists';
import { getAllVenues, isVenueIndexable } from '@/lib/venues';
import { hasActiveTicketing, type Game } from '@/lib/types';
import { LOCALES, type Locale } from '@/lib/i18nLabels';

const BASE = 'https://whenstage.com';

function staticAlternates(path: (lang: Locale) => string): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const lang of LOCALES) languages[lang] = `${BASE}${path(lang)}`;
  return languages;
}

// source: 이 페이지의 lastmod를 무엇으로 볼지. 'games'/'news'/'blog'는 해당 데이터의 실제 최신
// 변경일을, 'none'은 lastmod 자체를 생략한다(약관·소개처럼 배포와 무관하게 안 바뀌는 페이지).
// 예전엔 전부 빌드 시각(new Date())을 넣었는데, 그러면 배포만 해도 전 URL이 "방금 수정됨"이 되어
// 구글이 lastmod를 통째로 무시한다 — 사이트맵 394개 중 224개가 매번 같은 오늘 날짜였음.
type LastmodSource = 'games' | 'news' | 'blog' | 'none';

const STATIC_PAGES: { path: (lang: Locale) => string; changeFrequency: 'daily' | 'monthly' | 'yearly'; priority: number; source: LastmodSource }[] = [
  { path: lang => `/${lang}`, changeFrequency: 'daily', priority: 0.9, source: 'games' },
  { path: lang => `/${lang}/news`, changeFrequency: 'daily', priority: 0.7, source: 'news' },
  // 공연 목록 — 상세 페이지로 가는 크롤 경로이자 "9월 콘서트" 같은 검색을 받는다
  { path: lang => `/${lang}/concert`, changeFrequency: 'daily', priority: 0.7, source: 'games' },
  { path: lang => `/${lang}/artist`, changeFrequency: 'daily', priority: 0.65, source: 'games' },
  { path: lang => `/${lang}/venue`, changeFrequency: 'daily', priority: 0.6, source: 'games' },
  { path: lang => `/${lang}/blog`, changeFrequency: 'daily', priority: 0.65, source: 'blog' },
  { path: lang => `/${lang}/guide`, changeFrequency: 'monthly', priority: 0.6, source: 'none' },
  { path: lang => `/${lang}/guide/glossary`, changeFrequency: 'monthly', priority: 0.5, source: 'none' },
  { path: lang => `/${lang}/about`, changeFrequency: 'monthly', priority: 0.45, source: 'none' },
  { path: lang => `/${lang}/contact`, changeFrequency: 'monthly', priority: 0.35, source: 'none' },
  { path: lang => `/${lang}/privacy`, changeFrequency: 'yearly', priority: 0.25, source: 'none' },
  { path: lang => `/${lang}/terms`, changeFrequency: 'yearly', priority: 0.25, source: 'none' },
];

// 목록에서 가장 최근 날짜 하나 — 목록 페이지의 lastmod로 씀(없으면 undefined → lastmod 생략).
function newestDate(dates: string[]): Date | undefined {
  let newest: number | undefined;
  for (const d of dates) {
    const t = new Date(d).getTime();
    if (!Number.isNaN(t) && (newest === undefined || t > newest)) newest = t;
  }
  return newest === undefined ? undefined : new Date(newest);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  // 로케일별 실제 콘텐츠 변경일 — 정적 목록 페이지들의 lastmod 재료
  const dataUpdatedByLocale: Record<Locale, Date> = {
    ko: new Date(await getLastUpdated('ko')),
    en: new Date(await getLastUpdated('en')),
    ja: new Date(await getLastUpdated('ja')),
  };
  const postsByLocale: Record<Locale, Awaited<ReturnType<typeof getAllPosts>>> = {
    ko: await getAllPosts('ko'),
    en: await getAllPosts('en'),
    ja: await getAllPosts('ja'),
  };
  const newsByLocale: Record<Locale, Awaited<ReturnType<typeof getAllNews>>> = {
    ko: await getAllNews('ko'),
    en: await getAllNews('en'),
    ja: await getAllNews('ja'),
  };

  function staticLastmod(source: LastmodSource, lang: Locale): Date | undefined {
    if (source === 'games') return dataUpdatedByLocale[lang];
    if (source === 'blog') return newestDate(postsByLocale[lang].map(p => p.date));
    if (source === 'news') return newestDate(newsByLocale[lang].map(n => n.date));
    return undefined;
  }

  // ko/en/ja 완전 대칭 정적 페이지 — 언어별로 항상 존재하므로 hreflang alternate 전부 포함
  const staticUrls: MetadataRoute.Sitemap = [];
  for (const page of STATIC_PAGES) {
    for (const lang of LOCALES) {
      const lastModified = staticLastmod(page.source, lang);
      staticUrls.push({
        url: `${BASE}${page.path(lang)}`,
        ...(lastModified ? { lastModified } : {}),
        changeFrequency: page.changeFrequency,
        priority: page.priority,
        alternates: { languages: staticAlternates(page.path) },
      });
    }
  }

  // 콘서트/발매 상세 — 로케일별로 완전히 독립된 데이터(id가 서로 다름)라 기본적으로 언어간
  // hreflang 매핑이 없지만, 같은 물리적 공연이 related_locale_ids로 다른 로케일에도 등재된
  // 경우(선택적 크로스 등재)에는 그 페어에만 hreflang alternate를 붙인다.
  const gamesByLocale: Record<Locale, Game[]> = {
    ko: await getAllGames('ko'),
    en: await getAllGames('en'),
    ja: await getAllGames('ja'),
  };
  const idSets: Record<Locale, Set<string>> = {
    ko: new Set(gamesByLocale.ko.map(g => g.id)),
    en: new Set(gamesByLocale.en.map(g => g.id)),
    ja: new Set(gamesByLocale.ja.map(g => g.id)),
  };

  const gameUrls: MetadataRoute.Sitemap = [];
  for (const lang of LOCALES) {
    const dataUpdated = dataUpdatedByLocale[lang];
    for (const g of gamesByLocale[lang]) {
      const upcoming = g.release_date_approx || g.release_date >= todayStr;
      const ticketing = hasActiveTicketing(g);
      const priority = ticketing ? 0.85 : upcoming ? 0.75 : 0.6;

      let alternates: { languages: Record<string, string> } | undefined;
      if (g.related_locale_ids) {
        const languages: Record<string, string> = { [lang]: `${BASE}/${lang}/concert/${g.id}` };
        for (const relLang of LOCALES) {
          const relId = g.related_locale_ids[relLang];
          if (relId && idSets[relLang].has(relId)) languages[relLang] = `${BASE}/${relLang}/concert/${relId}`;
        }
        if (Object.keys(languages).length > 1) alternates = { languages };
      }

      gameUrls.push({
        url: `${BASE}/${lang}/concert/${g.id}`,
        lastModified: dataUpdated,
        changeFrequency: ticketing || upcoming ? 'daily' : 'weekly',
        priority,
        ...(alternates ? { alternates } : {}),
      });
    }
  }

  // 모아보기(블로그) — 콘서트/뉴스와 동일하게 로케일별로 완전히 독립된 콘텐츠(번역 아님) → hreflang alternate 없음
  const blogUrls: MetadataRoute.Sitemap = [];
  for (const lang of LOCALES) {
    for (const p of postsByLocale[lang]) {
      blogUrls.push({
        url: `${BASE}/${lang}/blog/${p.slug}`,
        lastModified: new Date(p.date),
        changeFrequency: 'monthly',
        priority: lang === 'ko' ? 0.75 : 0.65,
      });
    }
  }

  // 뉴스 — 콘서트와 동일하게 로케일별로 완전히 독립된 콘텐츠(번역 아님) → hreflang alternate 없음
  const newsUrls: MetadataRoute.Sitemap = [];
  for (const lang of LOCALES) {
    for (const it of newsByLocale[lang]) {
      newsUrls.push({
        url: `${BASE}/${lang}/news/${it.slug}`,
        lastModified: new Date(it.date),
        changeFrequency: 'weekly',
        priority: lang === 'ko' ? 0.7 : 0.6,
      });
    }
  }

  // 아티스트 상세 — 콘서트와 마찬가지로 로케일별 독립 그룹핑(번역 아님) → hreflang alternate 없음
  // isArtistIndexable로 거른다: 상세 페이지가 noindex인데 사이트맵엔 올리는 건 크롤러에 모순된
  // 신호(색인해달라 ↔ 하지 말라)를 보내는 것이라 서치 콘솔에 그대로 오류로 쌓인다.
  const artistUrls: MetadataRoute.Sitemap = [];
  for (const lang of LOCALES) {
    const artists = await getAllArtists(lang);
    for (const a of artists) {
      if (!isArtistIndexable(a)) continue;
      artistUrls.push({
        url: `${BASE}/${lang}/artist/${encodeURIComponent(a.slug)}`,
        lastModified: dataUpdatedByLocale[lang],
        changeFrequency: 'weekly',
        priority: a.upcomingCount > 0 ? 0.6 : 0.45,
      });
    }
  }

  // 공연장 상세 — 아티스트와 마찬가지로 로케일별 독립 그룹핑(번역 아님) → hreflang alternate 없음
  const venueUrls: MetadataRoute.Sitemap = [];
  for (const lang of LOCALES) {
    const venues = await getAllVenues(lang);
    for (const v of venues) {
      if (!isVenueIndexable(v)) continue; // 상세가 noindex인 것과 신호를 맞춘다(위 아티스트 주석 참고)
      venueUrls.push({
        url: `${BASE}/${lang}/venue/${encodeURIComponent(v.slug)}`,
        lastModified: dataUpdatedByLocale[lang],
        changeFrequency: 'weekly',
        priority: v.upcomingCount > 0 ? 0.55 : 0.4,
      });
    }
  }

  return [...staticUrls, ...gameUrls, ...blogUrls, ...newsUrls, ...artistUrls, ...venueUrls];
}
