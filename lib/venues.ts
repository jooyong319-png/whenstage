// server-only: getAllGames가 fs를 쓰므로 서버 컴포넌트에서만 import
import { getAllGames, type GameLocale } from './games';
import type { Game } from './types';

export interface VenueSummary {
  slug: string;         // 표시명 그대로(다른 언어 세그먼트가 URL 인코딩 처리) — NFC 정규화됨
  name: string;         // 대표 표시명(그 공연장을 가리키는 표기 중 가장 긴 것 — 괄호 부연설명 포함 우선)
  events: Game[];       // 이 공연장에서 열리는 전체 항목(과거+미래), release_date 오름차순
  upcomingCount: number;
}

// 공연장 페이지는 "이 장소의 여러 공연을 모아 보여주는 것"이 유일한 가치다(고유 설명문이 없음).
// 공연이 하나뿐이면 그 공연 상세 페이지와 내용이 사실상 같아 검색엔진엔 중복·저품질 페이지로 남는다
// (실제로 색인 요청만 쌓이고 색인은 안 되던 URL 다수가 이 케이스). 페이지 자체는 살려두되
// (사용자 유입/내부 링크엔 여전히 쓸모 있음) noindex + 사이트맵 제외로 크롤 예산을 아낀다.
export function isVenueIndexable(v: VenueSummary): boolean {
  return v.events.length >= 2;
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

/**
 * 공연장 페이지의 메타 설명.
 *
 * 원래는 `"블루스퀘어 · 13개 일정"` 한 줄이었다 — **23자**. 검색 결과에 뜨는 스니펫인데
 * 그 공연장에 대해 아무것도 말하지 않아서, 검색엔진이 알아서 본문을 잘라 쓰거나 그냥
 * 잘린 채로 나갔다. 본문은 3,600자로 두툼한데 팔리지 않던 셈이다(2026-09-01 발견).
 *
 * 데이터에 이미 있는 것만 쓴다 — 공연 수, 가장 가까운 일정, 아티스트 이름. 지어내지 않는다.
 */
export function venueDescription(v: VenueSummary, lang: 'ko' | 'en' | 'ja'): string {
  const total = v.events.length;
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = v.events.filter(e => e.release_date >= today);
  const next = upcoming[0];

  // 아티스트 이름이 있으면 그게 가장 검색에 가까운 말이다
  const who = next?.developer?.trim() || next?.name?.trim() || '';
  // "09월 11일"이 아니라 "9월 11일" — 앞의 0을 떼야 사람이 읽는 표기가 된다
  const md = (iso: string) => {
    const [, m, d] = iso.split('-').map(Number);
    return { m, d };
  };

  if (lang === 'ko') {
    const head = `${v.name}에서 열리는 공연 ${total}개를 모았습니다.`;
    if (next && who) {
      const { m, d } = md(next.release_date);
      return `${head} 가장 가까운 일정은 ${m}월 ${d}일 ${who}이며, 날짜·시작 시각·티켓 오픈까지 한눈에 확인할 수 있습니다.`;
    }
    return `${head} 날짜·시작 시각·티켓 오픈 일정을 한눈에 확인하세요.`;
  }

  if (lang === 'ja') {
    const head = `${v.name}で開催される公演${total}件をまとめました。`;
    if (next && who) {
      const { m, d } = md(next.release_date);
      return `${head} 直近の予定は${m}月${d}日の${who}で、日程・開演時刻・チケット販売開始まで一目で確認できます。`;
    }
    return `${head} 日程・開演時刻・チケット販売開始をまとめて確認できます。`;
  }

  const head = `${total} event${total === 1 ? '' : 's'} at ${v.name}.`;
  if (next && who) {
    const enWhen = new Date(next.release_date + 'T00:00:00Z')
      .toLocaleDateString('en-US', { month: 'long', day: 'numeric', timeZone: 'UTC' });
    return `${head} Next up is ${who} on ${enWhen} — see dates, start times and ticket on-sale info in one place.`;
  }
  return `${head} See dates, start times and ticket on-sale info in one place.`;
}
