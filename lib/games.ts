// server-only: 이 파일은 fs를 쓰므로 서버 컴포넌트에서만 import 가능
import path from 'path';
import { promises as fs } from 'fs';
import { type Game, type GamesData, type Category } from './types';
import { kstDateOnly } from './utils';

// ko/en/ja는 서로 번역이 아니라 완전히 독립된 콘텐츠(국가/지역별 실제 공연) —
// data/concerts.ko.json / concerts.en.json / concerts.ja.json 각각 자체 완결형.
export type GameLocale = 'ko' | 'en' | 'ja';

/**
 * 배열이어야 하는 필드가 null로 들어와도 빌드가 죽지 않게 정규화한다.
 *
 * types.ts는 `platforms: string[]`로 선언돼 있지만 JSON은 타입 검사를 거치지 않는다.
 * 리서처가 값을 못 찾아 `null`을 써 넣으면 `platforms.length`에서 프리렌더가 통째로 터진다
 * (2026-08-02에 실제로 4건 때문에 배포가 막혔다).
 *
 * 화면 쪽에서 `?.`을 흩뿌리는 대신 **데이터가 들어오는 유일한 문에서 한 번** 막는다 —
 * 새 화면을 만들 때마다 옵셔널 체이닝을 기억할 필요가 없어진다.
 */
function normalizeGame(g: Game): Game {
  return {
    ...g,
    platforms: Array.isArray(g.platforms) ? g.platforms : [],
    genres: Array.isArray(g.genres) ? g.genres : [],
  };
}

async function readGamesFile(locale: GameLocale): Promise<GamesData> {
  const filePath = path.join(process.cwd(), 'data', `concerts.${locale}.json`);
  const raw = await fs.readFile(filePath, 'utf-8');
  const data = JSON.parse(raw) as GamesData;
  return { ...data, games: (data.games ?? []).map(normalizeGame) };
}

const cache = new Map<GameLocale, Promise<GamesData>>();
function getGamesData(locale: GameLocale): Promise<GamesData> {
  if (!cache.has(locale)) cache.set(locale, readGamesFile(locale));
  return cache.get(locale)!;
}

// 전체 게임 (출시일 오름차순)
export async function getAllGames(locale: GameLocale = 'ko'): Promise<Game[]> {
  const data = await getGamesData(locale);
  return data.games.slice().sort(
    (a, b) => new Date(a.release_date).getTime() - new Date(b.release_date).getTime()
  );
}

// ID로 한 게임 조회
export async function getGameById(id: string, locale: GameLocale = 'ko'): Promise<Game | null> {
  const all = await getAllGames(locale);
  return all.find(g => g.id === id) ?? null;
}

// 카테고리별
export async function getGamesByCategory(category: Category, locale: GameLocale = 'ko'): Promise<Game[]> {
  const all = await getAllGames(locale);
  return all.filter(g => g.category === category);
}

// 오늘(KST) 기준 날짜 문자열 'YYYY-MM-DD'
function todayKstStr(): string {
  const t = kstDateOnly(new Date().toISOString());
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
}

// 이미 지난 출시 제외 (오늘 이후 + 출시일 미정만) — '출시 예정' 표면용.
// 정적 생성이라 빌드 시각 기준(데이터 일일 갱신 시 재배포로 신선도 유지).
export async function getUpcomingGames(locale: GameLocale = 'ko'): Promise<Game[]> {
  const today = todayKstStr();
  return (await getAllGames(locale)).filter(g => g.release_date_approx || g.release_date >= today);
}

export async function getUpcomingGamesByCategory(category: Category, locale: GameLocale = 'ko'): Promise<Game[]> {
  const today = todayKstStr();
  return (await getGamesByCategory(category, locale)).filter(g => g.release_date_approx || g.release_date >= today);
}

// 데이터 갱신 시각
export async function getLastUpdated(locale: GameLocale = 'ko'): Promise<string> {
  const data = await getGamesData(locale);
  return data.last_updated;
}

// 순수 헬퍼는 lib/utils.ts로 분리됨. 기존 import 호환용 re-export.
export { calcDayDiff, formatKoreanDate, formatShortDate, getKoreanWeekday } from './utils';
