// 설명 복사 공연 묶음 — 대표 1건만 색인 (2026-10-13)
//
// claude-seo `seo-programmatic` 점검에서 나왔다: 투어를 도시·날짜별로 나눠 등록하면서 설명을 복사해
// 같은 가수의 공연끼리 설명이 절반 이상 같은 페이지가 ja 23%(79건)·en 10%(38건)였다(ko 0%).
// 도쿄 스카파라 투어 3장은 서로 93% 같았다. 8월 구글 강등 사유("대규모 자동 생성 콘텐츠")와 같은 패턴이다.
//
// 처리: 겹치는 공연끼리 묶어(같은 가수 + 설명 n-gram 자카드 ≥ 0.5) **대표 1건만 색인**, 나머지는
// noindex + 사이트맵 제외. 페이지는 남긴다(링크·북마크가 깨지지 않게). 리서처가 설명을 도시별 실제
// 정보로 다시 쓰면 겹침이 풀려 **다음 빌드에서 저절로 색인으로 돌아온다** — 따로 해제할 필요가 없다.
//
// ⚠️ scripts/validate-data.mjs에 같은 계산이 한 벌 더 있다(검사기는 .mjs라 이 파일을 못 쓴다).
//    기준(DUP_THRESHOLD·n-gram)을 바꾸면 두 곳을 같이 바꾼다.
import type { Game } from './types';
import { normalizeArtistKey } from './types';

export const DUP_THRESHOLD = 0.5;

/** ja: 글자 8-gram, ko·en: 단어 4-gram(유니코드 문자·숫자 단위) */
export function descGrams(text: string, lang: string): Set<string> {
  if (lang === 'ja') {
    const t = text.replace(/\s+/g, '');
    const out = new Set<string>();
    for (let i = 0; i + 8 <= t.length; i++) out.add(t.slice(i, i + 8));
    return out;
  }
  const w = (text.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []);
  const out = new Set<string>();
  for (let i = 0; i + 4 <= w.length; i++) out.add(w.slice(i, i + 4).join(' '));
  return out;
}

export function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter);
}

export interface DupCluster { keep: string; members: string[]; artist: string }

function todayKst(): string {
  return new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
}

/** 설명이 겹치는 공연 묶음(2건 이상)과 대표 */
export function findDupClusters(games: Game[], lang: string): DupCluster[] {
  const today = todayKst();
  const byArtist = new Map<string, Game[]>();
  for (const g of games) {
    if (!g.developer || !g.description) continue;
    const k = normalizeArtistKey(g.developer);
    (byArtist.get(k) ?? byArtist.set(k, []).get(k)!).push(g);
  }
  const clusters: DupCluster[] = [];
  for (const [artist, gs] of byArtist) {
    if (gs.length < 2) continue;
    const grams = gs.map(g => descGrams(g.description ?? '', lang));
    // 겹치는 쌍을 이어 붙인다(유니온 파인드) — A~B, B~C면 A·B·C가 한 묶음
    const parent = gs.map((_, i) => i);
    const find = (i: number): number => (parent[i] === i ? i : (parent[i] = find(parent[i])));
    for (let i = 0; i < gs.length; i++) {
      for (let j = i + 1; j < gs.length; j++) {
        if (jaccard(grams[i], grams[j]) >= DUP_THRESHOLD) parent[find(i)] = find(j);
      }
    }
    const groups = new Map<number, Game[]>();
    gs.forEach((g, i) => { const r = find(i); (groups.get(r) ?? groups.set(r, []).get(r)!).push(g); });
    for (const members of groups.values()) {
      if (members.length < 2) continue;
      // 대표: 다가오는 공연 → 설명이 긴 것 → 날짜가 이른 것 → id
      const keep = [...members].sort((a, b) => {
        const ua = a.release_date_approx || a.release_date >= today ? 0 : 1;
        const ub = b.release_date_approx || b.release_date >= today ? 0 : 1;
        if (ua !== ub) return ua - ub;
        const ld = (b.description?.length ?? 0) - (a.description?.length ?? 0);
        if (ld) return ld;
        return a.release_date.localeCompare(b.release_date) || a.id.localeCompare(b.id);
      })[0];
      clusters.push({ keep: keep.id, members: members.map(g => g.id), artist });
    }
  }
  return clusters;
}

/** 색인에서 뺄 공연 id(묶음에서 대표가 아닌 것) */
export function dupNoindexIds(games: Game[], lang: string): Set<string> {
  const out = new Set<string>();
  for (const c of findDupClusters(games, lang)) for (const id of c.members) if (id !== c.keep) out.add(id);
  return out;
}
