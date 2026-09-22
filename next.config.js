/** @type {import('next').NextConfig} */

// 병합으로 사라진 공연 id -> 남긴 id (2026-09-22~). 리서처가 같은 공연을 slug만 다르게
// 두 번 등록한 것을 합치면서 한쪽 URL이 없어진다. 이미 색인·공유된 URL이 404가 되지 않게
// 영구 리다이렉트로 보낸다. 목록은 data/concert-redirects.json 하나에서만 관리한다.
const CONCERT_REDIRECTS = require('./data/concert-redirects.json').redirects;

const nextConfig = {
  reactStrictMode: true,
  // 백업/문서/스크립트는 빌드 대상에서 제외
  // (eslint/typecheck도)
  eslint: { ignoreDuringBuilds: false },
  // metadata.metadataBase 경고 방지
  experimental: {
    typedRoutes: false
  },

  /**
   * 🔴 엣지 캐시를 켠다 — ISR Read 한도 초과의 직접 원인이었다 (2026-09-21).
   *
   * 실측: Edge Requests 212K인데 **ISR Reads 1.1M**(한도 1M 초과). 요청 1건당 5.2회다.
   * 2026-09-07에 사이드바 prefetch를 잡아 4.1배까지 내렸는데 다시 올라왔다.
   *
   * 응답 헤더를 보니 원인이 분명했다:
   *
   *   Cache-Control: public, max-age=0, must-revalidate
   *   X-Vercel-Cache: PRERENDER      ← 요청마다 프리렌더 캐시를 읽는다 = ISR Read
   *
   * `max-age=0, must-revalidate`는 Next.js가 정적 페이지에 붙이는 기본값인데, 이러면
   * **엣지가 응답을 보관하지 못해** 모든 요청이 프리렌더 저장소까지 내려간다.
   * `/ko`만 가끔 `HIT`이고 상세·목록은 전부 `PRERENDER`였다.
   *
   * 이 사이트는 **배포할 때만 내용이 바뀌는 완전 정적 사이트**다(SSG + dynamicParams=false).
   * 리서처가 데이터를 갱신하면 push → 재배포가 일어나고, 배포는 엣지 캐시를 갈아엎는다.
   * 따라서 엣지에 오래 두어도 낡은 내용이 나갈 수 없다.
   *
   * - `s-maxage=3600`: 엣지가 1시간 보관 → 그 사이 요청은 ISR을 안 읽는다
   * - `stale-while-revalidate=86400`: 만료 뒤에도 일단 캐시를 주고 뒤에서 갱신(사용자 대기 0)
   * - `max-age=0`: **브라우저**는 캐시하지 않는다. D-day·티켓팅 상태가 클라이언트에서
   *   계산되므로 방문자는 항상 최신 HTML을 받아야 한다. 공유 캐시(엣지)만 길게 둔다.
   *
   * ⚠️ 되돌리려면 이 headers() 블록만 지우면 된다.
   */
  async redirects() {
    return CONCERT_REDIRECTS.map(r => ({ source: r.from, destination: r.to, permanent: true }));
  },

  async headers() {
    return [
      {
        // `_next/static`(불변 자산)과 API는 Next·Vercel이 알아서 처리하므로 건드리지 않는다.
        source: '/((?!_next/static|_next/image|api).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
          },
        ],
      },
    ];
  }
};
module.exports = nextConfig;
