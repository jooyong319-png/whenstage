// server-only: getAllGames가 fs를 쓰므로 서버 컴포넌트에서만 import
//
// 날짜로 찾는 검색("10월 콘서트", "이번주 티켓팅")을 받는 페이지의 데이터.
// 공연·아티스트·공연장 페이지는 전부 **이름을 아는 사람**의 검색에만 걸린다 — 이름 없이
// 날짜로 찾는 사람을 받을 페이지가 없었다(2026-10-01).
//
// ⚠️ 구글 스팸 강등(2026-08, 대규모 자동 생성 콘텐츠) 이후라 **목록만 있는 페이지를 늘리지
// 않는다.** 그래서 ① 한국어만 ② 공연이 충분한 달만 ③ 목록 위에 그 달의 요약(분류별 건수·
// 가장 붐비는 날·공연장)을 붙인다. 확장은 네이버 반응을 보고 결정(wiki/decisions 2026-10-01).
import { getAllGames, type GameLocale } from './games';
import type { Category, Game } from './types';
import { normalizeVenueKey, VENUE_CATEGORIES } from './venues';

/** 이 건수 미만인 달은 페이지를 만들지 않는다 — 목록 몇 줄짜리 얇은 페이지가 된다 */
export const MONTH_MIN_EVENTS = 10;

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

/** 오늘(KST) 'YYYY-MM-DD' */
export function todayKst(now: Date = new Date()): string {
  return new Date(now.getTime() + 9 * 3600e3).toISOString().slice(0, 10);
}

/** 'YYYY-MM-DD' → 요일 (시간대 무관 — UTC로 고정) */
function weekdayOf(date: string): number {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/** '10월 3일 (토)' */
export function koDayLabel(date: string): string {
  return `${Number(date.slice(5, 7))}월 ${Number(date.slice(8, 10))}일 (${WEEKDAYS[weekdayOf(date)]})`;
}

export interface MonthWeek {
  label: string;   // '10월 1일 (목) ~ 4일 (일)'
  items: Game[];
}

export interface MonthPage {
  ym: string;                       // '2026-10'
  year: number;
  month: number;
  events: Game[];                   // 날짜 확정된 것만, 날짜순
  byCategory: Partial<Record<Category, number>>;
  busiestDays: { date: string; count: number }[];   // 상위 3일 (2건 이상인 날만)
  topVenues: { name: string; slug: string; count: number }[]; // 상위 3곳 (2건 이상)
  ticketOpenings: number;           // 이 달에 열리는 선예매·일반예매 수
  weeks: MonthWeek[];
  lastModified?: string;            // 이 달 항목 중 가장 최근 updated_at
}

/** 월~일 기준 주 단위로 나눈다(달 경계에서 자른다) — "이번 주말"을 찾는 읽기 방식에 맞춘다 */
function splitWeeks(events: Game[]): MonthWeek[] {
  const weeks = new Map<string, Game[]>();
  for (const g of events) {
    const d = Number(g.release_date.slice(8, 10));
    const back = (weekdayOf(g.release_date) + 6) % 7;      // 그 주 월요일까지 며칠
    const start = Math.max(1, d - back);
    const key = String(start).padStart(2, '0');
    weeks.set(key, [...(weeks.get(key) ?? []), g]);
  }
  return Array.from(weeks.entries()).map(([startDay, items]) => {
    const ym = items[0].release_date.slice(0, 7);
    const [y, m] = ym.split('-').map(Number);
    const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate();
    const startDate = `${ym}-${startDay}`;
    const endNum = Math.min(lastDay, Number(startDay) + (6 - (weekdayOf(startDate) + 6) % 7));
    const endDate = `${ym}-${String(endNum).padStart(2, '0')}`;
    const label = startDate === endDate
      ? koDayLabel(startDate)
      : `${koDayLabel(startDate)} ~ ${endNum}일 (${WEEKDAYS[weekdayOf(endDate)]})`;
    return { label, items };
  });
}

function buildMonth(ym: string, events: Game[], all: Game[]): MonthPage {
  const [year, month] = ym.split('-').map(Number);

  const byCategory: Partial<Record<Category, number>> = {};
  for (const g of events) byCategory[g.category] = (byCategory[g.category] ?? 0) + 1;

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
    ym, year, month, events, byCategory, busiestDays, topVenues, ticketOpenings,
    weeks: splitWeeks(events),
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
    .map(([ym, evs]) => buildMonth(ym, evs, all));
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
  date: string;      // KST 'YYYY-MM-DD'
  time: string;      // KST 'HH:mm'
  url: string | null;
}

function kstParts(iso: string): { date: string; time: string } {
  const s = new Date(new Date(iso).getTime() + 9 * 3600e3).toISOString();
  return { date: s.slice(0, 10), time: s.slice(11, 16) };
}

/** 오늘(KST) 이후 열리는 선예매·일반예매, 시각순 */
export async function getUpcomingTicketOpenings(locale: GameLocale = 'ko', now: Date = new Date()): Promise<TicketOpening[]> {
  const all = await getAllGames(locale);
  const today = todayKst(now);
  const out: TicketOpening[] = [];
  for (const g of all) {
    const pairs: [TicketKind, string | null | undefined, string | null | undefined][] = [
      ['presale', g.presale_datetime, g.presale_url],
      ['general_sale', g.general_sale_datetime, g.general_sale_url],
    ];
    for (const [kind, at, url] of pairs) {
      if (!at || Number.isNaN(new Date(at).getTime())) continue;
      const { date, time } = kstParts(at);
      if (date < today) continue;
      out.push({ game: g, kind, at, date, time, url: url ?? null });
    }
  }
  return out.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
}
