'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSwitcher } from './LanguageSwitcher';
import { UI, type Locale } from '@/lib/i18nLabels';

interface NavItem {
  href: string;
  label: string;
}

function detectLang(pathname: string): Locale {
  const m = pathname.match(/^\/(ko|en|ja)(\/|$)/);
  return m ? (m[1] as Locale) : 'ko';
}

// 상단 accent 링크(캘린더/뉴스/블로그). 앱(standalone)에선 상단바에서 숨기고 ☰ 메뉴 안에 노출.
function buildPrimary(lang: Locale): NavItem[] {
  const ui = UI[lang];
  const p = `/${lang}`;
  return [
    { href: p, label: ui.calendar },
    { href: `${p}/news`, label: ui.news },
    { href: `${p}/artist`, label: ui.artist },
    { href: `${p}/blog`, label: ui.blog },
    { href: `${p}/venue`, label: ui.venue },
  ];
}

export function HeaderNav() {
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
          <svg className="ic" aria-hidden="true"><use href="#ic-flame" /></svg>
          <span className="header-news-label">{ui.news}</span>
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
        <nav className={`site-menu ${open ? 'site-menu-open' : ''}`} aria-label={lang === 'ko' ? '주요 메뉴' : 'Main menu'}>
          {/* 앱(standalone) 전용: 상단 accent 링크를 메뉴 안에 노출(웹에선 CSS로 숨김) */}
          <div className="menu-primary">
            {primary.map(item => {
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
          </div>
        </nav>
      </div>
    </div>
  );
}
