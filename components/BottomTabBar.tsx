'use client';
import { usePathname } from 'next/navigation';
import { UI, CAL, LOCALES, type Locale } from '@/lib/i18nLabels';

interface Tab {
  href: string;
  label: string;
  icon: string;
}

// ko도 반드시 포함해야 함 — 빠뜨리면(예전 버그) 기본 로케일(ko) 페이지에서 lang이 계속
// null로 잡혀 아래 buildTabs가 "/news"처럼 로케일 접두사 없는 존재하지 않는 경로로 링크해버림.
function detectLang(pathname: string): Locale | null {
  const m = pathname.match(/^\/(ko|en|ja)(\/|$)/);
  return m && (LOCALES as string[]).includes(m[1]) ? (m[1] as Locale) : null;
}

// 설치 앱(standalone) 전용 하단 내비. 웹(브라우저)에선 CSS로 숨김.
// lang을 못 찾은 경우(예: /admin 등 로케일 없는 라우트)는 안전하게 ko로 폴백 — 링크가
// 아예 깨지는 것보다 낫다(이 경로들에서 탭바 자체가 노출될 일은 거의 없음).
function buildTabs(lang: Locale): Tab[] {
  const ui = UI[lang];
  const t = CAL[lang];
  const p = `/${lang}`;
  return [
    { href: p, label: ui.calendar, icon: 'ic-calendar' },
    { href: `${p}/news`, label: ui.news, icon: 'ic-flame' },
    { href: `${p}/blog`, label: ui.blog, icon: 'ic-file' },
    { href: `${p}/wishlist`, label: t.wishlist, icon: 'ic-star' },
  ];
}

export function BottomTabBar() {
  const pathname = usePathname();
  const lang = detectLang(pathname) ?? 'ko';
  const home = `/${lang}`;
  const TABS = buildTabs(lang);

  return (
    <nav className="bottom-tabbar" aria-label={lang ? CAL[lang].appBottomNavAria : '앱 하단 메뉴'}>
      {TABS.map(tab => {
        const active = tab.href === home ? pathname === home : pathname.startsWith(tab.href);
        // 이미 그 탭이면 이동 대신 맨 위로 스크롤(앱 관습)
        const onClick = active
          ? (e: React.MouseEvent) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
          : undefined;
        return (
          <a
            key={tab.href}
            href={tab.href}
            className="bottom-tab"
            aria-current={active ? 'page' : undefined}
            onClick={onClick}
          >
            <span className="tab-ico">
              <svg className="ic" aria-hidden="true"><use href={`#${tab.icon}`} /></svg>
            </span>
            <span>{tab.label}</span>
          </a>
        );
      })}
    </nav>
  );
}
