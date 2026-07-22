// server-only: 이 파일은 fs를 쓰므로 서버 컴포넌트에서만 import
import path from 'path';
import { promises as fs } from 'fs';
import { getAllGames } from './games';

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;             // 'YYYY-MM-DD'
  tags: string[];
  content: string;          // markdown 본문 (frontmatter 제외)
  heroGameId: string | null;   // 본문 첫 /game/<id> 링크의 게임 id
  heroImage: string | null;    // 위 게임의 대표 이미지 (없으면 null)
}

// 다국어 번역 — content/blog/<slug>.en.md · <slug>.ja.md (원본과 별도 파일, 없으면 미번역)
export type ContentLang = 'en' | 'ja';

export interface ContentTranslation {
  title: string;
  description: string;
  content: string; // markdown 본문
}

// 단순 frontmatter 파서 (gray-matter 없이)
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
      val = val.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
    } else {
      val = val.replace(/^["']|["']$/g, '');
    }
    meta[key] = val;
  }
  return { meta, body };
}

// 본문에 등장하는 모든 내부 콘서트 링크(/ko|en|ja/concert/<id>)의 id를 등장 순서대로 추출
export function allGameIds(content: string): string[] {
  return [...content.matchAll(/\]\(\/(?:ko|en|ja)\/concert\/([^)\s#?]+)\)/g)].map(m => m[1]);
}

// 본문에서 첫 번째 내부 콘서트 링크의 id를 추출(하위 호환용)
export function firstGameId(content: string): string | null {
  return allGameIds(content)[0] ?? null;
}

async function readAllPosts(): Promise<BlogPost[]> {
  const dir = path.join(process.cwd(), 'content', 'blog');
  try {
    const files = await fs.readdir(dir);
    const posts: BlogPost[] = [];
    for (const file of files) {
      if (!file.endsWith('.md')) continue;
      if (/\.(en|ja)\.md$/.test(file)) continue; // 언어 변형 파일은 목록에서 제외(별도 조회)
      const slug = file.replace(/\.md$/, '');
      const raw = await fs.readFile(path.join(dir, file), 'utf-8');
      const { meta, body } = parseFrontmatter(raw);
      posts.push({
        slug,
        title: String(meta.title ?? slug),
        description: String(meta.description ?? ''),
        date: String(meta.date ?? '1970-01-01'),
        tags: Array.isArray(meta.tags) ? meta.tags : [],
        content: body,
        heroGameId: null,
        heroImage: null,
      });
    }

    // 본문에 링크된 콘서트 중 대표 이미지가 있는 첫 항목을 히어로로 사용(순서상 첫 링크가
    // 이미지 없는 항목일 수 있어, 등장 순서대로 훑어 이미지 있는 첫 링크를 고른다).
    try {
      const games = await getAllGames();
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
  } catch (e) {
    // 폴더 없거나 파일 없으면 빈 배열
    return [];
  }
}

let cached: Promise<BlogPost[]> | null = null;
export function getAllPosts(): Promise<BlogPost[]> {
  if (!cached) cached = readAllPosts();
  return cached;
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const all = await getAllPosts();
  return all.find(p => p.slug === slug) ?? null;
}

// 번역본 조회 — content/blog/<slug>.<lang>.md. 없으면 null(그 언어 페이지 미생성).
export async function getPostTranslation(slug: string, lang: ContentLang): Promise<ContentTranslation | null> {
  const file = path.join(process.cwd(), 'content', 'blog', `${slug}.${lang}.md`);
  try {
    const raw = await fs.readFile(file, 'utf-8');
    const { meta, body } = parseFrontmatter(raw);
    return {
      title: String(meta.title ?? slug),
      description: String(meta.description ?? ''),
      content: body,
    };
  } catch {
    return null;
  }
}

// 특정 언어로 번역된 글들의 slug 목록(generateStaticParams용) — 원본 있는 것만.
export async function getTranslatedSlugs(lang: ContentLang): Promise<string[]> {
  const dir = path.join(process.cwd(), 'content', 'blog');
  try {
    const files = await fs.readdir(dir);
    const suffix = `.${lang}.md`;
    const all = await getAllPosts();
    const known = new Set(all.map(p => p.slug));
    return files
      .filter(f => f.endsWith(suffix))
      .map(f => f.slice(0, -suffix.length))
      .filter(slug => known.has(slug));
  } catch {
    return [];
  }
}

// 관련 글 추천: 태그 겹침 수 desc → 최신 desc. 자기 자신 제외.
export async function getRelatedPosts(slug: string, limit = 3): Promise<BlogPost[]> {
  const all = await getAllPosts();
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
  let html = md;

  // 코드 블록 (3중 백틱)
  html = html.replace(/```([\s\S]*?)```/g, (_, code) => `<pre><code>${escape(code.trim())}</code></pre>`);

  // 헤더
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // 굵게 + 이탤릭
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // 링크
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

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

// 표시용 날짜
export function formatPostDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}
