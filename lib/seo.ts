// SEO 구조화 데이터(JSON-LD) 공용 헬퍼 — fs/브라우저 의존 없는 순수 모듈.
import { LOCALES, type Locale } from './i18nLabels';

const BASE = 'https://whenstage.com';

// ko/en/ja가 완전 대칭으로 존재하는 페이지(소개·약관·목록 등)의 canonical + hreflang 묶음.
// 사이트맵(app/sitemap.ts)에도 같은 alternate가 들어가지만, head의 <link rel="alternate">가
// 있어야 구글이 언어 묶음을 훨씬 빨리 잡는다. 로케일별로 내용이 독립인 상세 페이지
// (concert/artist/venue/blog/news)는 서로 번역 관계가 아니므로 여기 쓰면 안 된다.
export function localeAlternates(path: string, lang: Locale) {
  const languages: Record<string, string> = {};
  for (const l of LOCALES) languages[l] = `${BASE}/${l}${path}`;
  languages['x-default'] = `${BASE}/ko${path}`;
  return { canonical: `${BASE}/${lang}${path}`, languages };
}

// BreadcrumbList — 상세 페이지 계층(홈 > 섹션 > 항목)을 SERP 빵부스러기로 노출.
export function breadcrumbLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

// 여러 JSON-LD를 한 <script>에 안전하게 넣기 위한 직렬화(</script> 이스케이프).
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
