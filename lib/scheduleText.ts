// 티켓팅·월별 페이지 문구 (ko/en/ja) — lib/schedule.ts의 페이지들이 쓴다.
// 사이트 공용 라벨(i18nLabels.ts)에 넣지 않은 건 이 두 페이지에서만 쓰는 문장이 대부분이라서다.
import type { GameLocale } from './games';

export interface ScheduleText {
  unit: (n: number) => string;                          // '59건' / '59件' / '59 shows'
  monthTitle: (label: string) => string;                // h1
  monthMetaTitle: (label: string, n: number) => string;
  monthLead: (summary: string, n: number) => string;
  monthDescribe: (label: string, n: number, busiest?: string, venue?: string, korea?: number) => string;
  backToConcerts: string;
  busiest: string;
  topVenues: string;
  countries: string;
  monthTickets: string;
  monthTicketsText: (n: number) => string;
  seeTicketing: string;
  otherMonths: string;
  ticketingTitle: string;                               // h1·메타 제목
  ticketingMetaTitle: string;
  ticketingLead: string;
  ticketingDescribe: (n: number, nearest?: string) => string;
  upcomingOpenings: string;
  upcomingText: (n: number, presale: number) => string;
  nearest: string;
  monthly: string;
  monthShort: (month: number) => string;
  asOf: (date: string) => string;
  noOpenings: string;
  buy: string;
  showOn: (date: string) => string;
  backToCalendar: string;
  footerTicketing: string;
  footerMonthly: string;
}

export const SCHEDULE_TEXT: Record<GameLocale, ScheduleText> = {
  ko: {
    unit: n => `${n}건`,
    monthTitle: l => `${l} 콘서트·공연 일정`,
    monthMetaTitle: (l, n) => `${l} 콘서트·공연 일정 (${n}건)`,
    monthLead: (s, n) => `${s} — 총 ${n}건`,
    monthDescribe: (l, n, busiest, venue) =>
      [`${l} 국내 콘서트·내한 공연·페스티벌·팬미팅 일정 ${n}건.`,
        busiest ? `가장 많은 날은 ${busiest}.` : '',
        venue ? `${venue}.` : '',
        '날짜·공연장·예매 일정을 한 페이지에.'].filter(Boolean).join(' '),
    backToConcerts: '← 전체 공연 일정',
    busiest: '공연이 몰린 날',
    topVenues: '공연이 많은 곳',
    countries: '나라별',
    monthTickets: '이 달 티켓 오픈',
    monthTicketsText: n => `선예매·일반예매 ${n}건`,
    seeTicketing: '티켓팅 일정 보기',
    otherMonths: '다른 달',
    ticketingTitle: '티켓팅 일정',
    ticketingMetaTitle: '티켓팅 일정 — 선예매·일반예매 오픈 시간 모음',
    ticketingLead: '선예매·일반예매가 열리는 시각을 시간순으로 모았습니다. 시각은 모두 한국 시간입니다.',
    ticketingDescribe: (n, nearest) =>
      `콘서트·내한 공연 선예매·일반예매 오픈 시간 ${n}건을 시각순으로 정리.` +
      (nearest ? ` 가장 가까운 오픈은 ${nearest}.` : '') + ' 예매처 바로가기 포함.',
    upcomingOpenings: '앞으로 열리는 예매',
    upcomingText: (n, p) => `${n}건 (선예매 ${p} · 일반예매 ${n - p})`,
    nearest: '가장 가까운 오픈',
    monthly: '월별 공연 일정',
    monthShort: m => `${m}월`,
    asOf: d => `${d} 기준 · 예매 시각은 주최 측 사정으로 바뀔 수 있으니 예매처 공지를 함께 확인하세요.`,
    noOpenings: '지금 예정된 티켓 오픈이 없습니다.',
    buy: '예매처 바로가기 →',
    showOn: d => `공연 ${d}`,
    backToCalendar: '← 캘린더',
    footerTicketing: '티켓팅 일정',
    footerMonthly: '월별 공연 일정',
  },
  ja: {
    unit: n => `${n}件`,
    monthTitle: l => `${l}のライブ・コンサート日程`,
    monthMetaTitle: (l, n) => `${l}のライブ・コンサート日程（${n}件）`,
    monthLead: (s, n) => `${s} — 全${n}件`,
    monthDescribe: (l, n, busiest, venue) =>
      [`${l}の国内ライブ・コンサート・フェス・ファンミーティング日程${n}件。`,
        busiest ? `最も多い日は${busiest}。` : '',
        venue ? `${venue}。` : '',
        '日付・会場・チケット発売日を一覧で。'].filter(Boolean).join(''),
    backToConcerts: '← 公演日程一覧',
    busiest: '公演が集中する日',
    topVenues: '公演の多い会場',
    countries: '国別',
    monthTickets: '今月のチケット発売',
    monthTicketsText: n => `先行・一般発売 ${n}件`,
    seeTicketing: 'チケット発売日程を見る',
    otherMonths: 'ほかの月',
    ticketingTitle: 'チケット発売日程',
    ticketingMetaTitle: 'チケット発売日程 — 先行・一般発売の開始時刻まとめ',
    ticketingLead: '先行受付・一般発売が始まる時刻を時間順にまとめました。時刻はすべて日本時間です。',
    ticketingDescribe: (n, nearest) =>
      `ライブ・コンサートの先行受付・一般発売の開始時刻${n}件を時間順にまとめ。` +
      (nearest ? `直近は${nearest}。` : '') + 'プレイガイドへのリンク付き。',
    upcomingOpenings: 'これから始まる発売',
    upcomingText: (n, p) => `${n}件（先行 ${p}・一般 ${n - p}）`,
    nearest: '直近の発売',
    monthly: '月別の公演日程',
    monthShort: m => `${m}月`,
    asOf: d => `${d}時点 · 発売時刻は主催者の都合で変わることがあります。プレイガイドの告知もご確認ください。`,
    noOpenings: '現在予定されているチケット発売はありません。',
    buy: 'プレイガイドへ →',
    showOn: d => `公演 ${d}`,
    backToCalendar: '← カレンダー',
    footerTicketing: 'チケット発売日程',
    footerMonthly: '月別の公演日程',
  },
  en: {
    unit: n => `${n} show${n === 1 ? '' : 's'}`,
    monthTitle: l => `${l} Concert & Tour Schedule`,
    monthMetaTitle: (l, n) => `${l} Concert & Tour Schedule (${n} shows)`,
    monthLead: (s, n) => `${s} — ${n} in total`,
    monthDescribe: (l, n, busiest, venue, korea) =>
      [`${n} concerts, tours, festivals and fan meetings in ${l}` + (korea ? `, including ${korea} in South Korea.` : '.'),
        busiest ? `Busiest day: ${busiest}.` : '',
        venue ? `${venue}.` : '',
        'Dates, venues and ticket sale times on one page.'].filter(Boolean).join(' '),
    backToConcerts: '← All concerts',
    busiest: 'Busiest days',
    topVenues: 'Busiest venues',
    countries: 'By country',
    monthTickets: 'Ticket sales this month',
    monthTicketsText: n => `${n} presale & general sale openings`,
    seeTicketing: 'See ticket sale schedule',
    otherMonths: 'Other months',
    ticketingTitle: 'Ticket Sale Schedule',
    ticketingMetaTitle: 'Ticket Sale Schedule — Presale & General Sale Times',
    ticketingLead: 'Presale and general sale start times, in order. Each time is in the local time of the show.',
    ticketingDescribe: (n, nearest) =>
      `${n} upcoming concert presale and general sale start times, in order.` +
      (nearest ? ` Next up: ${nearest}.` : '') + ' With links to the ticket sites.',
    upcomingOpenings: 'Upcoming sales',
    upcomingText: (n, p) => `${n} (presale ${p} · general ${n - p})`,
    nearest: 'Next sale',
    monthly: 'Concerts by month',
    monthShort: m => EN_MONTH_FULL[m - 1],
    asOf: d => `As of ${d} · Sale times can change — always check the ticket site's notice.`,
    noOpenings: 'No ticket sales are scheduled right now.',
    buy: 'Go to ticket site →',
    showOn: d => `Show ${d}`,
    backToCalendar: '← Calendar',
    footerTicketing: 'Ticket sales',
    footerMonthly: 'Concerts by month',
  },
};

const EN_MONTH_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** 'KR' → '한국' / '韓国' / 'South Korea' */
export function countryName(code: string, lang: GameLocale): string {
  if (lang === 'en' && code === 'KR') return 'South Korea';
  try {
    return new Intl.DisplayNames([lang], { type: 'region' }).of(code) ?? code;
  } catch {
    return code;
  }
}
