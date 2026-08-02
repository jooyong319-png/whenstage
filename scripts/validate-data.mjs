// 데이터 유효성 검사 — 빌드 전에 돌린다.
//
// TypeScript는 JSON을 검사해주지 않는다. `types.ts`가 `platforms: string[]`라고 선언해도
// 리서처가 `null`을 써 넣으면 타입 검사도 통과하고, 프리렌더 도중에야 터진다.
// 2026-08-02에 실제로 4건 때문에 배포가 막혔다 — 그때는 어느 레코드가 문제인지도
// 스택 트레이스만 보고 찾아야 했다.
//
// 여기서 걸리면 어느 파일 어느 레코드의 어느 필드인지 바로 나온다.
import { readFile } from 'node:fs/promises';

/** 반드시 배열이어야 하는 필드 — null이면 화면에서 .length / [0]이 터진다 */
const MUST_BE_ARRAY = ['platforms', 'genres'];
/** 반드시 있어야 하는 필드 */
const REQUIRED = ['id', 'name', 'release_date', 'category'];

const files = ['data/concerts.ko.json', 'data/concerts.en.json', 'data/concerts.ja.json'];
const problems = [];

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
