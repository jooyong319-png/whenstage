// Vercel Ignored Build Step — 이 커밋이 사이트 출력을 바꾸는가?
//
// exit 1 = 빌드한다 / exit 0 = 건너뛴다 (Vercel 규약)
//
// ## 왜 필요한가 (2026-09-07)
//
// ISR Read Units가 한 달 한도의 90%에 닿았는데, 사람 방문자는 하루 20명 남짓이다.
// 원인 중 하나가 **불필요한 재배포**였다. 최근 30일 111번 배포 중 **37번(33%)이
// CHAT.md만 바뀐 커밋**이었다.
//
// 재배포는 공짜가 아니다. 1,570페이지가 다시 만들어지고 CDN 캐시가 통째로 무효화된다.
// 그 뒤 크롤러가 다시 긁으면 전부 캐시 미스라 ISR 읽기가 그만큼 발생한다. 리서처가
// 보고를 CHAT.md에 남길 때마다 이 일이 벌어지고 있었다.
//
// ## 무엇을 건너뛰나
//
// **화면에 아무것도 바꾸지 않는 파일만** 뺀다. 아래 목록 밖의 것이 하나라도 바뀌면 빌드한다.
// 특히 `content/`(블로그·뉴스 글)와 `data/`(공연 데이터)는 화면에 그대로 나가므로
// 절대 제외 목록에 넣지 않는다.
// ## 🔴 비교 기준은 `HEAD^`가 아니라 **마지막으로 빌드한 커밋**이다 (2026-09-21 수정)
//
// 처음엔 `HEAD^..HEAD`, 즉 **맨 끝 커밋 하나만** 봤다. 그래서 한 번에 여러 커밋을
// 푸시하고 그 마지막이 문서 변경이면, **앞의 진짜 변경까지 통째로 묻혔다.**
//
// 실제로 당했다 — `next.config.js`(엣지 캐시 설정)와 `.gitignore`를 함께 푸시했는데
// 맨 끝이 `.gitignore`라 "문서만 바뀌었다"로 판정돼 배포가 건너뛰어졌다. 헤더가 왜 안 바뀌나
// 한참 찾았다. **조용히 배포가 안 되는 게 이 장치의 최악의 실패 모드다.**
//
// 그래서 마지막으로 **실제 빌드한 커밋 SHA**를 Vercel 빌드 캐시에 남기고 거기서부터
// 비교한다(Vercel은 이 스크립트가 돌기 **전에** 캐시를 복원한다 — 빌드 로그로 확인).
// 마커가 없거나 그 커밋이 클론 히스토리에 없으면 **안전하게 빌드한다.**
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

/** 마지막으로 빌드한 커밋 SHA. Vercel이 배포 간에 이 캐시를 복원해 준다. */
const MARKER = '.next/cache/last-built-sha';

/** 바뀌어도 사이트 출력이 그대로인 것들 */
const IGNORED = [
  ':(exclude)CHAT.md',
  ':(exclude)README.md',
  ':(exclude)AGENTS.md',
  ':(exclude)prompts',
  ':(exclude)wiki',
  ':(exclude)docs',
  ':(exclude).gitignore',
  ':(exclude).github',
];

function git(args) {
  return execFileSync('git', args, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'pipe'] });
}

try {
  // 이전 커밋이 없으면(첫 배포·얕은 클론) 판단할 근거가 없다 → 빌드한다
  git(['rev-parse', 'HEAD^']);
} catch {
  console.log('이전 커밋을 못 찾음 — 안전하게 빌드한다');
  process.exit(1);
}

/** 비교 기준 커밋 — 마지막으로 빌드한 것, 없으면 HEAD^ */
function baseRef() {
  if (!existsSync(MARKER)) return 'HEAD^';
  const sha = readFileSync(MARKER, 'utf-8').trim();
  if (!/^[0-9a-f]{7,40}$/.test(sha)) return 'HEAD^';
  try {
    git(['cat-file', '-e', sha + '^{commit}']);   // 얕은 클론이면 없을 수 있다
    return sha;
  } catch {
    console.log('마지막 빌드 커밋이 클론에 없다 — HEAD^로 비교한다');
    return 'HEAD^';
  }
}

const base = baseRef();
console.log('비교 기준: ' + base + (base === 'HEAD^' ? ' (마커 없음)' : ' (마지막 빌드 커밋)'));
let changed;
try {
  changed = git(['diff', '--name-only', base, 'HEAD', '--', '.', ...IGNORED]).trim();
} catch (e) {
  console.log('diff 실패 — 안전하게 빌드한다:', e.message.slice(0, 80));
  process.exit(1);
}

if (changed) {
  console.log('사이트에 영향 있는 변경:\n  ' + changed.split('\n').slice(0, 10).join('\n  '));
  try {
    mkdirSync(dirname(MARKER), { recursive: true });
    writeFileSync(MARKER, git(['rev-parse', 'HEAD']).trim());
  } catch (e) {
    console.log('마커 기록 실패(무해):', e.message.slice(0, 60));
  }
  process.exit(1);
}

console.log('문서·프롬프트만 바뀌었다 — 빌드를 건너뛴다');
process.exit(0);
