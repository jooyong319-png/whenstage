// 모아보기(블로그) 글 검사 — 리서처가 글을 쓴 뒤 반드시 돌린다.
//
// 왜 있는가 — 글 품질을 사람 눈에만 맡기면 기준이 매번 흔들린다. 특히 회차마다 자동으로
// 쓰는 글은 "일단 짧게 하나 올리고 넘어가기"가 되기 쉬운데, 그렇게 쌓인 얇은 글은 도움이
// 안 되는 정도가 아니라 사이트 전체 평가를 끌어내린다.
//
// ## 언어마다 기준이 다르다
//
// 세 로케일의 글 길이를 재보니 같은 잣대를 쓸 수 없었다(2026-08-24 측정).
//
//   ko  글자 1,163~4,231 (중앙 3,043)   단어 260~988
//   en  글자 2,157~7,986 (중앙 5,943)   단어 369~1,349
//   ja  글자 1,260~4,524 (중앙 2,695)   단어  40~164  ← 띄어쓰기가 없어 단어수가 무의미
//
// 그래서 **ko·ja는 글자수, en은 단어수**로 잰다. 영어에 글자수를 쓰면 같은 분량이 2배로
// 계산되고, 일본어에 단어수를 쓰면 40단어짜리 긴 글이 미달로 잡힌다.
//
// ## 기존 글은 경고만 한다
//
// 기준을 만든 시점에 이미 50편이 있었고 그중 10편이 미달이었다. 전부 실패시키면 배포가
// 막히는데, 그 글들은 실제 공연 데이터를 확인해 가며 보강해야 해서 검사기가 시킬 일이
// 아니다. 기준 도입일 이후 글만 실패시키고, 이전 글은 목록으로 보여 준다.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const DIR = join(process.cwd(), 'content', 'blog');

/** 이 날짜 이후에 쓴 글부터 기준을 강제한다 */
const ENFORCED_FROM = '2026-08-24';

/** ko·ja는 글자수, en은 단어수 */
const MIN = { ko: 1500, ja: 1500, en: 450 };
const UNIT = { ko: '자', ja: '자', en: '단어' };

const MIN_KEYWORD = 7;
/** 밀도 상한 — 이걸 넘으면 억지로 채운 것이다 */
const MAX_DENSITY = 0.03;

function plainText(body) {
  return body
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^\|.*\|$/gm, m => m.replace(/\|/g, ' '))
    .replace(/[#*>`]/g, '')
    .replace(/^-{2,}$/gm, '')
    .trim();
}

function frontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) return null;
  const meta = {};
  for (const line of m[1].split(/\r?\n/)) {
    const i = line.indexOf(':');
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { meta, body: m[2] };
}

const problems = [];
const legacy = [];

if (!existsSync(DIR)) {
  console.log('content/blog 없음 — 검사할 글이 없다');
  process.exit(0);
}

for (const file of readdirSync(DIR).filter(f => /\.(ko|en|ja)\.md$/.test(f))) {
  const locale = file.match(/\.(ko|en|ja)\.md$/)[1];
  const parsed = frontmatter(readFileSync(join(DIR, file), 'utf-8'));
  if (!parsed) { problems.push(`${file}: frontmatter를 못 읽었다`); continue; }
  const { meta, body } = parsed;

  const text = plainText(body);
  const size = locale === 'en' ? text.split(/\s+/).filter(Boolean).length : text.length;
  const min = MIN[locale];
  const unit = UNIT[locale];

  // 기준 도입 전에 쓴 글은 실패시키지 않는다 — 보강은 실제 데이터를 확인해야 하는 일이라
  // 검사기가 시킬 수 없다. 대신 목록으로 남겨 리서처가 손볼 수 있게 한다.
  const enforced = (meta.date ?? '') >= ENFORCED_FROM;
  const bucket = enforced ? problems : legacy;

  for (const key of ['title', 'description', 'date']) {
    if (!meta[key]) bucket.push(`${file}: frontmatter에 '${key}'가 없다`);
  }
  if (enforced && !meta.keyword) {
    problems.push(`${file}: frontmatter에 'keyword'가 없다 (이 글이 노리는 검색어 하나)`);
  }

  if (size < min) {
    bucket.push(`${file}: 본문이 ${size}${unit}다 (${min}${unit} 이상 필요)`);
  }

  const keyword = meta.keyword;
  if (keyword) {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // 영어는 대소문자를 구분하지 않는다
    const flags = locale === 'en' ? 'gi' : 'g';
    const hits = (text.match(new RegExp(escaped, flags)) ?? []).length;
    if (hits < MIN_KEYWORD) {
      bucket.push(`${file}: 키워드 "${keyword}"가 ${hits}회다 (${MIN_KEYWORD}회 이상 필요)`);
    }
    const density = (hits * keyword.length) / Math.max(text.length, 1);
    if (density > MAX_DENSITY) {
      bucket.push(
        `${file}: 키워드 "${keyword}" 밀도가 ${(density * 100).toFixed(1)}%다`
        + ` (${(MAX_DENSITY * 100).toFixed(0)}% 초과 — 억지로 채운 것으로 보인다)`);
    }
    console.log(`${file}: ${size}${unit} · "${keyword}" ${hits}회`);
  } else {
    console.log(`${file}: ${size}${unit}${size < min ? ' ⚠ 미달' : ''}`);
  }
}

if (legacy.length) {
  console.log(`\n기준 도입(${ENFORCED_FROM}) 이전 글 ${legacy.length}건 — 보이면 보강할 것:\n`);
  for (const p of legacy) console.log('  · ' + p);
}

if (problems.length) {
  console.error(`\n블로그 문제 ${problems.length}건:\n`);
  for (const p of problems) console.error('  - ' + p);
  process.exit(1);
}
console.log('\n블로그 이상 없음');
