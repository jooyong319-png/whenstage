import { ImageResponse } from 'next/og';
import { readFileSync } from 'fs';
import path from 'path';

// Play 스토어 피처 그래픽(1024x500) 생성용 일회성 에셋 엔드포인트.
// 브랜드 코랄-바이올렛 그라데이션 + WhenStage 워드마크 + 한글 태그라인 + 미니 캘린더 모티브.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PRETENDARD = readFileSync(path.join(process.cwd(), 'assets/fonts/pretendard-bold.otf'));

export async function GET() {
  const RELEASE = '#ff5c8f';
  const PREREG = '#ffcf5c';
  // 미니 캘린더 셀(숫자 + 점 유무)
  const cells = [
    { d: 1, dot: 'p' }, { d: 2, dot: 'r' }, { d: 3 }, { d: 4 }, { d: 5 }, { d: 6, dot: 'r' }, { d: 7 },
    { d: 8, dot: 'r' }, { d: 9, today: true }, { d: 10 }, { d: 11 }, { d: 12, dot: 'r' }, { d: 13 }, { d: 14, dot: 'r' },
    { d: 15 }, { d: 16, dot: 'r' }, { d: 17 }, { d: 18 }, { d: 19, dot: 'p' }, { d: 20 }, { d: 21, dot: 'r' },
  ] as { d: number; dot?: 'r' | 'p'; today?: boolean }[];

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          backgroundImage: 'linear-gradient(135deg, #c724b1 0%, #ff3d78 55%, #ff8a00 100%)',
          fontFamily: 'Pretendard',
          padding: '0 56px',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* 왼쪽 텍스트 */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 84, fontWeight: 700, color: '#ffffff', lineHeight: 1 }}>WhenStage</span>
          <span style={{ fontSize: 48, fontWeight: 700, color: '#ffffff', marginTop: 14 }}>공연·발매 캘린더</span>
          <span style={{ fontSize: 25, color: '#ffe1ec', marginTop: 18 }}>콘서트 · 내한 · 티켓팅 · 페스티벌 · 컴백</span>
          <span style={{ fontSize: 22, color: '#ffd0e0', marginTop: 8 }}>매일 업데이트되는 국내외 공연 일정</span>
        </div>

        {/* 오른쪽 미니 캘린더 카드 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: 340,
            backgroundColor: '#ffffff',
            borderRadius: 24,
            padding: '20px 22px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: 14 }}>
            <span style={{ fontSize: 30, fontWeight: 700, color: '#111827' }}>JUL</span>
            <span style={{ fontSize: 18, color: '#9ca3af', marginLeft: 8 }}>2026</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', width: '100%' }}>
            {cells.map((c, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: '14.28%',
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 34,
                    height: 34,
                    borderRadius: 17,
                    fontSize: 19,
                    fontWeight: 700,
                    color: c.today ? '#ffffff' : '#111827',
                    backgroundColor: c.today ? '#ff3d78' : 'transparent',
                  }}
                >
                  {c.d}
                </div>
                <div style={{ display: 'flex', height: 8, marginTop: 2 }}>
                  {c.dot && (
                    <span
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: 4,
                        backgroundColor: c.dot === 'p' ? PREREG : RELEASE,
                      }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      width: 1024,
      height: 500,
      fonts: [{ name: 'Pretendard', data: PRETENDARD, weight: 700, style: 'normal' }],
    },
  );
}
