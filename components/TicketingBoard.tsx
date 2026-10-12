'use client';
import { useEffect, useMemo, useState, type CSSProperties, type MouseEvent } from 'react';
import type { Game } from '@/lib/types';
import { availableTicketingUrl, eventStatusOf, nextTicketOpening, dateInZone, CATEGORY_META } from '@/lib/types';
import { calcDayDiff, formatEventDateTimeShort, formatDateShort } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';
import { useLocale } from '@/hooks/useLocale';
import { CAL } from '@/lib/i18nLabels';
import styles from './TicketingBoard.module.css';

interface Props {
  games: Game[];
  now: Date;                      // Home의 '오늘'(KST 날짜) — 첫 렌더는 이것으로(하이드레이션 일치)
  onPick: (id: string) => void;
}

/** 다음 30일 안에 열리는 예매만 '곧 열리는'에 넣는다 — 몇 달 뒤 오픈은 아직 행동할 정보가 아니다 */
const SOON_DAYS = 30;
const MAX = 6;
/** '지금 예매 중'은 짧게 — 길면 '곧 열리는' 칸 옆이 크게 빈다. 전체는 티켓팅 페이지에 */
const MAX_ON_SALE = 4;

/**
 * 홈 맨 위 "곧 열리는 예매 / 지금 예매 중" (2026-10-13).
 *
 * 사람들이 이 사이트에 오는 이유는 "언제 예매가 열리나"인데, 홈은 공연일 캘린더가 주인공이었다.
 * 예매가 열리기 전의 공연(행동할 수 있는 정보)을 가장 먼저, 그다음 지금 살 수 있는 공연을 둔다.
 * 둘 다 비면 아무것도 그리지 않는다(빈 상자를 보여주지 않는다).
 */
export function TicketingBoard({ games, now, onPick }: Props) {
  const lang = useLocale();
  const t = lang ? CAL[lang] : null;
  // mount 후 실제 현재 시각 — "오늘 20시 오픈"이 지났는지까지 따진다. 첫 렌더는 now(서버와 동일)
  const [instant, setInstant] = useState<Date>(now);
  useEffect(() => { setInstant(new Date()); }, []);

  const { soon, onSale } = useMemo(() => {
    const limit = instant.getTime() + SOON_DAYS * 86400e3;
    const soon = games
      .map(g => ({ g, o: nextTicketOpening(g, instant) }))
      .filter((x): x is { g: Game; o: NonNullable<typeof x.o> } => !!x.o && new Date(x.o.at).getTime() <= limit)
      .sort((a, b) => new Date(a.o.at).getTime() - new Date(b.o.at).getTime())
      .slice(0, MAX);
    const soonIds = new Set(soon.map(x => x.g.id));
    const onSale = games
      .filter(g => !soonIds.has(g.id) && eventStatusOf(g) !== 'cancelled')
      .map(g => ({ g, buy: availableTicketingUrl(g, instant) }))
      .filter((x): x is { g: Game; buy: NonNullable<typeof x.buy> } => !!x.buy)
      .sort((a, b) => a.g.release_date.localeCompare(b.g.release_date))
      .slice(0, MAX_ON_SALE);
    return { soon, onSale };
  }, [games, instant]);

  if (!lang || !t || (soon.length === 0 && onSale.length === 0)) return null;

  const pick = (e: MouseEvent, id: string) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    onPick(id);
  };

  return (
    <section className={styles.board} aria-label={t.openingSoon}>
      <div className={styles.cols}>
        {soon.length > 0 && (
          <div className={styles.col}>
            <h2 className={styles.title}>{t.openingSoon}</h2>
            <ul className={styles.list}>
              {soon.map(({ g, o }) => {
                const tz = g.timezone || 'Asia/Seoul';
                const diff = calcDayDiff(dateInZone(o.at, tz), now);
                const dd = diff <= 0 ? t.ticketToday : t.ticketDday(`D-${diff}`);
                return (
                  <li key={g.id} className={styles.item} style={{ '--cat': CATEGORY_META[g.category].color } as CSSProperties}>
                    <a href={`/${lang}/concert/${g.id}`} className={styles.main} data-ev="board_click" data-source="board_soon" data-id={g.id} onClick={e => pick(e, g.id)}>
                      <span className={styles.top}>
                        <span className={`${styles.dday} ${diff <= 3 ? styles.ddayHot : ''}`}>{dd}</span>
                        <span className={styles.kind}>{o.kind === 'presale' ? t.presaleTag : t.generalSaleTag}</span>
                      </span>
                      <span className={styles.name}>{g.name}</span>
                      <span className={styles.when}>{formatEventDateTimeShort(o.at, tz, lang)}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        {onSale.length > 0 && (
          <div className={styles.col}>
            <h2 className={styles.title}>{t.onSaleNow}</h2>
            <ul className={styles.list}>
              {onSale.map(({ g, buy }) => {
                const diff = g.release_date_approx ? null : calcDayDiff(g.release_date, now);
                return (
                  <li key={g.id} className={styles.item} style={{ '--cat': CATEGORY_META[g.category].color } as CSSProperties}>
                    <a href={`/${lang}/concert/${g.id}`} className={styles.main} data-ev="board_click" data-source="board_onsale" data-id={g.id} onClick={e => pick(e, g.id)}>
                      <span className={styles.top}>
                        <span className={styles.ddaySoft}>
                          {diff == null ? formatDateShort(g.release_date, lang) : t.showDday(diff <= 0 ? 'D-DAY' : `D-${diff}`)}
                        </span>
                      </span>
                      <span className={styles.name}>{g.name}</span>
                      {g.platforms?.[0] && <span className={styles.when}>{g.platforms[0]}</span>}
                    </a>
                    {/* 상세 링크 안에 넣으면 중첩 링크 — 형제로 둔다 */}
                    <a
                      className={styles.buy}
                      href={buy.url}
                      target="_blank"
                      rel="noopener"
                      onClick={() => trackEvent('ticketing_click', { game_id: g.id, source: 'home_board' })}
                    >
                      {t.buyTicket}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
      <a className={styles.more} href={`/${lang}/ticketing`} data-ev="board_click" data-source="board_more">{t.seeAllTicketing} →</a>
    </section>
  );
}
