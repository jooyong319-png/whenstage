// IndexNow — 배포가 끝나면 새로 생기거나 바뀐 페이지를 검색엔진에 바로 알린다 (2026-10-01)
//
// 빙·네이버 등 IndexNow 참여 엔진이 크롤을 기다리지 않고 바로 가져가게 한다. 구글은 IndexNow를
// 받지 않는다(구글은 사이트맵 lastmod로 간다).
//
// 실행: .github/workflows/indexnow.yml — Vercel이 GitHub에 남기는 배포 기록의 "성공" 이벤트로 돈다.
// **배포가 끝난 뒤**여야 한다. 먼저 보내면 검색엔진이 아직 없는 페이지(404)를 가져간다.
//
// 무엇을 보내나: 직전 성공 배포 커밋(BASE_SHA)과 이번 커밋(HEAD) 사이에서
//   - data/concerts.{lang}.json — 새로 생긴 항목·내용이 바뀐 항목의 상세 페이지
//   - content/blog/*.{lang}.md  — 새 글·고친 글
//   - 위가 바뀐 로케일의 홈·공연 목록·티켓팅 일정, 바뀐 공연이 속한 이번 달 이후 월별 페이지
// 보내기 전에 **전부 실제로 열어 보고 200인 것만** 보낸다(지난 달 월별 페이지처럼 없거나
// 리다이렉트되는 주소를 걸러내는 가장 확실한 방법).
//
// 로컬 확인: BASE_SHA=<커밋> node scripts/indexnow.mjs --dry-run
import { execFileSync } from 'node:child_process';
import { readdirSync } from 'node:fs';

const HOST = 'whenstage.com';
const BASE = `https://${HOST}`;
const LOCALES = ['ko', 'en', 'ja'];
const DRY = process.argv.includes('--dry-run');
// IndexNow 키 — public/<키>.txt 로 공개돼 있어야 한다(키는 비밀이 아니다, 소유 증명용)
const KEY = readdirSync('public').map(f => f.match(/^([0-9a-f]{32})\.txt$/)?.[1]).find(Boolean);
// api.indexnow.org는 참여 엔진 전체에 공유된다. 네이버는 자체 엔드포인트도 따로 받는다.
const ENDPOINTS = ['https://api.indexnow.org/indexnow', 'https://searchadvisor.naver.com/indexnow'];

function git(args) {
  return execFileSync('git', args, { encoding: 'utf-8', maxBuffer: 64 * 1024 * 1024 });
}
function showJson(sha, path) {
  try { return JSON.parse(git(['show', `${sha}:${path}`])); } catch { return null; }
}

const base = process.env.BASE_SHA;
if (!KEY) { console.log('public/에 IndexNow 키 파일이 없다 — 건너뛴다'); process.exit(0); }
if (!base) { console.log('BASE_SHA 없음(첫 배포 등) — 건너뛴다'); process.exit(0); }

const urls = new Set();
const touchedLocales = new Set();
const today = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);

// 1) 공연 데이터 — id별로 비교
for (const lang of LOCALES) {
  const path = `data/concerts.${lang}.json`;
  const before = showJson(base, path);
  const after = showJson('HEAD', path);
  if (!after) continue;
  const old = new Map((before?.games ?? []).map(g => [g.id, JSON.stringify(g)]));
  let n = 0;
  for (const g of after.games) {
    if (old.get(g.id) === JSON.stringify(g)) continue;
    urls.add(`${BASE}/${lang}/concert/${encodeURIComponent(g.id)}`);
    n++;
    if (!g.release_date_approx && g.release_date >= today.slice(0, 7)) {
      urls.add(`${BASE}/${lang}/month/${g.release_date.slice(0, 7)}`);
    }
  }
  if (n) touchedLocales.add(lang);
}

// 2) 모아보기(블로그) 글 — 파일 이름이 '<slug>.<lang>.md'
for (const line of git(['diff', '--name-status', base, 'HEAD', '--', 'content/blog']).trim().split('\n')) {
  const [status, file] = line.split('\t');
  if (!file || status === 'D') continue;
  const m = file.match(/^content\/blog\/(.+)\.(ko|en|ja)\.md$/);
  if (!m) continue;
  urls.add(`${BASE}/${m[2]}/blog/${encodeURIComponent(m[1])}`);
  urls.add(`${BASE}/${m[2]}/blog`);
}

// 3) 목록·허브 페이지
for (const lang of touchedLocales) {
  urls.add(`${BASE}/${lang}`);
  urls.add(`${BASE}/${lang}/concert`);
  urls.add(`${BASE}/${lang}/ticketing`);
}

if (urls.size === 0) { console.log('보낼 변경 없음'); process.exit(0); }

// 실제로 열리는 것만 (리다이렉트·404 제외)
const live = [];
for (const u of urls) {
  try {
    const r = await fetch(u, { method: 'HEAD', redirect: 'manual' });
    if (r.status === 200) live.push(u); else console.log(`  제외 ${r.status} ${u}`);
  } catch (e) {
    console.log(`  제외(요청 실패) ${u}`);
  }
}
console.log(`후보 ${urls.size}개 → 전송 ${live.length}개`);
live.slice(0, 15).forEach(u => console.log('  ' + decodeURIComponent(u)));
if (live.length > 15) console.log(`  … 외 ${live.length - 15}개`);

if (DRY || live.length === 0) process.exit(0);

const body = JSON.stringify({ host: HOST, key: KEY, keyLocation: `${BASE}/${KEY}.txt`, urlList: live.slice(0, 10000) });
for (const ep of ENDPOINTS) {
  try {
    const r = await fetch(ep, { method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' }, body });
    // 200/202 = 접수. 실패해도 배포와 무관하니 워크플로를 깨지 않는다(로그만 남긴다)
    console.log(`${ep} → ${r.status}`);
  } catch (e) {
    console.log(`${ep} → 요청 실패: ${e.message}`);
  }
}
