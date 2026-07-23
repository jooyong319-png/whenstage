import { HeaderNav } from '@/components/HeaderNav';
import { SiteWordmark } from '@/components/SiteWordmark';
import { SiteFooter } from '@/components/SiteFooter';
import { BottomTabBar } from '@/components/BottomTabBar';
import { HeaderScroll } from '@/components/HeaderScroll';
import { Toaster } from '@/components/Toaster';
import { PushSync } from '@/components/PushSync';
import { InstallPrompt } from '@/components/InstallPrompt';
import { MotionProvider } from '@/components/motion/MotionProvider';

// 루트 레이아웃 2종((locale)/[lang]와 (app))이 공유하는 <body> 내용 — 아이콘 스프라이트, 헤더/푸터,
// 하단 탭바 등 사이트 전역 크롬. 두 그룹 다 <html>을 독립적으로 렌더링해야 해서(멀티 루트 레이아웃)
// 내용이 갈라지면 화면이 서로 달라 보이는 사고가 나기 쉬우므로 여기 한 곳에서만 관리한다.
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <symbol id="ic-calendar" viewBox="0 0 24 24"><path d="M8 2v4M16 2v4" /><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M3 10h18" /></symbol>
        <symbol id="ic-list" viewBox="0 0 24 24"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></symbol>
        <symbol id="ic-menu" viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18" /></symbol>
        <symbol id="ic-flame" viewBox="0 0 24 24"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z" /></symbol>
        <symbol id="ic-star" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26" /></symbol>
        {/* 로고 마크 — "티켓 스텁 W" (2026-07-23 확정). 단색 currentColor가 아니라 테마 토큰 3개를
            직접 참조(배경/노치/W 획) — 헤더처럼 인라인 렌더되는 곳 전용, 파비콘은 별도 SVG 파일. */}
        <symbol id="ic-logo-ticket" viewBox="0 0 32 32">
          <rect x="4" y="7" width="24" height="18" rx="4" fill="var(--accent)" />
          <circle cx="4" cy="16" r="3.2" fill="var(--bg)" />
          <circle cx="28" cy="16" r="3.2" fill="var(--bg)" />
          <path d="M9 13 L12.5 20 L16 14 L19.5 20 L23 13" fill="none" stroke="var(--accent-contrast)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </symbol>
        <symbol id="ic-file" viewBox="0 0 24 24"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4M16 13H8M16 17H8M10 9H8" /></symbol>
        <symbol id="ic-image" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="M21 15l-5-5L5 21" /></symbol>
        <symbol id="ic-arrow-ur" viewBox="0 0 24 24"><path d="M7 7h10v10M7 17 17 7" /></symbol>
        <symbol id="ic-home" viewBox="0 0 24 24"><path d="M3 10.5 12 3l9 7.5M5 9.2V21h14V9.2M9 21v-6h6v6" /></symbol>
        <symbol id="ic-pin" viewBox="0 0 24 24"><path d="M12 22s7-7.44 7-12a7 7 0 1 0-14 0c0 4.56 7 12 7 12z" /><circle cx="12" cy="10" r="2.5" /></symbol>
        <symbol id="ic-mobile" viewBox="0 0 24 24"><rect x="7" y="2" width="10" height="20" rx="2" /><path d="M11 18h2" /></symbol>
        <symbol id="ic-globe" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.6 2.5 15.4 0 18M12 3c-2.5 2.6-2.5 15.4 0 18" /></symbol>
        <symbol id="ic-server" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="7" rx="1.5" /><rect x="3" y="13" width="18" height="7" rx="1.5" /><path d="M7 7.5h.01M7 16.5h.01" /></symbol>
        <symbol id="ic-grid" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></symbol>
        <symbol id="ic-share" viewBox="0 0 24 24"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" /></symbol>
        <symbol id="ic-comment" viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></symbol>
        <symbol id="ic-bell" viewBox="0 0 24 24"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" /></symbol>
        <symbol id="ic-eye" viewBox="0 0 24 24"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></symbol>
        <symbol id="ic-thumbs-up" viewBox="0 0 24 24"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" /></symbol>
        <symbol id="ic-thumbs-down" viewBox="0 0 24 24"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" /></symbol>
        <symbol id="ic-tag" viewBox="0 0 24 24"><path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><path d="M7 7h.01" /></symbol>
        <symbol id="ic-gift" viewBox="0 0 24 24"><path d="M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" /></symbol>
        <symbol id="ic-refresh" viewBox="0 0 24 24"><path d="M21 2v6h-6M3 22v-6h6M21 8a9 9 0 0 0-15-3.5L3 8M3 16a9 9 0 0 0 15 3.5l3-3.5" /></symbol>
        <symbol id="ic-sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" /></symbol>
        <symbol id="ic-moon" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></symbol>
        <symbol id="ic-chevron-down" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" /></symbol>
      </svg>
      <header className="site-header">
        <span className="header-glow-bg" aria-hidden="true">
          <span className="header-glow header-glow-a" />
          <span className="header-glow header-glow-b" />
          <span className="header-glow header-glow-c" />
        </span>
        <SiteWordmark />
        <HeaderNav />
      </header>
      <main id="main"><MotionProvider>{children}</MotionProvider></main>
      <BottomTabBar />
      <HeaderScroll />
      <Toaster />
      <PushSync />
      <InstallPrompt />
      <SiteFooter />
      <script
        dangerouslySetInnerHTML={{
          __html:
            "if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){})})}",
        }}
      />
    </>
  );
}
