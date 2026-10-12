// server-only — ☰ 메뉴에 띄울 숫자(레이아웃에서 계산해 헤더로 넘긴다)
import { getUpcomingTicketOpenings, getMonthPages, todayKst } from './schedule';
import type { GameLocale } from './games';

export interface MenuData {
  ticketCount: number;          // 앞으로 열릴 예매 건수 — "들어가 볼 이유"
  monthYm: string | null;       // 이번 달 월별 페이지가 있으면 'YYYY-MM'
}

// 레이아웃은 페이지마다(2천여 장) 렌더된다. 같은 빌드 안에서는 값이 같으니 언어별로 한 번만 계산한다.
const cache = new Map<GameLocale, Promise<MenuData>>();

export function getMenuData(lang: GameLocale): Promise<MenuData> {
  let p = cache.get(lang);
  if (!p) {
    p = (async () => {
      const [openings, months] = await Promise.all([getUpcomingTicketOpenings(lang), getMonthPages(lang)]);
      const ym = todayKst().slice(0, 7);
      return { ticketCount: openings.length, monthYm: months.some(m => m.ym === ym) ? ym : null };
    })();
    cache.set(lang, p);
  }
  return p;
}
