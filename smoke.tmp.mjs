import { chromium } from 'playwright';
const B = process.env.B;
const browser = await chromium.launch();
const pages = ['/ko','/en','/ja','/ko/concert','/ko/ticketing','/ko/news','/ko/blog','/ko/artist','/ko/venue','/ko/wishlist','/ko/guide','/ko/about','/admin', process.env.DETAIL, process.env.ARTIST];
let bad = 0;
for (const p of pages) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, serviceWorkers: 'block' });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push('pageerror: ' + e.message.slice(0, 200)));
  page.on('console', m => { if (m.type() === 'error' && !/127\.0\.0\.1:4455|Failed to load resource|googletagmanager|adsbygoogle|ERR_/.test(m.text())) errs.push('console: ' + m.text().slice(0, 200)); });
  await page.goto(B + p, { waitUntil: 'load' });
  await page.waitForTimeout(1500);
  const h1 = await page.locator('h1').first().textContent().catch(() => null);
  console.log(errs.length ? 'ERR' : 'ok ', p, '| h1:', (h1 || '').trim().slice(0, 40), errs.length ? '\n   ' + errs.slice(0, 3).join('\n   ') : '');
  bad += errs.length;
  if (p === '/ko') {
    // 상호작용: 검색, 공연 카드 클릭(모달), 테마 토글
    const search = page.locator('input[type="search"], input[placeholder]').first();
    if (await search.count()) { await search.fill('콘서트'); await page.waitForTimeout(500); }
    const link = page.locator('a[href^="/ko/concert/"]').first();
    if (await link.count()) { await link.click({ timeout: 5000 }).catch(e => errs.push('click: ' + e.message.slice(0, 100))); await page.waitForTimeout(800); }
    console.log('   after interact url:', page.url().replace(B, ''), 'dialog:', await page.locator('[role="dialog"]').count(), 'errs:', errs.length);
    await page.screenshot({ path: '/tmp/home16.png' });
  }
  await ctx.close();
}
await browser.close();
console.log('TOTAL_ERRORS', bad);
