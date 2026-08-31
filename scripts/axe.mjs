// 접근성 자동 점검. `npm run build && npx next start -p 3000` 후 `npm run axe`.
//
// ⚠️ **reducedMotion: 'reduce'로 검사한다.** 이 사이트는 스크롤에 맞춰 요소가 나타나는
// Reveal 애니메이션을 쓰는데, 그냥 검사하면 아직 나타나지 않은 요소(opacity: 0)의 색을
// 재서 대비 위반을 잔뜩 만들어 낸다. 실제로 이렇게 갈렸다(2026-09-01):
//
//   즉시 검사     5건
//   3초 대기      3건   ← 뷰포트 밖 카드는 끝까지 안 나타난다
//   모션 끔       0건   ← 진짜 결과
//
// 애니메이션이 끝난 화면을 재려면 모션을 끄는 게 가장 확실하다. 그리고 모션을 끈 상태가
// 정상으로 보이는지는 그 자체로 검사할 값이 있다(prefers-reduced-motion 존중).
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const axe = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf-8');
const { chromium } = await import(
  process.env.PLAYWRIGHT_PATH ?? 'playwright'
);

const BASE = process.env.AXE_BASE ?? 'http://localhost:3000';
const PAGES = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ['/ko', '/ko/concert', '/ko/artist', '/ko/venue', '/ko/blog', '/ko/news',
     '/en/concert', '/ja/concert'];

const browser = await chromium.launch();
let total = 0;

for (const colorScheme of ['light', 'dark']) {
  for (const vp of [
    { width: 1280, height: 900, name: 'desktop' },
    { width: 390, height: 844, name: 'mobile' },
  ]) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      colorScheme,
      reducedMotion: 'reduce',   // 위 주석 참고 — 빼면 거짓 양성이 쏟아진다
    });
    const page = await ctx.newPage();
    for (const path of PAGES) {
      await page.goto(BASE + path, { waitUntil: 'networkidle' });
      await page.addScriptTag({ content: axe });
      const { violations } = await page.evaluate(() =>
        window.axe.run(document, { resultTypes: ['violations'] }));
      for (const v of violations) {
        total += v.nodes.length;
        console.log(`❌ ${colorScheme}/${vp.name} ${path} — ${v.id} (${v.impact}) ×${v.nodes.length}`);
        console.log(`   ${v.nodes[0].target.join(' ')}`);
      }
    }
    await ctx.close();
  }
}

await browser.close();
console.log(`axe 위반 ${total}건 — ${PAGES.length}페이지 × light/dark × desktop/mobile`);
process.exit(total === 0 ? 0 : 1);
