import { ImageResponse } from 'next/og';
import { readFileSync } from 'fs';
import path from 'path';
import { getAllGames } from '@/lib/games';

// 폰트를 명시적으로 로드(모듈 스코프 1회) — next/og 기본폰트 URL 로더의 Windows 버그 우회 + 배포 안정.
const NOTO = readFileSync(path.join(process.cwd(), 'assets/fonts/noto-sans-latin.ttf'));

// 홈 위젯용 월간 캘린더 이미지(PNG). 출시일=초록 점, 사전예약(시작/마감)=주황 점, 오늘=강조 링.
// 한글 폰트 없이 렌더하려고 그리드는 숫자/요일 약자만 사용(게임명은 표시 안 함).
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// KST(UTC+9) 기준 오늘
function kstNow(): Date {
  return new Date(Date.now() + 9 * 3600 * 1000);
}
function ymd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const theme = url.searchParams.get('theme') === 'dark' ? 'dark' : 'light';

  const now = kstNow();
  const monthParam = url.searchParams.get('month'); // 'YYYY-MM'
  let year = now.getUTCFullYear();
  let month0 = now.getUTCMonth(); // 0-based
  if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
    year = parseInt(monthParam.slice(0, 4), 10);
    month0 = parseInt(monthParam.slice(5, 7), 10) - 1;
  }

  const todayStr = ymd(now);
  const monthPrefix = `${year}-${String(month0 + 1).padStart(2, '0')}`;

  // 이 달의 날짜별 마커 수집
  const releaseDays = new Set<number>();   // 출시(approx 제외)
  const preRegDays = new Set<number>();    // 사전예약 시작/마감
  try {
    const games = await getAllGames();
    for (const g of games) {
      if (!g.release_date_approx && g.release_date?.startsWith(monthPrefix)) {
        releaseDays.add(parseInt(g.release_date.slice(8, 10), 10));
      }
      for (const dt of [g.presale_datetime, g.presale_end_datetime, g.general_sale_datetime, g.general_sale_end_datetime]) {
        const d = dt ? dt.slice(0, 10) : null;
        if (d && d.startsWith(monthPrefix)) preRegDays.add(parseInt(d.slice(8, 10), 10));
      }
    }
  } catch {
    // 데이터 로드 실패 시 빈 달력
  }

  // 달력 셀 구성
  const firstDow = new Date(Date.UTC(year, month0, 1)).getUTCDay(); // 0=일
  const daysInMonth = new Date(Date.UTC(year, month0 + 1, 0)).getUTCDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  // 테마 색상
  const c = theme === 'dark'
    ? { bg: '#111827', fg: '#f3f4f6', sub: '#9ca3af', grid: '#1f2937', today: '#34d399', sun: '#f87171', sat: '#60a5fa' }
    : { bg: '#ffffff', fg: '#111827', sub: '#6b7280', grid: '#f3f4f6', today: '#059669', sun: '#dc2626', sat: '#2563eb' };
  const RELEASE = '#10b981';
  const PREREG = '#f59e0b';

  const WD = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const MONTHS_EN = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          backgroundColor: c.bg,
          padding: '28px 32px',
          fontFamily: 'Noto Sans',
        }}
      >
        {/* 헤더 */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <span style={{ fontSize: 44, fontWeight: 700, color: c.fg }}>{MONTHS_EN[month0]}</span>
            <span style={{ fontSize: 24, color: c.sub, marginLeft: 12 }}>{year}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', fontSize: 20, color: c.sub }}>
            <span style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: RELEASE, marginRight: 6 }} />
            <span style={{ marginRight: 16 }}>Release</span>
            <span style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: PREREG, marginRight: 6 }} />
            <span>Pre-reg</span>
          </div>
        </div>

        {/* 요일 */}
        <div style={{ display: 'flex' }}>
          {WD.map((w, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                width: '14.28%',
                justifyContent: 'center',
                fontSize: 22,
                fontWeight: 600,
                color: i === 0 ? c.sun : i === 6 ? c.sat : c.sub,
                paddingBottom: 8,
              }}
            >
              {w}
            </div>
          ))}
        </div>

        {/* 주 */}
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: 'flex', flex: 1 }}>
            {week.map((day, di) => {
              const dateStr = day ? `${monthPrefix}-${String(day).padStart(2, '0')}` : '';
              const isToday = dateStr === todayStr;
              const hasRel = day ? releaseDays.has(day) : false;
              const hasPre = day ? preRegDays.has(day) : false;
              return (
                <div
                  key={di}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: '14.28%',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      fontSize: 24,
                      color: !day ? 'transparent' : isToday ? '#ffffff' : di === 0 ? c.sun : di === 6 ? c.sat : c.fg,
                      backgroundColor: isToday ? c.today : 'transparent',
                      fontWeight: isToday ? 700 : 400,
                    }}
                  >
                    {day ?? ''}
                  </div>
                  {/* 마커 점 */}
                  <div style={{ display: 'flex', height: 10, marginTop: 3 }}>
                    {hasRel && <span style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: RELEASE, margin: '0 2px' }} />}
                    {hasPre && <span style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: PREREG, margin: '0 2px' }} />}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    ),
    {
      width: 600,
      height: 520,
      fonts: [{ name: 'Noto Sans', data: NOTO, weight: 400, style: 'normal' }],
      headers: {
        // 위젯이 주기적으로 새로 받도록 짧게 캐시(엣지 3h, stale 하루)
        'Cache-Control': 'public, max-age=0, s-maxage=10800, stale-while-revalidate=86400',
      },
    },
  );
}
