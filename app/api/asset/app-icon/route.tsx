import { ImageResponse } from 'next/og';
import { readFileSync } from 'fs';
import path from 'path';

// PWA/홈 화면 앱 아이콘(192/512/apple-touch) 생성용 에셋 엔드포인트 — feature-graphic 라우트와
// 동일한 패턴(next/og). 헤더 워드마크·파비콘과 같은 "티켓 스텁 W" 마크를 레이저 워시(다크) 톤으로
// 정적 렌더 — 앱 아이콘은 OS가 라이트/다크를 구분 안 해주는 경우가 많아 한 가지 톤으로 고정.
// ?size=192 (기본 512), maskable 아이콘 안전 영역 고려해 마크를 캔버스의 62%로 축소 배치.
// nodejs 런타임 (2026-11-11) — Next 16에서 Edge Runtime이 사용 중단 예고돼 옮겼다.
// 예전엔 로컬 Windows에서 next/og 기본 폰트 로더가 file:// 경로를 잘못 만들어 500이 나서(2026-07-23)
// edge를 썼다. 그 로더를 타지 않도록 폰트를 직접 읽어 넘긴다(이 아이콘엔 글자가 없지만 폰트를
// 하나도 안 주면 기본 폰트를 찾으러 간다).
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const FONT = readFileSync(path.join(process.cwd(), 'assets/fonts/pretendard-bold.otf'));

export async function GET(req: Request) {
  const url = new URL(req.url);
  const size = Math.max(32, Math.min(1024, parseInt(url.searchParams.get('size') || '512', 10) || 512));
  const mark = Math.round(size * 0.62);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0b1220',
        }}
      >
        <svg width={mark} height={mark} viewBox="0 0 32 32">
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
      </div>
    ),
    { width: size, height: size, fonts: [{ name: 'Pretendard', data: FONT, weight: 700, style: 'normal' }] }
  );
}
