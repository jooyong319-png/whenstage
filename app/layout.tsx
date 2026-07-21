import type { Metadata, Viewport } from 'next';
import './globals.css';
import { HeaderNav } from '@/components/HeaderNav';
import { SiteWordmark } from '@/components/SiteWordmark';
import { SiteFooter } from '@/components/SiteFooter';
// 왼쪽 플로팅 위젯(N월 출시/사전예약): 재작업 예정, 임시 주석 (재사용 가능)
// import { FloatingMonthStats } from '@/components/FloatingMonthStats';
import { BottomTabBar } from '@/components/BottomTabBar';
// import { SideRailAds } from '@/components/SideRailAds'; // 카카오 애드핏 — 콘텐츠 우선 정책으로 비활성(수익 낮음)
import { HeaderScroll } from '@/components/HeaderScroll';
import { Toaster } from '@/components/Toaster';
import { PushSync } from '@/components/PushSync';
import { InstallPrompt } from '@/components/InstallPrompt';

export const metadata: Metadata = {
  metadataBase: new URL('https://whenstage.com'),
  title: {
    default: 'WhenStage | 내한·콘서트·음원 발매·페스티벌 일정 한눈에',
    template: '%s | WhenStage',
  },
  description: '콘서트·내한 공연, 음원 발매(컴백), 페스티벌, 팬미팅 일정을 한눈에. 매일 업데이트되는 공연·발매 캘린더.',
  keywords: ['콘서트 일정', '내한 공연', '컴백 일정', '음원 발매', '페스티벌 라인업', '팬미팅', '티켓팅 일정', 'WhenStage'],
  openGraph: {
    type: 'website',
    siteName: 'WhenStage',
    locale: 'ko_KR',
    images: ['/og-image.png'],
    url: 'https://whenstage.com/',
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og-image.png'],
  },
  robots: { index: true, follow: true },
  verification: {
    google: 'lzLVWegsUNGglPnfG4v2LZbpcqZufhIdksQHS1C9Vjc',
    other: {
      'naver-site-verification': '3ec567114e683e947e53e79a6f652d967c57231c',
    },
  },
  icons: { icon: '/favicon.svg', apple: '/icons/apple-touch-icon.png' },
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'WhenStage' },
};

export const viewport: Viewport = {
  themeColor: '#ff3d78',
  viewportFit: 'cover', // 설치 앱(노치/홈바)에서 safe-area-inset 사용 위해
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('theme')||'dark';document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','dark');}try{var m=location.pathname.match(/^\\/(ko|en|ja)(\\/|$)/);if(m)document.documentElement.lang=m[1];}catch(e){}})();",
          }}
        />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
      </head>
      <body>
        <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
          <symbol id="ic-gamepad" viewBox="0 0 24 24"><path d="M6 11h4M8 9v4M15 12h.01M18 10h.01M17.32 5H6.68a4 4 0 0 0-3.978 3.59C2.6 9.4 2 14.46 2 16a3 3 0 0 0 5 2l1.41-1.41A2 2 0 0 1 9.83 16h4.34a2 2 0 0 1 1.42.59L17 18a3 3 0 0 0 5-2c0-1.54-.6-6.6-.7-7.41A4 4 0 0 0 17.32 5z" /></symbol>
          <symbol id="ic-calendar" viewBox="0 0 24 24"><path d="M8 2v4M16 2v4" /><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M3 10h18" /></symbol>
          <symbol id="ic-list" viewBox="0 0 24 24"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></symbol>
          <symbol id="ic-menu" viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18" /></symbol>
          <symbol id="ic-flame" viewBox="0 0 24 24"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z" /></symbol>
          <symbol id="ic-star" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26" /></symbol>
          <symbol id="ic-file" viewBox="0 0 24 24"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4M16 13H8M16 17H8M10 9H8" /></symbol>
          <symbol id="ic-image" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="M21 15l-5-5L5 21" /></symbol>
          <symbol id="ic-arrow-ur" viewBox="0 0 24 24"><path d="M7 7h10v10M7 17 17 7" /></symbol>
          <symbol id="ic-home" viewBox="0 0 24 24"><path d="M3 10.5 12 3l9 7.5M5 9.2V21h14V9.2M9 21v-6h6v6" /></symbol>
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
          <SiteWordmark />
          <HeaderNav />
        </header>
        <main id="main">{children}</main>
        {/* <FloatingMonthStats /> 재작업 예정, 임시 비활성 */}
        {/* <SideRailAds /> — 카카오 애드핏, 콘텐츠 우선 정책으로 비활성(수익 낮음) */}
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
      </body>
    </html>
  );
}
