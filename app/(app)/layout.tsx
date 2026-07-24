import type { Metadata, Viewport } from 'next';
import '@/app/globals.css';
import { AppHead } from '@/components/AppHead';
import { AppShell } from '@/components/AppShell';

// 멀티 루트 레이아웃(Next.js) — 로케일이 붙지 않는 나머지 라우트(관리자 페이지, 바닥 `/` 리다이렉트
// 안전망, 전역 404/에러) 전용 루트 레이아웃. 전부 색인 대상이 아니거나(관리자, `/`) 에러 상태라
// lang을 "ko"로 고정해도 SEO 영향이 없다 — 실제 콘텐츠 페이지는 형제 그룹인
// app/(locale)/[lang]/layout.tsx가 params.lang으로 정확히 렌더링한다.
export const metadata: Metadata = {
  metadataBase: new URL('https://whenstage.com'),
  title: {
    default: 'WhenStage | 내한·콘서트·음원 발매·페스티벌 일정 한눈에',
    template: '%s | WhenStage',
  },
  description: '콘서트·내한 공연, 음원 발매(컴백), 페스티벌, 팬미팅 일정을 한눈에. 매일 업데이트되는 공연·발매 캘린더.',
  robots: { index: true, follow: true },
  icons: { icon: '/favicon.svg', apple: '/icons/apple-touch-icon.png' },
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'WhenStage' },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafafa' },
    { media: '(prefers-color-scheme: dark)', color: '#0b1220' },
  ],
  viewportFit: 'cover',
};

export default function AppRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <AppHead />
      </head>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
