'use client';
import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import type { Game, Category } from '@/lib/types';
import { CATEGORY_META } from '@/lib/types';
import { calcDayDiff } from '@/lib/utils';
import { useLocale } from '@/hooks/useLocale';
import { CAL, UI, type Locale } from '@/lib/i18nLabels';
import styles from './FeaturedCards.module.css';

interface Props { games: Game[]; now: Date; }

// 카드 표시용 정규화 데이터 — "티켓 스텁" 카드(본문 + D-day 스텁)에 필요한 것만.
interface CardData {
  key: string;
  href: string;
  badge: string;
  badgeColor: string;
  badgeTextColor: string;
  name: string;
  dateText: string;
  ddayText: string;
}

const CATS: Category[] = ['concert_tour', 'music_release', 'festival', 'fanmeeting'];

function shortDate(iso: string): string { const [, m, d] = iso.split('-'); return `${m}.${d}`; }
function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// 선예매·일반예매 중 하나라도 "지금" 진행 중인지(시작함·아직 안 끝남) — 오늘 날짜 문자열과 비교.
function isActiveTicketing(g: Game, today: string): boolean {
  const phases: Array<[boolean | undefined, string | null | undefined, string | null | undefined]> = [
    [g.presale, g.presale_datetime, g.presale_end_datetime],
    [g.general_sale, g.general_sale_datetime, g.general_sale_end_datetime],
  ];
  return phases.some(([flag, start, end]) => {
    if (!flag) return false;
    const startDate = start ? start.slice(0, 10) : null;
    const endDate = end ? end.slice(0, 10) : null;
    if (startDate && startDate > today) return false;
    if (endDate && endDate < today) return false;
    return true;
  });
}

// PageShell은 정적 생성이라 now가 빌드 시각(KST) 기준 — D-day는 그 시점 기준으로 계산되고
// 데이터 갱신 시 재배포로 신선도를 유지한다(GameRow 등 다른 카드와 동일한 전제).
function gameToCard(game: Game, isPreReg: boolean, lang: Locale | null, now: Date): CardData {
  const cat = CATEGORY_META[game.category];
  const tba = lang ? UI[lang].tba : '미정';
  const t = lang ? CAL[lang] : null;
  const ticketBadge = t ? (game.presale ? t.presaleTag : t.generalSaleTag) : (game.presale ? '선예매' : '일반예매');
  const diff = game.release_date_approx ? null : calcDayDiff(game.release_date, now);
  return {
    key: `game-${game.id}`,
    href: `/${lang ?? 'ko'}/concert/${game.id}`,
    badge: isPreReg ? ticketBadge : cat.short,
    badgeColor: isPreReg ? 'var(--accent-warm)' : cat.color,
    badgeTextColor: isPreReg ? 'var(--on-warm)' : '#fff',
    name: game.name,
    dateText: game.release_date_approx ? tba : shortDate(game.release_date),
    ddayText: diff == null ? tba : diff <= 0 ? 'D-DAY' : `D-${diff}`,
  };
}

function FeaturedCard({ data }: { data: CardData }) {
  return (
    <Link href={data.href} className={styles.card}>
      <div className={styles.main}>
        <span className={styles.badge} style={{ background: data.badgeColor, color: data.badgeTextColor }}>{data.badge}</span>
        <span className={styles.name}>{data.name}</span>
        <span className={styles.date}>{data.dateText}</span>
      </div>
      <div className={styles.stub} style={{ background: data.badgeColor, color: data.badgeTextColor } as CSSProperties}>
        <span className={styles.stubDday}>{data.ddayText}</span>
      </div>
    </Link>
  );
}

// 서브페이지 사이드바(PageShell 기본값) — 풀(사전예약 + 카테고리별 임박 1개씩)에서 최대 4장.
// 마운트 후 셔플은 SSR 결과와 달라서 진입 직후 카드가 눈에 띄게 바뀌는 깜빡임을 유발했던
// 원인이라 제거 — 항상 서버가 내려준 순서 그대로 렌더.
export function FeaturedCards({ games, now }: Props) {
  const lang = useLocale();
  const today = ymd(now);
  const notReleased = (g: Game) => g.release_date_approx || g.release_date >= today;

  // 티켓팅(선예매/일반예매) 진행 중인 게임 목록 → 진입 시 이 중 '랜덤 1개' 노출(고정 최신 아님)
  const preRegList = useMemo(() => games
    .filter(g => notReleased(g) && isActiveTicketing(g, today))
    .sort((a, b) => a.release_date.localeCompare(b.release_date)),
    [games, today]);

  // 진입 시 1회 랜덤(마운트 전엔 [0] → 서버/클라 동일, 하이드레이션 안전)
  const [preRegIdx, setPreRegIdx] = useState(0);
  useEffect(() => {
    if (preRegList.length === 0) return;
    setPreRegIdx(Math.floor(Math.random() * preRegList.length));
  }, [preRegList.length]);
  const preReg = preRegList.length > 0 ? preRegList[preRegIdx % preRegList.length] : undefined;

  // 카테고리별 '가장 임박한 출시' 1개씩 (상단 사전예약 카드와 중복 제외)
  const categoryItems = useMemo(() => CATS
    .map(c => games
      .filter(g => notReleased(g) && g.category === c && g.id !== preReg?.id)
      .sort((a, b) => a.release_date.localeCompare(b.release_date))[0])
    .filter((g): g is Game => Boolean(g))
    .map(g => gameToCard(g, false, lang, now)),
    [games, preReg?.id, today, lang, now]);

  const listPool = [
    ...(preReg ? [gameToCard(preReg, true, lang, now)] : []),
    ...categoryItems,
  ].slice(0, 4);

  if (listPool.length === 0) return null;

  return (
    <div className={styles.cards}>
      {listPool.map(c => <FeaturedCard key={c.key} data={c} />)}
    </div>
  );
}
