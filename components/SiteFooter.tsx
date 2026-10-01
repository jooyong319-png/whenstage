'use client';
import { usePathname } from 'next/navigation';
import { UI, type Locale } from '@/lib/i18nLabels';

function detectLang(pathname: string): Locale {
  const m = pathname.match(/^\/(ko|en|ja)(\/|$)/);
  return m ? (m[1] as Locale) : 'ko';
}

export function SiteFooter() {
  const pathname = usePathname();
  const lang = detectLang(pathname);
  const ui = UI[lang];
  const p = `/${lang}`;
  return (
    <footer className="site-footer">
      <p>© 2026 {ui.siteNameShort} (whenstage.com)</p>
      <p>{ui.contact}: <a href="mailto:devju546@gmail.com">devju546@gmail.com</a> · <a href={`${p}/concert`}>{ui.concertListTitle}</a> · <a href={`${p}/blog`}>{ui.blog}</a></p>
      {/* 날짜로 찾는 검색용 페이지 — 한국어만 있다(lib/schedule.ts) */}
      {lang === 'ko' && (
        <p><a href="/ko/ticketing">티켓팅 일정</a> · <a href="/ko/concert">월별 공연 일정</a></p>
      )}
      <p>
        <a href={`${p}/about`}>{ui.about}</a> · <a href={`${p}/contact`}>{ui.contactPage}</a> · <a href={`${p}/guide`}>{ui.guide}</a> · <a href={`${p}/privacy`}>{ui.privacy}</a> · <a href={`${p}/terms`}>{ui.terms}</a>
      </p>
      <p className="footer-disclaimer">{ui.footerDisclaimer}</p>
    </footer>
  );
}
