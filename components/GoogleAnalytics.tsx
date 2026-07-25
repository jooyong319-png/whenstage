import Script from 'next/script';

// GA4 (Google Analytics). 측정 ID(G-*)는 클라이언트에 노출되는 공개값이라 하드코딩해도 안전.
// 로컬/개발 트래픽이 통계에 섞이지 않도록 프로덕션 빌드에서만 로드한다.
// SPA(App Router pushState) 페이지 이동은 GA4 향상된 측정(기본 ON, 브라우저 히스토리 이벤트)이
// 자동 집계하므로 별도 라우트 훅은 불필요.
const GA_ID = 'G-EY2H3WVTG2';

export function GoogleAnalytics() {
  if (process.env.NODE_ENV !== 'production') return null;
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
      </Script>
    </>
  );
}
