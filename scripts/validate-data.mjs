// 데이터 유효성 검사 — 빌드 전에 돌린다.
//
// TypeScript는 JSON을 검사해주지 않는다. `types.ts`가 `platforms: string[]`라고 선언해도
// 리서처가 `null`을 써 넣으면 타입 검사도 통과하고, 프리렌더 도중에야 터진다.
// 2026-08-02에 실제로 4건 때문에 배포가 막혔다 — 그때는 어느 레코드가 문제인지도
// 스택 트레이스만 보고 찾아야 했다.
//
// 여기서 걸리면 어느 파일 어느 레코드의 어느 필드인지 바로 나온다.
import { readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';

/** 반드시 배열이어야 하는 필드 — null이면 화면에서 .length / [0]이 터진다 */
const MUST_BE_ARRAY = ['platforms', 'genres'];
/** 반드시 있어야 하는 필드 */
const REQUIRED = ['id', 'name', 'release_date', 'category'];

const files = ['data/concerts.ko.json', 'data/concerts.en.json', 'data/concerts.ja.json'];
const problems = [];

// 사이트의 '오늘'은 KST다. UTC로 재면 한국 자정~오전 9시에 고친 파일이 '미래 날짜'로 걸린다.
const today = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);

/**
 * `last_updated`가 실제 갱신 상태와 맞는지 본다.
 *
 * 왜 필요한가 (2026-08-18) — EN 파일이 08-18에도 갱신됐는데 `last_updated`는 08-05에
 * 멈춰 있었다. 이 값은 장식이 아니라 **사이트맵 lastmod**(`app/sitemap.ts`)와 화면의
 * "마지막 갱신" 표기에 그대로 들어간다. 그래서 en 페이지 358장이 실제보다 13일 오래된
 * 것처럼 검색엔진에 신고되고 있었다. 검색엔진이 lastmod를 믿으면 재크롤을 미룬다.
 *
 * 세 리서처 프롬프트 모두 "last_updated 갱신"이라고 똑같이 적혀 있었다. **지시만으로는
 * 안 지켜진다** — 빌드를 막아야 지켜진다.
 *
 * 두 가지를 본다:
 *  1. 그 파일에 커밋 안 된 변경이 있다 → 방금 고쳤다는 뜻이니 last_updated가 오늘이어야 한다
 *     (리서처는 파일을 고친 뒤 커밋 전에 검증을 돌린다)
 *  2. 작업 트리가 깨끗하다 → 마지막 커밋 날짜와 last_updated가 같아야 한다
 *
 * git을 못 쓰는 환경(얕은 클론 등)에서는 조용히 건너뛴다. 검사 하나 때문에 배포가
 * 막히는 것이 데이터가 틀린 것보다 나쁠 수 있다.
 */
function git(args) {
  try {
    return execFileSync('git', args, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return null;
  }
}

function checkLastUpdated(file, lastUpdated) {
  if (!lastUpdated) {
    problems.push(`${file}: last_updated가 없다`);
    return;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(lastUpdated)) {
    problems.push(`${file}: last_updated 형식이 YYYY-MM-DD가 아니다 (${lastUpdated})`);
    return;
  }

  const dirty = git(['status', '--porcelain', '--', file]);
  if (dirty === null) return;              // git 없음 — 건너뛴다

  if (dirty) {
    if (lastUpdated !== today) {
      problems.push(
        `${file}: 파일을 고쳤는데 last_updated가 ${lastUpdated}다 (오늘은 ${today}).`
        + ' 이 값은 사이트맵 lastmod와 화면의 "마지막 갱신"에 그대로 들어간다');
    }
    return;
  }

  const committed = git(['log', '-1', '--format=%cs', '--', file]);
  if (!committed) return;                  // 얕은 클론 등 — 건너뛴다
  if (lastUpdated !== committed) {
    problems.push(
      `${file}: last_updated(${lastUpdated})가 마지막 커밋일(${committed})과 다르다.`
      + ' 데이터를 고치면서 이 필드를 안 올린 것으로 보인다');
  }
}


// ── 설명 복사 검사 (2026-10-13) ───────────────────────────────────────────────
// 같은 가수의 다른 공연과 설명이 절반 이상 같으면 "투어를 도시별로 나누며 복사한" 페이지다 —
// claude-seo 점검에서 ja 23%·en 10%가 이랬고, 8월 구글 강등 사유(대규모 자동 생성)와 같은 패턴.
// lib/descDup.ts와 **같은 계산**이다(이 파일은 .mjs라 그걸 못 쓴다 — 기준을 바꾸면 두 곳 다).
//   - 오늘 고친 항목(updated_at = 오늘)이 끼어 있으면 **오류** — 새로 만들거나 고치면서 복사하지 말 것
//   - 예전부터 있던 묶음은 **경고 + 정리 목록** — 오류로 막으면 리서처 작업 전체가 멈춘다
const DUP_THRESHOLD = 0.5;
const artistKey = (n) => n.replace(/[（(][^）)]*[）)]/g, '').trim().normalize('NFC');
function descGrams(text, lang) {
  const out = new Set();
  if (lang === 'ja') {
    const t = text.replace(/\s+/g, '');
    for (let i = 0; i + 8 <= t.length; i++) out.add(t.slice(i, i + 8));
    return out;
  }
  const w = text.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
  for (let i = 0; i + 4 <= w.length; i++) out.add(w.slice(i, i + 4).join(' '));
  return out;
}
function jaccard(a, b) {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter);
}
const dupWarnings = [];
function checkCopiedDescriptions(file, games) {
  const lang = file.match(/concerts\.(\w+)\.json/)?.[1] ?? 'ko';
  const by = new Map();
  for (const g of games) {
    if (!g?.developer || !g?.description) continue;
    const k = artistKey(g.developer);
    (by.get(k) ?? by.set(k, []).get(k)).push(g);
  }
  for (const [artist, gs] of by) {
    if (gs.length < 2) continue;
    const grams = gs.map(g => descGrams(g.description, lang));
    const pairs = [];
    for (let i = 0; i < gs.length; i++) for (let j = i + 1; j < gs.length; j++) {
      const sim = jaccard(grams[i], grams[j]);
      if (sim >= DUP_THRESHOLD) pairs.push([gs[i], gs[j], sim]);
    }
    if (!pairs.length) continue;
    const fresh = pairs.filter(([a, b]) => a.updated_at === today || b.updated_at === today);
    for (const [a, b, sim] of fresh) {
      problems.push(`${file} / ${a.updated_at === today ? a.id : b.id}: 설명이 ${a.updated_at === today ? b.id : a.id}와 ${Math.round(sim * 100)}% 같다 — `
        + '도시·날짜별로 나눈 공연은 그 공연만의 정보(공연장·날짜·예매 일정·좌석 등)로 설명을 따로 써야 한다. '
        + '같은 공연장 연속 공연이면 한 건으로 합친다(AGENTS.md "설명 복사 금지")');
    }
    if (fresh.length < pairs.length) {
      const ids = [...new Set(pairs.flatMap(([a, b]) => [a.id, b.id]))];
      dupWarnings.push(`${file} / ${artist}: ${ids.length}건 — ${ids.join(', ')}`);
    }
  }
}

for (const file of files) {
  let data;
  try {
    data = JSON.parse(await readFile(file, 'utf-8'));
  } catch (e) {
    problems.push(`${file}: JSON 파싱 실패 — ${e.message}`);
    continue;
  }

  const games = data.games;
  if (!Array.isArray(games)) {
    problems.push(`${file}: games가 배열이 아니다`);
    continue;
  }

  checkLastUpdated(file, data.last_updated);

  const seen = new Set();
  const contentSeen = new Map();
  for (const g of games) {
    const id = g?.id ?? '(id 없음)';
    for (const key of REQUIRED) {
      if (g?.[key] == null || g[key] === '') {
        problems.push(`${file} / ${id}: 필수 필드 '${key}'가 비어 있다`);
      }
    }
    for (const key of MUST_BE_ARRAY) {
      if (key in g && !Array.isArray(g[key])) {
        problems.push(
          `${file} / ${id}: '${key}'는 배열이어야 하는데 ${g[key] === null ? 'null' : typeof g[key]}이다`
          + ` — 값을 못 찾았으면 []를 쓸 것`);
      }
    }
    if (seen.has(g?.id)) problems.push(`${file} / ${id}: id 중복`);
    seen.add(g?.id);

    // 🔴 내용 기준 중복 (2026-09-22). id가 달라도 **같은 날·같은 공연장·같은 아티스트·같은
    // 종류**면 같은 공연이다. 리서처가 slug를 한 번은 도시명(`-new-york-`), 한 번은 공연장명
    // (`-bowery-ballroom-`)으로 만들어 같은 공연이 두 번 올라간 일이 실제로 9건 있었다
    // (en 8·ko 1). id 검사만으로는 절대 못 잡는다.
    // 같은 날 두 번 공연(낮·밤)은 시각이 둘 다 있고 서로 다르면 허용한다.
    {
      const norm = (x) => String(x ?? '').replace(/[（(][^）)]*[）)]/g, '').replace(/[\s·,.\-]+/g, '').toLowerCase();
      const k = [g?.release_date, g?.category, norm(g?.platforms?.[0]), norm(g?.developer || g?.name)].join('|');
      const prev = contentSeen.get(k);
      const bothTimed = prev?.release_time && g?.release_time && prev.release_time !== g.release_time;
      if (prev && !bothTimed) {
        problems.push(`${file} / ${id}: 같은 공연이 이미 있다 — ${prev.id} (날짜·공연장·아티스트·종류가 같다). `
          + `새로 만들지 말고 기존 항목을 고칠 것`);
      } else if (!prev) {
        contentSeen.set(k, g);
      }
    }

    // updated_at은 선택 필드지만, 있으면 형식이 맞아야 한다 — 사이트맵 lastmod로 나가기 때문에
    // 잘못된 값이 Invalid Date가 되어 조용히 깨진 날짜를 내보낸다.
    if (g?.updated_at != null) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(g.updated_at)) {
        problems.push(`${file} / ${id}: updated_at 형식이 YYYY-MM-DD가 아니다 (${g.updated_at})`);
      } else if (g.updated_at > today) {
        problems.push(`${file} / ${id}: updated_at이 미래 날짜다 (${g.updated_at})`);
      }
    }
    if (g?.release_date && !/^\d{4}-\d{2}-\d{2}$/.test(g.release_date)) {
      problems.push(`${file} / ${id}: release_date 형식이 YYYY-MM-DD가 아니다 (${g.release_date})`);
    }
  }
  checkCopiedDescriptions(file, games);
  console.log(`${file}: ${games.length}건 검사`);
}

// 예전부터 있던 설명 복사 묶음 — 실패로 치지 않고 정리 목록만 보여준다(리서처가 매 실행 일부씩 다시 쓴다)
if (dupWarnings.length) {
  console.log(`\n⚠️ 설명 복사 묶음 ${dupWarnings.length}개 — 정리 대상(묶음마다 대표 1건만 색인 중, lib/descDup.ts):`);
  for (const w of dupWarnings.slice(0, 40)) console.log('  - ' + w);
  if (dupWarnings.length > 40) console.log(`  … 외 ${dupWarnings.length - 40}개`);
}

if (problems.length) {
  console.error(`\n데이터 문제 ${problems.length}건:\n`);
  for (const p of problems) console.error('  - ' + p);
  process.exit(1);
}
console.log('\n데이터 이상 없음');
