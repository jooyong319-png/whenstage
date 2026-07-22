// server-only: getAllGames가 fs를 쓰므로 서버 컴포넌트에서만 import
import { getAllGames, type GameLocale } from './games';
import type { Game } from './types';

export interface VenueSummary {
  slug: string;         // 표시명 그대로(다른 언어 세그먼트가 URL 인코딩 처리) — NFC 정규화됨
  name: string;         // 대표 표시명(그 공연장을 가리키는 표기 중 가장 긴 것 — 괄호 부연설명 포함 우선)
  events: Game[];       // 이 공연장에서 열리는 전체 항목(과거+미래), release_date 오름차순
  upcomingCount: number;
}

// "KSPO DOME(올림픽체조경기장)" / "KSPO DOME(올림픽공원 체조경기장)" 처럼 부연설명 표기가 갈려도
// 같은 공연장으로 묶기 위해 괄호(반각/전각) 안 내용을 떼고 비교한다. lib/artists.ts의
// normalizeArtistKey()와 동일한 규칙 — 공연장에도 같은 표기 흔들림이 있어서 같이 쓴다.
export function normalizeVenueKey(name: string): string {
  return name.replace(/[（(][^）)]*[）)]/g, '').trim().normalize('NFC');
}

// 발매(음원) 항목의 platforms는 "Streaming"/"CD"/"음원 사이트 및 음반" 같은 유통 형태 문자열이라
// 실제 물리적 공연장이 아니다 — 공연장 페이지는 실제 장소가 있는 카테고리에서만 뽑는다.
// concert/[id]/page.tsx의 Event JSON-LD location 판정에도 동일 기준을 쓴다(export해서 공유).
export const VENUE_CATEGORIES = new Set(['concert_tour', 'festival', 'fanmeeting']);

function todayKstStr(now: Date = new Date()): string {
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 10);
}

// 로케일 내 전체 게임을 platforms(공연장) 기준으로 묶어 공연장 목록을 만든다.
export async function getAllVenues(locale: GameLocale = 'ko'): Promise<VenueSummary[]> {
  const games = await getAllGames(locale);
  const today = todayKstStr();

  const groups = new Map<string, Game[]>();
  const rawNames = new Map<string, string>();
  for (const g of games) {
    if (!VENUE_CATEGORIES.has(g.category)) continue;
    for (const p of g.platforms ?? []) {
      if (!p) continue;
      const key = normalizeVenueKey(p);
      if (!key) continue;
      (groups.get(key) ?? groups.set(key, []).get(key)!).push(g);
      // 그 공연장을 가리키는 표기 중 가장 긴 것(대개 괄호 부연설명 포함)을 대표 표시명으로.
      const prevName = rawNames.get(key);
      if (!prevName || p.length > prevName.length) rawNames.set(key, p);
    }
  }

  const venues: VenueSummary[] = [];
  for (const [key, eventsRaw] of groups) {
    // 한 공연이 같은 공연장을 여러 platforms 표기로 중복 등재했을 리는 없지만, 방어적으로 id 중복 제거.
    const seen = new Set<string>();
    const events = eventsRaw.filter(g => (seen.has(g.id) ? false : (seen.add(g.id), true)));
    const sorted = events.slice().sort((a, b) => a.release_date.localeCompare(b.release_date));
    const upcomingCount = sorted.filter(g => g.release_date_approx || g.release_date >= today).length;
    venues.push({
      slug: key,
      name: rawNames.get(key) ?? key,
      events: sorted,
      upcomingCount,
    });
  }

  // 다가오는 일정 있는 공연장 우선, 그다음 가나다/알파벳
  return venues.sort((a, b) => {
    if (a.upcomingCount !== b.upcomingCount) return b.upcomingCount - a.upcomingCount;
    return a.name.localeCompare(b.name, locale === 'ko' ? 'ko' : locale === 'ja' ? 'ja' : 'en');
  });
}

function safeDecode(s: string): string {
  try { return decodeURIComponent(s); } catch { return s; }
}

export async function getVenueBySlug(slug: string, locale: GameLocale = 'ko'): Promise<VenueSummary | null> {
  const all = await getAllVenues(locale);
  const candidates = new Set([slug, safeDecode(slug)].map(s => s.normalize('NFC')));
  return all.find(v => candidates.has(v.slug)) ?? null;
}
