'use client';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { motion } from 'motion/react';
import type { Game } from '@/lib/types';
import { CATEGORY_META, availableTicketingUrl } from '@/lib/types';
import { trackEvent } from '@/lib/analytics';
import { calcDayDiff, getKoreanWeekday } from '@/lib/utils';
import { useLocale } from '@/hooks/useLocale';
import { UI, CAL, CATEGORY_LABELS } from '@/lib/i18nLabels';
import styles from './GameRow.module.css';

interface Props {
  game: Game;
  now: Date;
  wishlist: { has: (id: string) => boolean; toggle: (id: string) => void };
  onPick: (id: string) => void;
  preBadge?: string; // '사전예약 시작' / '사전예약 마감' 등 (선택)
}

// 게임 1행 — 리스트 뷰 + 캘린더 상세 패널 공용. (날짜칼럼 + 본문 + 액션)
export function GameRow({ game: g, now, wishlist, onPick, preBadge }: Props) {
  const lang = useLocale();
  const ui = lang ? UI[lang] : null;
  const t = lang ? CAL[lang] : null;
  const [imgError, setImgError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  // 하이드레이션 전에 이미 로드 실패한 이미지는 onError가 안 잡히므로 마운트 시 직접 확인.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setImgError(true);
  }, [g.image_url]);
  const showImg = !!g.image_url && !imgError;
  const diff = calcDayDiff(g.release_date, now);
  const released = diff < 0;
  const isToday = diff === 0;
  const imminent = diff >= 0 && diff <= 7;
  const tba = ui ? ui.tba : '미정';
  const releasedText = t ? t.released : '출시됨';
  const dd = g.release_date_approx ? tba : released ? releasedText : isToday ? 'D-DAY' : `D-${diff}`;
  const cat = CATEGORY_META[g.category];
  const isWished = wishlist.has(g.id);
  // 지금 바로 예매 가능(상시판매 포함)하면 예매 버튼 노출 — 리스트/검색에서도 바로 예매처로.
  const buyCta = availableTicketingUrl(g, now);
  const mmdd = g.release_date_approx ? tba : g.release_date.slice(5).replace('-', '/');
  const weekdayName = lang ? t!.weekdays[new Date(g.release_date).getDay()] : getKoreanWeekday(g.release_date);
  const weekday = g.release_date_approx ? '' : `(${weekdayName})`;
  const tags = [...(g.genres ?? []), ...(g.platforms ?? [])].slice(0, 4);
  const displayName = g.name;
  const displayDesc = g.description;

  return (
    <motion.li
      className={`${styles.row} ${imminent ? styles.rowImminent : ''} ${released ? styles.rowReleased : ''}`}
      style={{ '--cat': cat.color } as CSSProperties}
      whileHover={{ y: -3, transition: { type: 'spring', stiffness: 400, damping: 24 } }}
      whileTap={{ scale: 0.985 }}
    >
      {/* 행 전체 클릭 → 상세 모달. 오버레이로 분리해 액션(출처/찜/예매) 링크와 중첩 안 되게(nested-interactive 방지).
          button이 아니라 상세 페이지를 가리키는 진짜 <a>인 이유: 목록이 전부 모달이면 /concert/[id]로
          가는 링크가 서버 HTML에 하나도 없어 크롤러가 상세 페이지를 고아로 취급한다(색인 누락).
          기본 클릭은 preventDefault로 막고 모달을 띄워 UX는 그대로, 새 탭/가운데 클릭은 정상 이동. */}
      <a
        href={`/${lang}/concert/${g.id}`}
        className={styles.rowOverlay}
        aria-label={displayName}
        onClick={(e) => {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // 새 탭/새 창은 브라우저에 맡김
          e.preventDefault();
          onPick(g.id);
        }}
      />
      <div className={styles.thumb}>
        {showImg ? (
          <>
            <img src={g.image_url!} alt="" aria-hidden="true" className={styles.thumbBg} loading="lazy" />
            <img
              ref={imgRef}
              src={g.image_url!}
              alt={displayName}
              className={styles.thumbFg}
              loading="lazy"
              onError={() => setImgError(true)}
            />
          </>
        ) : (
          <div className={styles.thumbPh}>
            <svg className={styles.thumbPhIcon} aria-hidden="true"><use href="#ic-image" /></svg>
            <span className={styles.thumbPhText}>{t ? t.noImage : '이미지 없음'}</span>
          </div>
        )}
      </div>

      <div className={styles.dateCol}>
        <span className={styles.dMmdd}>{mmdd}</span>
        {weekday && <span className={styles.dWeek}>{weekday}</span>}
        <span className={`${styles.dDday} ${isToday ? styles.ddayToday : imminent ? styles.ddaySoon : ''}`}>{dd}</span>
      </div>

      <div className={styles.main}>
        <div className={styles.titleRow}>
          <span className={styles.badge} style={{ background: cat.color }}>{lang ? CATEGORY_LABELS[lang][g.category] : cat.short}</span>
          <span className={styles.title}>{displayName}</span>
          {preBadge && <span className={styles.preBadge}>{preBadge}</span>}
        </div>
        {displayDesc && <p className={styles.desc}>{displayDesc}</p>}
        {tags.length > 0 && (
          <div className={styles.tags}>
            {tags.map(t => <span key={t} className={styles.tag}>{t}</span>)}
          </div>
        )}
      </div>

      <div className={styles.actions}>
        {buyCta && (
          <a
            className={`${styles.actBtn} ${styles.buyBtn}`}
            href={buyCta.url}
            target="_blank"
            rel="noopener"
            aria-label={t ? t.buyTicket : '예매하기'}
            onClick={(e) => { e.stopPropagation(); trackEvent('ticketing_click', { game_id: g.id, source: 'search_row' }); }}
          >
            <svg className="ic" aria-hidden="true"><use href="#ic-tag" /></svg>
            <span className={styles.actLabel}>{t ? t.buyTicket : '예매하기'}</span>
          </a>
        )}
        {g.source_url && (
          <a
            className={styles.actBtn}
            href={g.source_url}
            target="_blank"
            rel="noopener"
            aria-label={t ? t.official : '공식 출처'}
            onClick={(e) => e.stopPropagation()}
          >
            <svg className="ic" aria-hidden="true"><use href="#ic-arrow-ur" /></svg>
            <span className={styles.actLabel}>{ui ? ui.source : '출처'}</span>
          </a>
        )}
        <button
          type="button"
          className={`${styles.actBtn} ${isWished ? styles.wishOn : ''}`}
          onClick={(e) => { e.stopPropagation(); wishlist.toggle(g.id); }}
          aria-pressed={isWished}
          aria-label={t ? (isWished ? t.removeFromWishlist : t.addToWishlist) : '찜'}
        >
          <svg className={`ic ${isWished ? 'ic-fill' : ''}`} aria-hidden="true"><use href="#ic-star" /></svg>
          <span className={styles.actLabel}>{t ? t.wishlist : '찜'}</span>
        </button>
      </div>
    </motion.li>
  );
}
