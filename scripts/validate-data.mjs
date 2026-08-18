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

const today = new Date().toISOString().slice(0, 10);

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

    if (g?.release_date && !/^\d{4}-\d{2}-\d{2}$/.test(g.release_date)) {
      problems.push(`${file} / ${id}: release_date 형식이 YYYY-MM-DD가 아니다 (${g.release_date})`);
    }
  }
  console.log(`${file}: ${games.length}건 검사`);
}

if (problems.length) {
  console.error(`\n데이터 문제 ${problems.length}건:\n`);
  for (const p of problems) console.error('  - ' + p);
  process.exit(1);
}
console.log('\n데이터 이상 없음');
