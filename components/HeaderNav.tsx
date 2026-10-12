'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSwitcher } from './LanguageSwitcher';
import { UI, type Locale } from '@/lib/i18nLabels';
import { SCHEDULE_TEXT } from '@/lib/scheduleText';
import { pushConfigured, pushSupported, getCurrentSubscription } from '@/lib/push';
import type { MenuData } from '@/lib/menuData';

interface NavItem {
  href: string;
  label: string;
}

function detectLang(pathname: string): Locale {
  const m = pathname.match(/^\/(ko|en|ja)(\/|$)/);
  return m ? (m[1] as Locale) : 'ko';
}

// 상단 accent 링크. 앱(standalone)·좁은 화면에선 상단바에서 숨기고 ☰ 메뉴 안에 노출.
// 두 번째 자리는 뉴스였는데 티켓팅으로 바꿨다(2026-10-13) — 사람들이 찾는 건 "언제 예매가 열리나"이고,
// 뉴스는 주 1회 브리핑에 검색 노출도 막아 둔 섹션이다. 뉴스는 ☰ 메뉴로 옮겼다.
function buildPrimary(lang: Locale): NavItem[] {
  const ui = UI[lang];
  const p = `/${lang}`;
  return [
    { href: p, label: ui.calendar },
    { href: `${p}/ticketing`, label: SCHEDULE_TEXT[lang].navShort },
    { href: `${p}/artist`, label: ui.artist },
    { href: `${p}/blog`, label: ui.blog },
    { href: `${p}/venue`, label: ui.venue },
  ];
}

// ☰ 메뉴 문구 — 이 메뉴에서만 쓴다
const MENU_TEXT: Record<Locale, {
  tickets: string; thisMonth: (m: number) => string; saved: string; alertsOn: string; turnOnAlerts: string;
  glossary: string; contact: string;
}> = {
  ko: { tickets: '예매', thisMonth: m => `이번 달 공연 (${m}월)`, saved: '찜 · 예매 알림', alertsOn: '알림 켜짐', turnOnAlerts: '알림 켜기', glossary: '티켓팅 용어집', contact: '문의 · 제보하기' },
  en: { tickets: 'Tickets', thisMonth: m => `This month (${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m - 1]})`, saved: 'Saved & alerts', alertsOn: 'Alerts on', turnOnAlerts: 'Turn on', glossary: 'Ticketing glossary', contact: 'Contact & report' },
  ja: { tickets: 'チケット', thisMonth: m => `今月の公演(${m}月)`, saved: 'お気に入り・通知', alertsOn: '通知オン', turnOnAlerts: '通知をオン', glossary: 'チケット用語集', contact: 'お問い合わせ・情報提供' },
};

export function HeaderNav({ menu }: { menu?: MenuData }) {
  const pathname = usePathname();
  const lang = detectLang(pathname);
  // 헤더의 드롭다운 2개(언어 스위처 / ☰ 메뉴)가 동시에 열리지 않도록 단일 상태로 관리
  const [openMenu, setOpenMenu] = useState<'lang' | 'nav' | null>(null);
  const open = openMenu === 'nav';
  const ref = useRef<HTMLDivElement>(null);
  const ui = UI[lang];
  const home = `/${lang}`;

  // 바깥 클릭·Esc로 닫기
  useEffect(() => {
    if (!openMenu) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpenMenu(null);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpenMenu(null); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [openMenu]);

  const primary = buildPrimary(lang);
  const M = MENU_TEXT[lang];
  const p = home;

  // 알림 상태 — 메뉴를 처음 열 때 한 번 본다(null = 모름/지원 안 함 → 아무것도 안 띄운다)
  const [pushOn, setPushOn] = useState<boolean | null>(null);
  useEffect(() => {
    if (!open || pushOn !== null) return;
    if (!pushConfigured() || !pushSupported()) return;
    getCurrentSubscription().then(s => setPushOn(!!s)).catch(() => {});
  }, [open, pushOn]);

  return (
    <div className="header-utils" ref={ref}>
      {/* 좌측: 언어 스위처 + 테마 토글 (마퀴 레이아웃 — 워드마크는 헤더 중앙에 절대배치) */}
      <div className="header-util-left">
        <LanguageSwitcher
          open={openMenu === 'lang'}
          onOpenChange={(v) => setOpenMenu(v ? 'lang' : null)}
        />
        <ThemeToggle />
      </div>

      {/* 우측: 상시 노출 accent 링크(캘린더·뉴스·모아보기) + ☰ 메뉴 */}
      <div className="header-nav-right">
        <nav className="header-primary-nav" aria-label={lang === 'ko' ? '주요 메뉴' : 'Main menu'}>
        <a
          href={home}
          className={`header-cal-link ${pathname === home ? 'header-cal-active' : ''}`}
          aria-current={pathname === home ? 'page' : undefined}
        >
          <svg className="ic" aria-hidden="true"><use href="#ic-calendar" /></svg>
          <span className="header-cal-label">{ui.calendar}</span>
        </a>
        <a
          href={primary[1].href}
          className={`header-news-link ${pathname.startsWith(primary[1].href) ? 'header-news-active' : ''}`}
          aria-current={pathname.startsWith(primary[1].href) ? 'page' : undefined}
        >
          <svg className="ic" aria-hidden="true"><use href="#ic-tag" /></svg>
          <span className="header-news-label">{SCHEDULE_TEXT[lang].navShort}</span>
        </a>
        <a
          href={primary[2].href}
          className={`header-artist-link ${pathname.startsWith(primary[2].href) ? 'header-artist-active' : ''}`}
          aria-current={pathname.startsWith(primary[2].href) ? 'page' : undefined}
        >
          <svg className="ic" aria-hidden="true"><use href="#ic-star" /></svg>
          <span className="header-artist-label">{ui.artist}</span>
        </a>
        <a
          href={primary[3].href}
          className={`header-guide-link ${pathname.startsWith(primary[3].href) ? 'header-guide-active' : ''}`}
          aria-current={pathname.startsWith(primary[3].href) ? 'page' : undefined}
        >
          <svg className="ic" aria-hidden="true"><use href="#ic-file" /></svg>
          <span className="header-guide-label">{ui.blog}</span>
        </a>
        <a
          href={primary[4].href}
          className={`header-venue-link ${pathname.startsWith(primary[4].href) ? 'header-venue-active' : ''}`}
          aria-current={pathname.startsWith(primary[4].href) ? 'page' : undefined}
        >
          <svg className="ic" aria-hidden="true"><use href="#ic-pin" /></svg>
          <span className="header-venue-label">{ui.venue}</span>
        </a>
        </nav>

        <button
          type="button"
          className="menu-btn"
          onClick={() => setOpenMenu(m => m === 'nav' ? null : 'nav')}
          aria-expanded={open}
          aria-haspopup="true"
          aria-label={open ? (lang === 'ko' ? '메뉴 닫기' : 'Close menu') : (lang === 'ko' ? '메뉴 열기' : 'Open menu')}
        >
          <svg className="ic" aria-hidden="true"><use href="#ic-menu" /></svg>
        </button>

        {/* 링크는 항상 DOM에 유지(크롤 가능) — 열림 상태만 CSS로 토글 */}
        <nav className={`site-menu ${open ? 'site-menu-open' : ''}`} aria-label={lang === 'ko' ? '전체 메뉴' : lang === 'ja' ? 'メニュー' : 'All menu'}>
          {/* ☰ = 예매 도구함(2026-10-13). 예전엔 PC에서 열면 **빈 상자**였다(위쪽 링크를 다시 보여주는
              묶음뿐이었고 그건 PC에서 숨김). 위쪽 메뉴에 없는 '행동' 위주 항목을 둔다 */}
          <div className="menu-group">
            <span className="menu-group-title">{M.tickets}</span>
            <a href={`${p}/ticketing`} className="menu-link menu-link-row" onClick={() => setOpenMenu(null)}>
              <span>{SCHEDULE_TEXT[lang].footerTicketing}</span>
              {menu && menu.ticketCount > 0 && <span className="menu-count">{menu.ticketCount}</span>}
            </a>
            <a href={menu?.monthYm ? `${p}/month/${menu.monthYm}` : `${p}/concert`} className="menu-link" onClick={() => setOpenMenu(null)}>
              {menu?.monthYm ? M.thisMonth(Number(menu.monthYm.slice(5, 7))) : SCHEDULE_TEXT[lang].footerMonthly}
            </a>
            <a href={`${p}/wishlist`} className="menu-link menu-link-row" onClick={() => setOpenMenu(null)}>
              <span>{M.saved}</span>
              {/* 알림이 켜져 있으면 점 — 꺼져 있으면 여기서 켜러 가게 된다(PC엔 알림을 켤 곳이 여기뿐) */}
              {pushOn === true && <span className="menu-dot" aria-label={M.alertsOn} />}
              {pushOn === false && <span className="menu-hint">{M.turnOnAlerts}</span>}
            </a>
          </div>
          <div className="menu-divider" />
          {/* 좁은 화면·앱 전용: 상단 accent 링크를 메뉴 안에 노출(넓은 웹에선 CSS로 숨김) */}
          <div className="menu-primary">
            {/* 티켓팅은 위 '예매' 묶음에 이미 있다 — 같은 링크를 두 번 보여주지 않는다 */}
            {primary.filter(item => !item.href.endsWith('/ticketing')).map(item => {
              const active = item.href === home ? pathname === home : pathname.startsWith(item.href);
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className="menu-link menu-link-primary"
                  aria-current={active ? 'page' : undefined}
                  onClick={() => setOpenMenu(null)}
                >
                  {item.label}
                </a>
              );
            })}
            <div className="menu-divider" />
          </div>
          <div className="menu-group">
            <a href={`${p}/news`} className="menu-link" onClick={() => setOpenMenu(null)}>{ui.news}</a>
            <a href={`${p}/guide`} className="menu-link" onClick={() => setOpenMenu(null)}>{ui.guide}</a>
            <a href={`${p}/guide/glossary`} className="menu-link" onClick={() => setOpenMenu(null)}>{M.glossary}</a>
            <a href={`${p}/contact`} className="menu-link" onClick={() => setOpenMenu(null)}>{M.contact}</a>
          </div>
        </nav>
      </div>
    </div>
  );
}
