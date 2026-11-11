// server-only: fs를 쓰므로 서버 컴포넌트에서만 import
import path from 'path';
import { promises as fs } from 'fs';
import { getAllGames } from './games';
import type { Locale } from './i18nLabels';

// 마크다운/날짜 유틸은 blog에서 재사용 (동일 포맷)
export { markdownToHtml, formatPostDate } from './blog';

export interface NewsItem {
  slug: string;
  title: string;
  description: string;
  date: string;             // 'YYYY-MM-DD'
  tags: string[];
  source: string;           // 출처 매체명 (예: 인터파크 뉴스)
  sourceUrl: string;        // 원문 링크 (저작권 안전판 — 필수)
  content: string;          // markdown 본문 (frontmatter 제외)
  heroGameId: string | null;   // 본문 첫 콘서트 링크의 id
  heroImage: string | null;    // 위 콘서트의 대표 이미지 (없으면 null)
}

// 값 전체가 같은 따옴표 한 쌍으로 감싸졌을 때만 바깥 한 쌍을 벗긴다.
// 한쪽에만 있는 따옴표(곡·앨범명 인용: `... 'Observing Chaos'`)는 본문이므로 건드리지 않는다.
// 안쪽에 같은 따옴표가 또 있으면(`'A' and 'B'`) 감싼 게 아니라 인용 두 개이므로 그대로 둔다.
function unquote(s: string): string {
  if (s.length < 2) return s;
  const q = s[0];
  if ((q !== '"' && q !== "'") || s[s.length - 1] !== q) return s;
  const inner = s.slice(1, -1);
  return inner.includes(q) ? s : inner;
}

// 단순 frontmatter 파서 (gray-matter 없이) — blog.ts와 동일 규칙
function parseFrontmatter(raw: string): { meta: Record<string, string | string[]>; body: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: raw };
  const fmRaw = match[1];
  const body = match[2];
  const meta: Record<string, string | string[]> = {};
  for (const line of fmRaw.split('\n')) {
    const m = line.match(/^(\w+):\s*(.+)$/);
    if (!m) continue;
    const key = m[1];
    let val: string | string[] = m[2].trim();
    if (val.startsWith('[') && val.endsWith(']')) {
      val = val.slice(1, -1).split(',').map(s => unquote(s.trim())).filter(Boolean);
    } else {
      val = unquote(val);
    }
    meta[key] = val;
  }
  return { meta, body };
}

// 본문에서 첫 번째 내부 콘서트 링크(/{ko,en,ja}/concert/<id>)의 id를 추출
function firstConcertId(content: string): string | null {
  const m = content.match(/\]\(\/(?:ko|en|ja)\/concert\/([^)\s#?]+)\)/);
  return m ? m[1] : null;
}

// 로케일별로 완전히 독립된 뉴스 세트 — content/news/<slug>.<lang>.md.
// (콘서트 데이터와 동일한 원칙: 번역이 아니라 그 언어권 리서처가 직접 작성하는 별도 콘텐츠)
async function readNews(lang: Locale): Promise<NewsItem[]> {
  const dir = path.join(process.cwd(), 'content', 'news');
  const suffix = `.${lang}.md`;
  try {
    const files = await fs.readdir(dir);
    const items: NewsItem[] = [];
    for (const file of files) {
      if (!file.endsWith(suffix)) continue;
      if (file.startsWith('_') || file.startsWith('.')) continue; // 템플릿/숨김 파일 제외
      // 슬러그는 항상 NFC로 정규화 — 한글 파일명이 파일시스템/URL 간 NFD로 어긋나 매칭 실패하는 것 방지
      const slug = file.slice(0, -suffix.length).normalize('NFC');
      // CRLF 정규화 — Windows 체크아웃 시 frontmatter 파서(^---\n)가 깨지는 것 방지
      const raw = (await fs.readFile(path.join(dir, file), 'utf-8')).replace(/\r\n/g, '\n');
      const { meta, body } = parseFrontmatter(raw);
      items.push({
        slug,
        title: String(meta.title ?? slug),
        description: String(meta.description ?? ''),
        date: String(meta.date ?? '1970-01-01'),
        tags: Array.isArray(meta.tags) ? meta.tags : [],
        source: String(meta.source ?? ''),
        sourceUrl: String(meta.source_url ?? ''),
        content: body,
        heroGameId: null,
        heroImage: null,
      });
    }

    // 본문 첫 콘서트 링크 → 대표 이미지 자동 매핑 (같은 로케일의 콘서트 데이터와 조인)
    try {
      const games = await getAllGames(lang);
      const imgById = new Map(games.map(g => [g.id, g.image_url]));
      for (const it of items) {
        const gid = firstConcertId(it.content);
        it.heroGameId = gid;
        it.heroImage = gid ? (imgById.get(gid) ?? null) : null;
      }
    } catch {
      // 콘서트 데이터 로드 실패 시 이미지 없이 진행 (뉴스는 정상 노출)
    }

    // 날짜 내림차순 (최신 먼저)
    return items.sort((a, b) => b.date.localeCompare(a.date));
  } catch {
    // 폴더 없거나 파일 없으면 빈 배열
    return [];
  }
}

const cache = new Map<Locale, Promise<NewsItem[]>>();
export function getAllNews(lang: Locale): Promise<NewsItem[]> {
  if (!cache.has(lang)) cache.set(lang, readNews(lang));
  return cache.get(lang)!;
}

function safeDecode(s: string): string {
  try { return decodeURIComponent(s); } catch { return s; }
}

export async function getNewsBySlug(slug: string, lang: Locale): Promise<NewsItem | null> {
  const all = await getAllNews(lang);
  // Next는 한글(비ASCII) 동적 세그먼트를 퍼센트 인코딩된 채로 넘길 수 있음 → 디코딩 후 NFC 비교.
  // 인코딩/디코딩·정규화 어느 조합이 와도 매칭되도록 후보 셋으로 비교.
  const candidates = new Set([slug, safeDecode(slug)].map(s => s.normalize('NFC')));
  return all.find(n => candidates.has(n.slug)) ?? null;
}

// 관련 뉴스: 태그 겹침 desc → 최신 desc. 자기 자신 제외. 같은 로케일 안에서만.
export async function getRelatedNews(slug: string, lang: Locale, limit = 4): Promise<NewsItem[]> {
  const all = await getAllNews(lang);
  const current = all.find(n => n.slug === slug);
  if (!current) return [];
  const tagSet = new Set(current.tags);
  const scored = all
    .filter(n => n.slug !== slug)
    .map(n => ({ n, overlap: n.tags.filter(t => tagSet.has(t)).length }))
    .sort((a, b) => b.overlap - a.overlap || b.n.date.localeCompare(a.n.date));
  return scored.slice(0, limit).map(s => s.n);
}
