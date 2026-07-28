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

// IANA 타임존 이름 → 그 날짜에 실제로 적용되는 UTC 오프셋 문자열("+09:00").
// DST가 있는 지역은 같은 타임존이라도 계절에 따라 오프셋이 달라지므로(PST -08:00 / PDT -07:00)
// 항목의 공연일을 기준으로 계산한다. 공연 시각을 UTC로 가정해 한 번 찔러보는 방식이라 DST 전환
// 시각(대개 현지 새벽 2~3시) 언저리에서는 한 시간 어긋날 수 있지만, 공연이 그 시각에 시작하는
// 경우는 없다. 판정 불가(구형 런타임 등)면 null을 돌려 호출부가 오프셋 없이 나가게 둔다.
function utcOffset(timeZone: string, date: string, time: string): string | null {
  try {
    const probe = new Date(`${date}T${time}:00Z`);
    if (Number.isNaN(probe.getTime())) return null;
    const name = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'longOffset' })
      .formatToParts(probe)
      .find(p => p.type === 'timeZoneName')?.value;
    if (!name) return null;
    if (name === 'GMT') return '+00:00'; // UTC 지역은 오프셋 없이 "GMT"로만 나온다
    return name.match(/GMT([+-]\d{2}:\d{2})/)?.[1] ?? null;
  } catch {
    return null;
  }
}

// 구조화 데이터(Event.startDate)용 시각 문자열.
// 오프셋 없이 "2026-08-07T19:00"만 내보내면 구글이 어느 시간대인지 알 수 없어 검색결과에 공연
// 시각이 엉뚱하게 표시될 수 있다. timezone(IANA)은 데이터에 이미 있으니 그걸로 오프셋을 붙인다.
// 시각을 모르면 날짜만 — 없는 정밀도를 지어내지 않는다(구글도 date-only를 정식으로 받는다).
export function eventStartDate(date: string, time: string | null, timeZone: string): string {
  if (!time) return date;
  const offset = utcOffset(timeZone, date, time);
  return offset ? `${date}T${time}:00${offset}` : `${date}T${time}:00`;
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
