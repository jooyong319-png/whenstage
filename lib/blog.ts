// server-only: 이 파일은 fs를 쓰므로 서버 컴포넌트에서만 import
import path from 'path';
import { promises as fs } from 'fs';
import { getAllGames } from './games';
import type { Locale } from './i18nLabels';

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;             // 'YYYY-MM-DD'
  updated: string;          // 'YYYY-MM-DD' — frontmatter `updated:`(글을 고친 날). 없으면 date와 같다
  tags: string[];
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

// 단순 frontmatter 파서 (gray-matter 없이) — news.ts와 동일 규칙
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
    // 배열: [a, b, c]
    if (val.startsWith('[') && val.endsWith(']')) {
      val = val.slice(1, -1).split(',').map(s => unquote(s.trim())).filter(Boolean);
    } else {
      val = unquote(val);
    }
    meta[key] = val;
  }
  return { meta, body };
}

// 본문에 등장하는 모든 내부 콘서트 링크(/ko|en|ja/concert/<id>)의 id를 등장 순서대로 추출
export function allGameIds(content: string): string[] {
  return [...content.matchAll(/\]\(\/(?:ko|en|ja)\/concert\/([^)\s#?]+)\)/g)].map(m => m[1]);
}

// 로케일별로 완전히 독립된 모아보기 글 세트 — content/blog/<slug>.<lang>.md.
// (콘서트/뉴스와 동일한 원칙: 번역이 아니라 그 언어권 담당이 직접 소재를 골라 쓰는 별도 콘텐츠)
async function readPosts(lang: Locale): Promise<BlogPost[]> {
  const dir = path.join(process.cwd(), 'content', 'blog');
  const suffix = `.${lang}.md`;
  try {
    const files = await fs.readdir(dir);
    const posts: BlogPost[] = [];
    for (const file of files) {
      if (!file.endsWith(suffix)) continue;
      if (file.startsWith('_') || file.startsWith('.')) continue; // 템플릿/숨김 파일 제외
      // 슬러그는 항상 NFC로 정규화 — 한글 파일명이 파일시스템/URL 간 NFD로 어긋나 매칭 실패하는 것 방지
      const slug = file.slice(0, -suffix.length).normalize('NFC');
      // CRLF 정규화 — Windows 체크아웃 시 frontmatter 파서(^---\n)가 깨지는 것 방지
      const raw = (await fs.readFile(path.join(dir, file), 'utf-8')).replace(/\r\n/g, '\n');
      const { meta, body } = parseFrontmatter(raw);
      posts.push({
        slug,
        title: String(meta.title ?? slug),
        description: String(meta.description ?? ''),
        date: String(meta.date ?? '1970-01-01'),
        updated: /^\d{4}-\d{2}-\d{2}$/.test(String(meta.updated ?? '')) ? String(meta.updated) : String(meta.date ?? '1970-01-01'),
        tags: Array.isArray(meta.tags) ? meta.tags : [],
        content: body,
        heroGameId: null,
        heroImage: null,
      });
    }

    // 본문에 링크된 콘서트 중 대표 이미지가 있는 첫 항목을 히어로로 사용(순서상 첫 링크가
    // 이미지 없는 항목일 수 있어, 등장 순서대로 훑어 이미지 있는 첫 링크를 고른다).
    try {
      const games = await getAllGames(lang);
      const imgById = new Map(games.map(g => [g.id, g.image_url]));
      for (const p of posts) {
        const ids = allGameIds(p.content);
        const withImage = ids.find(id => imgById.get(id));
        const gid = withImage ?? ids[0] ?? null;
        p.heroGameId = gid;
        p.heroImage = gid ? (imgById.get(gid) ?? null) : null;
      }
    } catch {
      // 게임 데이터 로드 실패 시 이미지 없이 진행 (글은 정상 노출)
    }

    // 날짜 내림차순 (최신 먼저)
    return posts.sort((a, b) => b.date.localeCompare(a.date));
  } catch {
    // 폴더 없거나 파일 없으면 빈 배열
    return [];
  }
}

const cache = new Map<Locale, Promise<BlogPost[]>>();
export function getAllPosts(lang: Locale): Promise<BlogPost[]> {
  if (!cache.has(lang)) cache.set(lang, readPosts(lang));
  return cache.get(lang)!;
}

function safeDecode(s: string): string {
  try { return decodeURIComponent(s); } catch { return s; }
}

export async function getPostBySlug(slug: string, lang: Locale): Promise<BlogPost | null> {
  const all = await getAllPosts(lang);
  const candidates = new Set([slug, safeDecode(slug)].map(s => s.normalize('NFC')));
  return all.find(p => candidates.has(p.slug)) ?? null;
}

// 관련 글 추천: 태그 겹침 수 desc → 최신 desc. 자기 자신 제외. 같은 로케일 안에서만.
export async function getRelatedPosts(slug: string, lang: Locale, limit = 3): Promise<BlogPost[]> {
  const all = await getAllPosts(lang);
  const current = all.find(p => p.slug === slug);
  if (!current) return [];
  const tagSet = new Set(current.tags);
  const scored = all
    .filter(p => p.slug !== slug)
    .map(p => ({ p, overlap: p.tags.filter(t => tagSet.has(t)).length }))
    .sort((a, b) => b.overlap - a.overlap || b.p.date.localeCompare(a.p.date));
  return scored.slice(0, limit).map(s => s.p);
}

// 간단한 마크다운 → HTML 변환 (외부 라이브러리 없이)
// 기본 문법만 지원: 제목(#), 굵게(**), 이탤릭(*), 링크([](url)), 리스트(-), 단락
export function markdownToHtml(md: string): string {
  // 🔴 원고(AI 에이전트가 매일 씀)의 글자를 **먼저** 이스케이프한다 — 예전엔 원문 HTML이 그대로 통과했고
  //    링크 주소도 이스케이프 없이 href에 들어갔다(Codex 점검 2026-11-04). 원고에 HTML 태그는 쓰지 않는다.
  let html = escape(md);

  // 코드 블록 (3중 백틱) — 위에서 이미 이스케이프됨
  html = html.replace(/```([\s\S]*?)```/g, (_, code) => `<pre><code>${code.trim()}</code></pre>`);

  // 헤더
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // 굵게 + 이탤릭
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // 링크
  // 링크 — javascript:·data: 같은 스킴은 막는다(http(s)·상대 경로만). 따옴표는 위 이스케이프로 이미 &quot;
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (all, text: string, href: string) => {
    const h = href.trim();
    const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(h.replace(/&#?\w+;/g, ''));
    if (scheme && !/^(https?|mailto)$/i.test(scheme[1])) return text;
    return `<a href="${h}">${text}</a>`;
  });

  // 리스트 (- 로 시작)
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>[\s\S]+?<\/li>)(?!\s*<li>)/g, '<ul>$1</ul>');

  // 단락 (2번 줄바꿈)
  html = html
    .split(/\n\n+/)
    .map(block => {
      const trimmed = block.trim();
      if (!trimmed) return '';
      if (trimmed.startsWith('<')) return trimmed; // 이미 태그면 그대로
      return `<p>${trimmed.replace(/\n/g, '<br/>')}</p>`;
    })
    .join('\n');

  return html;
}

function escape(s: string): string {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

/**
 * 표시용 날짜 — **로케일을 반드시 받는다.**
 *
 * 🔴 2026-09-21까지 이 함수는 로케일 인자가 없어 `2026년 9월 10일`을 하드코딩으로
 * 돌려줬다. 그런데 호출부가 블로그·뉴스의 ko/en/ja 전부(10곳)였기 때문에,
 * **영어·일본어 페이지에 한국어 날짜가 그대로 찍히고 있었다.** 라이브 실측으로 확인:
 * `/en/news`·`/ja/news`·`/en/blog` 모두 "2026년 9월 10일".
 *
 * 이 저장소가 반복해서 밟아온 "하드코딩 한국어가 EN/JA로 새는" 버그(카테고리 배지·토스트·
 * 조회수 등, PROJECT_STATUS 참고)와 같은 종류다. 다른 곳은 다 잡혔는데 여기만 남아 있었다.
 *
 * 타임존을 Asia/Seoul로 고정하는 이유: `date`는 시각 없는 `YYYY-MM-DD`라 UTC 자정으로
 * 읽히는데, 뷰어가 UTC보다 뒤인 지역이면 **하루 전 날짜**가 표시된다.
 */
export function formatPostDate(iso: string, locale: Locale = 'ko'): string {
  const intlLocale = locale === 'en' ? 'en-US' : locale === 'ja' ? 'ja-JP' : 'ko-KR';
  return new Intl.DateTimeFormat(intlLocale, {
    year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Seoul',
  }).format(new Date(iso));
}
