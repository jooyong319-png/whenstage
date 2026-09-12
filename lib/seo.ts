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

// ── 공연 상세 검색 스니펫 ──────────────────────────────────────────────────
//
// 왜 이게 있나 (2026-09-12 실측)
//
// 상세 페이지 제목이 **공연명뿐**이라, 이 사이트가 가진 값(언제·어디서)이 검색 결과에
// 하나도 안 보였다. 사람들이 "스티브 레이시 내한"을 검색하는 이유가 바로 그 날짜인데.
//
//   Steve Lacy 내한   노출 737 · 클릭 4   (CTR 0.5%)
//   쏜애플 나의 세기   노출 638 · 클릭 11  (CTR 1.7%)
//   빅뱅 리스닝파티    노출 128 · 클릭 19  (CTR 14.8%)  ← 검색어와 공연명이 우연히 일치
//
// 빅뱅만 높은 게 핵심이다 — 검색어가 공연명과 안 겹치면 제목이 아무 답도 못 해서 CTR이
// 1% 밑으로 떨어진다. 그래서 날짜(와 자리가 되면 공연장)를 제목·설명 앞으로 끌어낸다.
// 목록 페이지가 이미 `*MetaTitle`로 화면 제목과 검색 제목을 나눠 쓰고 있는데(i18nLabels.ts),
// 상세 페이지만 그 처리가 빠져 있었다. 경위는 wiki/decisions.md 2026-09-12 항목.

/** SERP 제목 예산 — 글자 수가 아니라 **표시 폭**(반각 기준)으로 잰다.
 *  글자 수로 재면 한글 제목은 폭이 두 배라 과하게 잘리고, 로마자 제목은 남는 자리를 못 쓴다.
 *  구글이 자르는 지점은 대략 66반각인데 브랜드 접미사(' | WhenStage' = 12)가 뒤에 붙으므로
 *  본문 몫은 54. 자르는 폭은 기기·글꼴에 따라 흔들려서 조금 넉넉히 58로 둔다. */
const TITLE_WIDTH = 58;

/** 전각(한글·가나·한자·전각 기호)은 2, 나머지는 1로 센 표시 폭. */
function displayWidth(s: string): number {
  let w = 0;
  for (const ch of s) {
    const c = ch.codePointAt(0) ?? 0;
    w += (c >= 0x1100 && c <= 0x115f) || (c >= 0x2e80 && c <= 0xa4cf)
      || (c >= 0xac00 && c <= 0xd7a3) || (c >= 0xf900 && c <= 0xfaff)
      || (c >= 0xfe30 && c <= 0xfe6f) || (c >= 0xff00 && c <= 0xff60)
      || (c >= 0xffe0 && c <= 0xffe6) ? 2 : 1;
  }
  return w;
}

/** 공연명 뒤에 붙은 병기 괄호를 뗀다 — "코다라인 내한공연 (Kodaline - Farewell Tour in Seoul)"
 *  → "코다라인 내한공연". 제목이 예산을 넘을 때만 쓴다(병기는 로마자 검색어 매칭에 쓸모가
 *  있어서 자리가 되면 그대로 둔다). lib/types.ts의 normalizeArtistKey와 같은 발상. */
function stripParenthetical(name: string): string {
  const s = name.replace(/[（(][^）)]*[）)]\s*$/, '').trim();
  return s.length >= 4 ? s : name;   // 괄호를 떼고 남는 게 거의 없으면 원본을 쓴다
}

/** 검색 스니펫 설명 길이 — 구글·네이버 모두 대략 이 근처에서 자른다. */
const DESC_BUDGET = 158;

/** 'YYYY-MM-DD' → 'YYYY.MM.DD'.
 *  ⚠️ `new Date()`로 파싱하지 않는다 — release_date는 시각이 없어 UTC 자정으로 읽히고,
 *  빌드 머신이 UTC보다 뒤인 타임존이면 `getDate()`가 **하루 전**을 돌려준다. 스키마상
 *  항상 'YYYY-MM-DD'이므로 문자열 치환이 같은 결과이면서 타임존 사고가 원천적으로 없다. */
export function metaDate(release_date: string): string {
  return release_date.replace(/-/g, '.');
}

/** 공연 상세의 검색 제목: `공연명 — 날짜 공연장`.
 *
 *  자리가 모자라면 ① 공연장을 버리고 ② 그래도 넘치면 병기 괄호를 뗀다.
 *  ⚠️ **공연명을 말줄임으로 자르지는 않는다.** 처음엔 날짜를 지키려고 이름을 잘랐는데,
 *  실제 데이터에 대보니 `코다라인 내한공연 (Kodaline… — 2026.08.12`처럼 괄호 한가운데가
 *  끊겨 오히려 지저분했다. 특히 CTR 14.8%로 이미 잘 나오던 빅뱅 페이지까지 망가졌다 —
 *  잘 되는 걸 깨뜨리면서 얻을 이득이 아니다. 그래서 그런 항목은 날짜를 뒤에 붙이기만 하고
 *  잘리는 건 구글에 맡긴다(잘려도 지금보다 나빠지지 않는다). */
export function concertMetaTitle(
  name: string,
  release_date: string,
  venue: string | null,
  _lang: Locale,
): string {
  const date = metaDate(release_date);
  const fits = (s: string) => displayWidth(s) <= TITLE_WIDTH;

  const candidates = [
    venue ? `${name} — ${date} ${venue}` : null,
    `${name} — ${date}`,
  ].filter((s): s is string => s !== null);

  for (const c of candidates) if (fits(c)) return c;

  const short = stripParenthetical(name);
  if (short !== name) {
    const shortened = [
      venue ? `${short} — ${date} ${venue}` : null,
      `${short} — ${date}`,
    ].filter((s): s is string => s !== null);
    for (const c of shortened) if (fits(c)) return c;
  }

  // 여기까지 왔으면 이름만으로 예산을 넘는다(공식 투어명이 긴 경우 — 실측 38%).
  // 날짜를 **앞으로** 보낸다. 뒤에 두면 잘려 나가 이 변경의 목적이 사라지는데,
  // 이름 꼬리가 잘리는 건 검색 결과에서 원래 흔한 모양이라 어색하지 않다.
  return `${date} — ${short}`;
}

/** 공연 상세의 검색 설명: `날짜 · 공연장 · 아티스트. 원문 설명…`
 *  구분자를 언어 중립(` · `)으로 둬서 세 로케일 모두 어순 문제가 없다.
 *  원문 설명이 없으면 카테고리 라벨로 대신한다(호출부가 로케일에 맞게 넘긴다). */
export function concertMetaDescription(p: {
  release_date: string;
  venue: string | null;
  artist: string | null;
  description: string | null;
  categoryLabel: string;
}): string {
  const lead = [metaDate(p.release_date), p.venue, p.artist].filter(Boolean).join(' · ');
  const body = p.description?.trim() || p.categoryLabel;
  const full = `${lead}. ${body}`;
  return full.length <= DESC_BUDGET ? full : `${full.slice(0, DESC_BUDGET - 1).trimEnd()}…`;
}
