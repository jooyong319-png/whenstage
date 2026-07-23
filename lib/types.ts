// 콘서트/음원 발매 캘린더 데이터 타입 정의 (data/concerts.{ko,en,ja}.json의 스키마)
// ※ ko/en/ja는 서로 번역 관계가 아니라 완전히 독립된 콘텐츠(국가/지역별 실제 공연).
//   그래서 name_en/name_ja 같은 번역 필드 없이 언어별 파일 각각이 자체 완결형.

// "에스파(aespa)" / "에스파" 처럼 표기가 갈려도 같은 아티스트로 묶기 위해 괄호(반각/전각) 안 로마자
// 병기를 떼고 비교한다. 완벽한 정규화는 아니지만(오탈자까지는 못 잡음) 실전에서 가장 흔한
// "같은 이름, 로마자 유무만 다름" 케이스를 커버한다. fs 의존 없는 순수 함수 — 클라이언트
// 컴포넌트(검색 등)에서도 그대로 import 가능하도록 여기(server-only가 아닌 lib/types.ts)에 둔다.
export function normalizeArtistKey(name: string): string {
  return name.replace(/[（(][^）)]*[）)]/g, '').trim().normalize('NFC');
}

export type Category =
  | 'concert_tour'   // 콘서트·내한 공연
  | 'music_release'  // 음원 발매(컴백)
  | 'festival'       // 페스티벌
  | 'fanmeeting';     // 팬미팅

// 로케일 코드 — lib/i18nLabels.ts의 Locale과 구조적으로 동일하지만, 그쪽이 이 파일의 Category를
// import하므로 순환참조를 피하려고 여기 별도로 정의한다.
export type LocaleCode = 'ko' | 'en' | 'ja';

// 페스티벌 데이별 라인업(festival 카테고리만 사용, 그 외 카테고리는 생략/null)
export interface FestivalDay {
  date: string;       // 'YYYY-MM-DD'
  lineup: string[];   // 그 날 라인업 아티스트명
}

export interface Game {
  id: string;
  name: string;
  release_date: string;             // 'YYYY-MM-DD' — 공연일/발매일(다일 공연·페스티벌은 첫날)
  release_time: string | null;      // 'HH:mm' 현지 공연 시작 시각 — 모르면 null
  release_date_approx: boolean;
  timezone: string;                 // IANA 타임존, 예: 'Asia/Seoul' — 이 항목의 모든 시각 필드(release_time·presale·general_sale) 기준
  category: Category;
  platforms: string[];              // 공연장/지역 등
  developer: string | null;         // 아티스트 / 기획사
  publisher: string | null;         // 주최/유통사
  description: string | null;
  genres: string[];                 // 장르/태그
  image_url: string | null;
  source_url: string | null;

  // 선예매(팬클럽 선예매 등) — 일반예매와 별개 이벤트라 필드를 분리한다.
  presale?: boolean;                        // 선예매 진행/예정이면 true (선택 필드)
  presale_datetime?: string | null;         // ISO 8601(오프셋 포함), 예: '2026-08-05T11:00:00+09:00' — 선예매 시작
  presale_end_datetime?: string | null;     // 선예매 마감(대개 없음 — 매진 시까지인 경우가 많음)
  presale_url?: string | null;              // 공식 선예매 페이지 URL

  // 일반예매
  general_sale?: boolean;                   // 일반예매 진행/예정이면 true (선택 필드)
  general_sale_datetime?: string | null;    // ISO 8601(오프셋 포함) — 일반예매 시작
  general_sale_end_datetime?: string | null; // 일반예매 마감(대개 없음)
  general_sale_url?: string | null;         // 공식 일반예매 페이지 URL

  // 페스티벌 데이별 라인업 (festival 카테고리만)
  festival_days?: FestivalDay[] | null;

  // 같은 물리적 공연이 다른 로케일 파일에도 등재된 경우의 교차 연결(선택 — 크로스 등재 시에만).
  // 예: 서울 콘서트가 concerts.ko.json에도, 국제 팬 수요로 concerts.en.json에도 등재된 경우
  // 서로의 id를 이 필드로 연결하면 sitemap이 그 페어에만 hreflang alternate를 붙인다.
  related_locale_ids?: Partial<Record<LocaleCode, string>> | null;
}

// 선예매·일반예매 중 하나라도 진행/예정이면 true — 배너·사이드바 등에서 "티켓팅 있음" 판단에 사용.
export function hasActiveTicketing(g: Pick<Game, 'presale' | 'general_sale'>): boolean {
  return g.presale === true || g.general_sale === true;
}

// 선예매/일반예매 각각의 마감(end_datetime)이 지났는지 — 마감 정보가 없으면(매진 시까지
// 판매) 절대 "마감"으로 취급하지 않는다. 예매 CTA 버튼을 마감 후엔 링크 대신 마감 문구로
// 바꿀 때 씀(presale/general_sale 따로 판단 — isTicketingLiveNow는 둘을 합쳐서만 본다).
export function hasSaleWindowEnded(endIso: string | null | undefined, now: Date): boolean {
  if (!endIso) return false;
  const end = new Date(endIso).getTime();
  return !Number.isNaN(end) && now.getTime() >= end;
}

// 지금 이 순간이 실제로 예매 판매 구간(선예매 또는 일반예매) 안인지 — hasActiveTicketing과 달리
// 날짜/시각까지 따진다(리서처가 채운 presale/general_sale 불리언은 "예정 있음"일 뿐 지금
// 열려있다는 보장이 아님). 검색 결과 등에서 "예매중" 배지를 띄울 때 씀.
export function isTicketingLiveNow(
  g: Pick<Game, 'presale_datetime' | 'presale_end_datetime' | 'general_sale_datetime' | 'general_sale_end_datetime'>,
  now: Date,
): boolean {
  const t = now.getTime();
  const inWindow = (startIso?: string | null, endIso?: string | null): boolean => {
    if (!startIso) return false;
    const start = new Date(startIso).getTime();
    if (Number.isNaN(start) || t < start) return false;
    if (!endIso) return true; // 마감 없음 = 매진 시까지 판매 중으로 간주
    const end = new Date(endIso).getTime();
    return Number.isNaN(end) || t < end;
  };
  return inWindow(g.presale_datetime, g.presale_end_datetime) || inWindow(g.general_sale_datetime, g.general_sale_end_datetime);
}

export interface GamesData {
  schema_version: number;
  last_updated: string;             // ISO 8601
  last_researched_by: string;
  categories: Record<Category, string>;
  games: Game[];
}

// 필터 단일 키 — 카테고리 4종(과거엔 게임쇼/할인/시즌 이벤트 타입도 포함했으나,
// 콘서트 도메인엔 대응 개념이 없어 제거됨 — wiki/decisions.md 참고)
export type FilterKey = Category;

export interface FilterState {
  category: FilterKey | null;
  platform: string | null;
  days: number;
  search: string;
  wishlistOnly: boolean;
}

// 카테고리별 표기/색/아이콘(SVG 스프라이트 id) 단일 출처
export const CATEGORY_META: Record<Category, {
  label: string;
  short: string;
  icon: string;
  color: string;
}> = {
  concert_tour:  { label: '콘서트·내한 공연', short: '콘서트',  icon: 'ic-star',    color: '#4a5fe0' },
  music_release: { label: '음원 발매(컴백)',   short: '음원발매', icon: 'ic-flame',   color: '#0e9d94' },
  festival:      { label: '페스티벌',         short: '페스티벌', icon: 'ic-globe',   color: '#1f9d52' },
  fanmeeting:    { label: '팬미팅',           short: '팬미팅',  icon: 'ic-comment', color: '#df3d78' },
};
