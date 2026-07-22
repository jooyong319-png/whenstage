// server-only: getAllGames가 fs를 쓰므로 서버 컴포넌트에서만 import
import path from 'path';
import { promises as fs } from 'fs';
import { getAllGames, type GameLocale } from './games';
import type { Game } from './types';

// 아티스트 전용 큐레이션 이미지(공연/발매 리서치와 분리 관리) — data/artist-images.json.
// 콘서트 엔트리의 image_url을 재활용하면 행사 스냅샷이 섞여 품질이 들쭉날쭉해지므로,
// 대표 이미지는 이 파일을 우선 쓰고 없을 때만 콘서트 이미지로 폴백한다.
let curatedImagesCache: Promise<Record<string, string>> | null = null;
function getCuratedImages(): Promise<Record<string, string>> {
  if (!curatedImagesCache) {
    curatedImagesCache = fs
      .readFile(path.join(process.cwd(), 'data', 'artist-images.json'), 'utf-8')
      .then(raw => (JSON.parse(raw).images ?? {}) as Record<string, string>)
      .catch(() => ({}));
  }
  return curatedImagesCache;
}

export interface ArtistSummary {
  slug: string;         // 표시명 그대로(다른 언어 세그먼트가 URL 인코딩 처리) — NFC 정규화됨
  name: string;         // 대표 표시명(그룹 내 가장 긴 표기 — 로마자 병기가 있으면 그쪽 우선)
  events: Game[];       // 이 아티스트의 전체 항목(과거+미래), release_date 오름차순
  upcomingCount: number;
  image: string | null; // 대표 이미지(가장 최근 항목 중 image_url 있는 것)
}

// "에스파(aespa)" / "에스파" 처럼 표기가 갈려도 같은 아티스트로 묶기 위해 괄호(반각/전각) 안 로마자
// 병기를 떼고 비교한다. 완벽한 정규화는 아니지만(오탈자까지는 못 잡음) 실전에서 가장 흔한
// "같은 이름, 로마자 유무만 다름" 케이스를 커버한다.
export function normalizeArtistKey(name: string): string {
  return name.replace(/[（(][^）)]*[）)]/g, '').trim().normalize('NFC');
}

function todayKstStr(now: Date = new Date()): string {
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 10);
}

// 로케일 내 전체 게임을 developer 기준으로 묶어 아티스트 목록을 만든다.
export async function getAllArtists(locale: GameLocale = 'ko'): Promise<ArtistSummary[]> {
  const games = await getAllGames(locale);
  const today = todayKstStr();
  const curated = await getCuratedImages();

  const groups = new Map<string, Game[]>();
  for (const g of games) {
    if (!g.developer) continue;
    const key = normalizeArtistKey(g.developer);
    if (!key) continue;
    (groups.get(key) ?? groups.set(key, []).get(key)!).push(g);
  }

  const artists: ArtistSummary[] = [];
  for (const [key, events] of groups) {
    // 그룹 내 가장 긴 표기(보통 로마자 병기 포함) 를 대표 표시명으로.
    const name = events.reduce((longest, g) => (g.developer!.length > longest.length ? g.developer! : longest), events[0].developer!);
    const sorted = events.slice().sort((a, b) => a.release_date.localeCompare(b.release_date));
    const upcomingCount = sorted.filter(g => g.release_date_approx || g.release_date >= today).length;
    // 콘서트 엔트리의 image_url로 폴백하지 않는다 — 행사 스냅샷이 섞여 품질이 들쭉날쭉해지는
    // 원인이었음(레드카펫 단체샷 등). 큐레이션 파일에 없으면 깔끔한 플레이스홀더로 노출.
    artists.push({
      slug: key,
      name,
      events: sorted,
      upcomingCount,
      image: curated[key] ?? null,
    });
  }

  // 다가오는 일정 있는 아티스트 우선, 그다음 가나다/알파벳
  return artists.sort((a, b) => {
    if (a.upcomingCount !== b.upcomingCount) return b.upcomingCount - a.upcomingCount;
    return a.name.localeCompare(b.name, locale === 'ko' ? 'ko' : locale === 'ja' ? 'ja' : 'en');
  });
}

function safeDecode(s: string): string {
  try { return decodeURIComponent(s); } catch { return s; }
}

export async function getArtistBySlug(slug: string, locale: GameLocale = 'ko'): Promise<ArtistSummary | null> {
  const all = await getAllArtists(locale);
  const candidates = new Set([slug, safeDecode(slug)].map(s => s.normalize('NFC')));
  return all.find(a => candidates.has(a.slug)) ?? null;
}
