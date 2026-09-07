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
import { execFileSync } from 'node:child_process';

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

let changed;
try {
  changed = git(['diff', '--name-only', 'HEAD^', 'HEAD', '--', '.', ...IGNORED]).trim();
} catch (e) {
  console.log('diff 실패 — 안전하게 빌드한다:', e.message.slice(0, 80));
  process.exit(1);
}

if (changed) {
  console.log('사이트에 영향 있는 변경:\n  ' + changed.split('\n').slice(0, 10).join('\n  '));
  process.exit(1);
}

console.log('문서·프롬프트만 바뀌었다 — 빌드를 건너뛴다');
process.exit(0);
