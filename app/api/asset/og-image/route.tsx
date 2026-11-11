import { ImageResponse } from 'next/og';
import { readFileSync } from 'fs';
import path from 'path';

// 소셜 공유 미리보기 이미지(OG/Twitter 카드, 1200x630) — 사이트 전역 폴백(app/layout.tsx가
// /og-image.png로 참조) + 콘서트 상세 페이지가 image_url 없을 때 쓰는 폴백. "티켓 스텁 W"
// 마크 + 새 레이저 워시 톤으로 갱신(2026-07-23, 이전엔 구 브랜드 그라데이션 그대로였음).
// nodejs 런타임 (2026-11-11) — Next 16에서 Edge Runtime이 사용 중단 예고됐다. 예전엔 로컬 Windows의
// next/og **기본 폰트** 로더 버그를 피하려고 edge를 썼는데, feature-graphic 라우트처럼 폰트를 직접
// 읽어 넘기면 그 경로를 타지 않는다.
// 가변 폰트(woff2)는 next/og가 파싱 못 함(wOF2 시그니처 미지원) — otf 사용.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const fontData = readFileSync(path.join(process.cwd(), 'assets/fonts/pretendard-bold.otf'));

export async function GET() {

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0b1220',
          fontFamily: 'Pretendard',
        }}
      >
        <svg width="92" height="92" viewBox="0 0 32 32" style={{ marginBottom: 30 }}>
          <rect x="4" y="7" width="24" height="18" rx="4" fill="#33d6ff" />
          <circle cx="4" cy="16" r="3.2" fill="#0b1220" />
          <circle cx="28" cy="16" r="3.2" fill="#0b1220" />
          <path
            d="M9 13 L12.5 20 L16 14 L19.5 20 L23 13"
            fill="none"
            stroke="#0b1220"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div style={{ display: 'flex', fontSize: 76, fontWeight: 800, color: '#eaf2fb', letterSpacing: -2 }}>WhenStage</div>
        <div style={{ display: 'flex', fontSize: 30, fontWeight: 600, color: '#8fa3bf', marginTop: 18 }}>
          콘서트 · 발매 · 페스티벌 · 팬미팅 캘린더
        </div>
      </div>
    ),
    { width: 1200, height: 630, fonts: [{ name: 'Pretendard', data: fontData, weight: 800, style: 'normal' }] }
  );
}
