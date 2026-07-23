import type { Metadata, Viewport } from 'next';
import '@/app/globals.css';
import { AppHead } from '@/components/AppHead';
import { AppShell } from '@/components/AppShell';
import { LOCALES, type Locale } from '@/lib/i18nLabels';

// 멀티 루트 레이아웃(Next.js) — /ko, /en, /ja 등 로케일이 붙은 모든 실제 콘텐츠 페이지는 이 레이아웃이
// <html>을 직접 렌더링한다. params.lang을 그대로 써서 서버에서부터 정확한 lang 속성이 나가야
// (기존엔 app/layout.tsx 하나가 전체를 감싸서 lang="ko"로 고정 렌더링된 뒤 클라이언트 스크립트로
// EN/JA를 뒤늦게 패치하는 구조였음 — JS 미실행 크롤러·번역기·스크린리더엔 여전히 잘못된 값이 보였음)
// admin/404/에러 등 로케일이 없는 나머지 라우트는 형제 그룹인 app/(app)/layout.tsx가 별도로 담당한다.
// 공통 크롬(헤더/푸터/아이콘 스프라이트 등)은 두 그룹이 components/AppShell·AppHead를 함께 써서 동일하게 유지.
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
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafafa' },
    { media: '(prefers-color-scheme: dark)', color: '#0b1220' },
  ],
  viewportFit: 'cover', // 설치 앱(노치/홈바)에서 safe-area-inset 사용 위해
};

function isLocale(v: string): v is Locale {
  return (LOCALES as string[]).includes(v);
}

export default function LocaleRootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  const lang = isLocale(params.lang) ? params.lang : 'ko';
  return (
    <html lang={lang}>
      <head>
        <AppHead />
      </head>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
