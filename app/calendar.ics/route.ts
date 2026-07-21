import { getUpcomingGames } from '@/lib/games';
import { CATEGORY_META } from '@/lib/types';

export const dynamic = 'force-static';
export const revalidate = 3600;

// ICS 텍스트 이스케이프 (쉼표/세미콜론/백슬래시/줄바꿈)
function esc(s: string): string {
  return (s || '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

export async function GET() {
  const games = (await getUpcomingGames()).filter(g => !g.release_date_approx);

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//whenstage//concert-calendar//KR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:콘서트 캘린더',
    'X-WR-CALDESC:콘서트·내한 공연, 음원 발매, 페스티벌, 팬미팅 일정 (whenstage.com)',
    'X-WR-TIMEZONE:Asia/Seoul',
    'REFRESH-INTERVAL;VALUE=DURATION:PT12H',
  ];

  for (const g of games) {
    const date = g.release_date.replace(/-/g, ''); // YYYYMMDD
    const cat = CATEGORY_META[g.category]?.label ?? '';
    const desc = `${cat ? `[${cat}] ` : ''}${g.description ?? ''}\nhttps://whenstage.com/ko/concert/${g.id}`;
    lines.push(
      'BEGIN:VEVENT',
      `UID:${g.id}@whenstage.com`,
      `DTSTAMP:${date}T000000Z`,
      `DTSTART;VALUE=DATE:${date}`,
      `SUMMARY:${esc(g.name)} 출시`,
      `DESCRIPTION:${esc(desc)}`,
      `URL:https://whenstage.com/ko/concert/${g.id}`,
      'TRANSP:TRANSPARENT',
      'END:VEVENT',
    );
  }

  lines.push('END:VCALENDAR');
  const body = lines.join('\r\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'inline; filename="whenstage.ics"',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
