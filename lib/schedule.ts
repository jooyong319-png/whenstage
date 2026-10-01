// server-only: getAllGames가 fs를 쓰므로 서버 컴포넌트에서만 import
//
// 날짜로 찾는 검색("10월 콘서트", "이번주 티켓팅")을 받는 페이지의 데이터.
// 공연·아티스트·공연장 페이지는 전부 **이름을 아는 사람**의 검색에만 걸린다 — 이름 없이
// 날짜로 찾는 사람을 받을 페이지가 없었다(2026-10-01).
//
// 목록만 있는 얇은 페이지가 되지 않도록 ① 공연이 충분한 달만 만들고 ② 목록 위에 그 달의
// 요약(분류별·나라별 건수, 몰린 날, 공연장)을 붙이고 ③ 예매가 몇 건 안 되는 티켓팅 페이지는
// 색인에서 뺀다. 처음엔 한국어만 만들었다가 같은 날 3개 언어로 넓혔다(wiki/decisions 2026-10-01).
import { getAllGames, type GameLocale } from './games';
import type { Category, Game } from './types';
import { normalizeVenueKey, VENUE_CATEGORIES } from './venues';
import { countryFromTimezone } from './seo';

/** 이 건수 미만인 달은 페이지를 만들지 않는다 — 목록 몇 줄짜리 얇은 페이지가 된다 */
export const MONTH_MIN_EVENTS = 10;
/** 앞으로 열릴 예매가 이보다 적으면 티켓팅 페이지를 색인에서 뺀다(페이지는 유지) */
export const TICKETING_MIN_INDEX = 5;

const WEEKDAYS: Record<GameLocale, string[]> = {
  ko: ['일', '월', '화', '수', '목', '금', '토'],
  ja: ['日', '月', '火', '水', '木', '金', '土'],
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
};
const EN_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** 오늘(KST) 'YYYY-MM-DD' */
export function todayKst(now: Date = new Date()): string {
  return new Date(now.getTime() + 9 * 3600e3).toISOString().slice(0, 10);
}

/** 'YYYY-MM-DD' → 요일 (시간대 무관 — UTC로 고정) */
function weekdayOf(date: string): number {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/** '10월 3일 (토)' / '10月3日(土)' / 'Sat, Oct 3' */
export function dayLabel(date: string, lang: GameLocale): string {
  const m = Number(date.slice(5, 7));
  const d = Number(date.slice(8, 10));
  const w = WEEKDAYS[lang][weekdayOf(date)];
  if (lang === 'en') return `${w}, ${EN_MONTHS[m - 1]} ${d}`;
  if (lang === 'ja') return `${m}月${d}日(${w})`;
  return `${m}월 ${d}일 (${w})`;
}

/** 주 범위 — '10월 1일 (목) ~ 4일 (일)' / '10月1日(木)〜4日(日)' / 'Thu, Oct 1 – Sun, Oct 4' */
function rangeLabel(start: string, end: string, lang: GameLocale): string {
  if (start === end) return dayLabel(start, lang);
  const d = Number(end.slice(8, 10));
  const w = WEEKDAYS[lang][weekdayOf(end)];
  if (lang === 'en') return `${dayLabel(start, lang)} – ${dayLabel(end, lang)}`;
  if (lang === 'ja') return `${dayLabel(start, lang)}〜${d}日(${w})`;
  return `${dayLabel(start, lang)} ~ ${d}일 (${w})`;
}

/** '2026년 10월' / '2026年10月' / 'October 2026' */
export function monthLabel(year: number, month: number, lang: GameLocale): string {
  if (lang === 'en') return new Date(Date.UTC(year, month - 1, 1)).toLocaleString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  if (lang === 'ja') return `${year}年${month}月`;
  return `${year}년 ${month}월`;
}

export interface MonthWeek {
  label: string;
  items: Game[];
}

export interface MonthPage {
  lang: GameLocale;
  ym: string;                       // '2026-10'
  year: number;
  month: number;
  events: Game[];                   // 날짜 확정된 것만, 날짜순
  byCategory: Partial<Record<Category, number>>;
  byCountry: { code: string; count: number }[];      // 나라별(영어판 요약용) — 많은 순
  busiestDays: { date: string; count: number }[];   // 상위 3일 (2건 이상인 날만)
  topVenues: { name: string; slug: string; count: number }[]; // 상위 3곳 (2건 이상)
  ticketOpenings: number;           // 이 달에 열리는 선예매·일반예매 수
  weeks: MonthWeek[];
  lastModified?: string;            // 이 달 항목 중 가장 최근 updated_at
}

/** 월~일 기준 주 단위로 나눈다(달 경계에서 자른다) — "이번 주말"을 찾는 읽기 방식에 맞춘다 */
function splitWeeks(events: Game[], lang: GameLocale): MonthWeek[] {
  const weeks = new Map<string, Game[]>();
  for (const g of events) {
    const d = Number(g.release_date.slice(8, 10));
    const back = (weekdayOf(g.release_date) + 6) % 7;      // 그 주 월요일까지 며칠
    const key = String(Math.max(1, d - back)).padStart(2, '0');
    weeks.set(key, [...(weeks.get(key) ?? []), g]);
  }
  return Array.from(weeks.entries()).map(([startDay, items]) => {
    const ym = items[0].release_date.slice(0, 7);
    const [y, m] = ym.split('-').map(Number);
    const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate();
    const startDate = `${ym}-${startDay}`;
    const endNum = Math.min(lastDay, Number(startDay) + (6 - (weekdayOf(startDate) + 6) % 7));
    const endDate = `${ym}-${String(endNum).padStart(2, '0')}`;
    return { label: rangeLabel(startDate, endDate, lang), items };
  });
}

function buildMonth(lang: GameLocale, ym: string, events: Game[], all: Game[]): MonthPage {
  const [year, month] = ym.split('-').map(Number);

  const byCategory: Partial<Record<Category, number>> = {};
  for (const g of events) byCategory[g.category] = (byCategory[g.category] ?? 0) + 1;

  const countries = new Map<string, number>();
  for (const g of events) {
    const c = g.timezone ? countryFromTimezone(g.timezone) : null;
    if (c) countries.set(c, (countries.get(c) ?? 0) + 1);
  }
  const byCountry = Array.from(countries.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([code, count]) => ({ code, count }));

  const dayCount = new Map<string, number>();
  for (const g of events) dayCount.set(g.release_date, (dayCount.get(g.release_date) ?? 0) + 1);
  const busiestDays = Array.from(dayCount.entries())
    .filter(([, c]) => c >= 2)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 3)
    .map(([date, count]) => ({ date, count }));

  const venues = new Map<string, { name: string; count: number }>();
  for (const g of events) {
    if (!VENUE_CATEGORIES.has(g.category)) continue;
    const p = g.platforms?.[0];
    if (!p) continue;
    const key = normalizeVenueKey(p);
    const v = venues.get(key) ?? { name: p, count: 0 };
    v.count++;
    if (p.length > v.name.length) v.name = p;
    venues.set(key, v);
  }
  const topVenues = Array.from(venues.entries())
    .filter(([, v]) => v.count >= 2)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 3)
    .map(([slug, v]) => ({ name: v.name, slug, count: v.count }));

  let ticketOpenings = 0;
  for (const g of all) {
    if (g.presale_datetime?.startsWith(ym)) ticketOpenings++;
    if (g.general_sale_datetime?.startsWith(ym)) ticketOpenings++;
  }

  const updated = events.map(g => g.updated_at).filter((d): d is string => !!d).sort();

  return {
    lang, ym, year, month, events, byCategory, byCountry, busiestDays, topVenues, ticketOpenings,
    weeks: splitWeeks(events, lang),
    ...(updated.length ? { lastModified: updated[updated.length - 1] } : {}),
  };
}

/** 페이지를 만들 달 전부(과거 포함) — 한 번 생긴 URL이 404가 되지 않도록 지난 달도 남긴다 */
export async function getMonthPages(locale: GameLocale = 'ko'): Promise<MonthPage[]> {
  const all = await getAllGames(locale);
  const byMonth = new Map<string, Game[]>();
  for (const g of all) {
    if (g.release_date_approx) continue;          // 날짜 미정은 그 달 목록에 넣지 않는다
    const ym = g.release_date.slice(0, 7);
    byMonth.set(ym, [...(byMonth.get(ym) ?? []), g]);
  }
  return Array.from(byMonth.entries())
    .filter(([, evs]) => evs.length >= MONTH_MIN_EVENTS)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([ym, evs]) => buildMonth(locale, ym, evs, all));
}

/** 지난 달은 noindex(페이지는 남긴다) — 검색자가 찾는 건 이번 달·다가오는 달이다 */
export function isMonthIndexable(m: MonthPage, today: string = todayKst()): boolean {
  return m.ym >= today.slice(0, 7);
}

export type TicketKind = 'presale' | 'general_sale';

export interface TicketOpening {
  game: Game;
  kind: TicketKind;
  at: string;        // ISO (오프셋 포함)
  date: string;      // 공연 현지 'YYYY-MM-DD'
  time: string;      // 공연 현지 'HH:mm'
  tz: string;        // 공연 타임존 — 시각은 이 기준(해외 팬이 자기 시간으로 착각하지 않게)
  url: string | null;
}

/** ISO 순간 → 그 타임존의 날짜·시각 */
function localParts(iso: string, timeZone: string): { date: string; time: string } {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date(iso));
  const get = (t: string) => parts.find(p => p.type === t)?.value ?? '';
  return { date: `${get('year')}-${get('month')}-${get('day')}`, time: `${get('hour')}:${get('minute')}` };
}

/** 'GMT+9' / 'EDT' 같은 짧은 시간대 표기 */
export function tzShort(iso: string, timeZone: string, lang: GameLocale): string {
  const p = new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : lang === 'ja' ? 'ja-JP' : 'ko-KR', { timeZone, timeZoneName: 'short' })
    .formatToParts(new Date(iso)).find(x => x.type === 'timeZoneName');
  return p?.value ?? '';
}

/** 오늘(KST) 이후 열리는 선예매·일반예매, 시각순 */
export async function getUpcomingTicketOpenings(locale: GameLocale = 'ko', now: Date = new Date()): Promise<TicketOpening[]> {
  const all = await getAllGames(locale);
  // '오늘 0시(KST)'의 순간 — 오늘 이미 지난 오픈도 남긴다(빌드 후 하루 동안 보는 페이지라서)
  const cutoff = new Date(`${todayKst(now)}T00:00:00+09:00`).getTime();
  const out: TicketOpening[] = [];
  for (const g of all) {
    const tz = g.timezone || 'Asia/Seoul';
    const pairs: [TicketKind, string | null | undefined, string | null | undefined][] = [
      ['presale', g.presale_datetime, g.presale_url],
      ['general_sale', g.general_sale_datetime, g.general_sale_url],
    ];
    for (const [kind, at, url] of pairs) {
      if (!at) continue;
      const t = new Date(at).getTime();
      if (Number.isNaN(t) || t < cutoff) continue;
      const { date, time } = localParts(at, tz);
      out.push({ game: g, kind, at, date, time, tz, url: url ?? null });
    }
  }
  return out.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
}

export function isTicketingIndexable(count: number): boolean {
  return count >= TICKETING_MIN_INDEX;
}
