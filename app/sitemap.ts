import type { MetadataRoute } from 'next';
import { getAllGames, getLastUpdated } from '@/lib/games';
import { getAllPosts, getPostTranslation } from '@/lib/blog';
import { getAllNews } from '@/lib/news';
import { getAllArtists } from '@/lib/artists';
import { hasActiveTicketing, type Game } from '@/lib/types';
import { LOCALES, type Locale } from '@/lib/i18nLabels';

const BASE = 'https://whenstage.com';

function staticAlternates(path: (lang: Locale) => string): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const lang of LOCALES) languages[lang] = `${BASE}${path(lang)}`;
  return languages;
}

const STATIC_PAGES: { path: (lang: Locale) => string; changeFrequency: 'daily' | 'monthly' | 'yearly'; priority: number }[] = [
  { path: lang => `/${lang}`, changeFrequency: 'daily', priority: 0.9 },
  { path: lang => `/${lang}/news`, changeFrequency: 'daily', priority: 0.7 },
  { path: lang => `/${lang}/artist`, changeFrequency: 'daily', priority: 0.65 },
  { path: lang => `/${lang}/blog`, changeFrequency: 'daily', priority: 0.65 },
  { path: lang => `/${lang}/guide`, changeFrequency: 'monthly', priority: 0.6 },
  { path: lang => `/${lang}/about`, changeFrequency: 'monthly', priority: 0.45 },
  { path: lang => `/${lang}/contact`, changeFrequency: 'monthly', priority: 0.35 },
  { path: lang => `/${lang}/privacy`, changeFrequency: 'yearly', priority: 0.25 },
  { path: lang => `/${lang}/terms`, changeFrequency: 'yearly', priority: 0.25 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  // ko/en/ja 완전 대칭 정적 페이지 — 언어별로 항상 존재하므로 hreflang alternate 전부 포함
  const staticUrls: MetadataRoute.Sitemap = [];
  for (const page of STATIC_PAGES) {
    for (const lang of LOCALES) {
      staticUrls.push({
        url: `${BASE}${page.path(lang)}`,
        lastModified: now,
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
    const dataUpdated = new Date(await getLastUpdated(lang));
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

  // 블로그 — ko 원본은 항상 존재, en/ja는 번역 파일(.en.md/.ja.md)이 있는 것만 URL 생성
  const posts = await getAllPosts();
  const blogUrls: MetadataRoute.Sitemap = [];
  for (const p of posts) {
    const [enT, jaT] = await Promise.all([getPostTranslation(p.slug, 'en'), getPostTranslation(p.slug, 'ja')]);
    const languages: Record<string, string> = { ko: `${BASE}/ko/blog/${p.slug}` };
    if (enT) languages.en = `${BASE}/en/blog/${p.slug}`;
    if (jaT) languages.ja = `${BASE}/ja/blog/${p.slug}`;
    const lastModified = new Date(p.date);
    blogUrls.push({ url: `${BASE}/ko/blog/${p.slug}`, lastModified, changeFrequency: 'monthly', priority: 0.75, alternates: { languages } });
    if (enT) blogUrls.push({ url: `${BASE}/en/blog/${p.slug}`, lastModified, changeFrequency: 'monthly', priority: 0.65, alternates: { languages } });
    if (jaT) blogUrls.push({ url: `${BASE}/ja/blog/${p.slug}`, lastModified, changeFrequency: 'monthly', priority: 0.65, alternates: { languages } });
  }

  // 뉴스 — 콘서트와 동일하게 로케일별로 완전히 독립된 콘텐츠(번역 아님) → hreflang alternate 없음
  const newsUrls: MetadataRoute.Sitemap = [];
  for (const lang of LOCALES) {
    const news = await getAllNews(lang);
    for (const it of news) {
      newsUrls.push({
        url: `${BASE}/${lang}/news/${it.slug}`,
        lastModified: new Date(it.date),
        changeFrequency: 'weekly',
        priority: lang === 'ko' ? 0.7 : 0.6,
      });
    }
  }

  // 아티스트 상세 — 콘서트와 마찬가지로 로케일별 독립 그룹핑(번역 아님) → hreflang alternate 없음
  const artistUrls: MetadataRoute.Sitemap = [];
  for (const lang of LOCALES) {
    const artists = await getAllArtists(lang);
    for (const a of artists) {
      artistUrls.push({
        url: `${BASE}/${lang}/artist/${encodeURIComponent(a.slug)}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: a.upcomingCount > 0 ? 0.6 : 0.45,
      });
    }
  }

  return [...staticUrls, ...gameUrls, ...blogUrls, ...newsUrls, ...artistUrls];
}
