'use client';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { motion } from 'motion/react';
import type { Game } from '@/lib/types';
import { CATEGORY_META, effectivePresaleEnd, availableTicketingUrl } from '@/lib/types';
import { trackEvent } from '@/lib/analytics';
import { formatShortDate, formatEventDateTime } from '@/lib/utils';
import { useLocale } from '@/hooks/useLocale';
import { CAL, CATEGORY_LABELS } from '@/lib/i18nLabels';
import { useSaleWindowEnded } from '@/hooks/useSaleWindowEnded';
import styles from './ScheduleCard.module.css';

export type ScheduleKind = 'release' | 'presale' | 'presale_end' | 'general_sale' | 'general_sale_end';

interface Props {
  game: Game;
  kind: ScheduleKind;
  onPick: (id: string) => void;
  now: Date;
}

// 캘린더 옆 "오늘의 일정" 패널 카드 — 아이콘+제목, 일시, 아티스트, (선예매/일반예매면) 예매 CTA.
export function ScheduleCard({ game, kind, onPick, now }: Props) {
  const lang = useLocale();
  const t = CAL[lang];
  const cat = CATEGORY_META[game.category];
  const [imgError, setImgError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  // 하이드레이션 전에 이미 로드 실패한 이미지는 onError가 안 잡히므로 마운트 시 직접 확인.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setImgError(true);
  }, [game.image_url]);
  const showImg = !!game.image_url && !imgError;

  const dateLabel = (() => {
    if (kind === 'release') {
      const weekday = t.weekdays[new Date(game.release_date).getDay()];
      const time = game.release_time ? ` ${game.release_time}` : '';
      return `${formatShortDate(game.release_date)} (${weekday})${time}`;
    }
    const iso =
      kind === 'presale' ? game.presale_datetime :
      kind === 'presale_end' ? game.presale_end_datetime :
      kind === 'general_sale' ? game.general_sale_datetime :
      game.general_sale_end_datetime;
    return iso ? formatEventDateTime(iso, game.timezone, lang) : '';
  })();

  const kindTag =
    kind === 'presale' ? t.presaleTag :
    kind === 'presale_end' ? `${t.presaleTag} ${t.deadlineTag}` :
    kind === 'general_sale' ? t.generalSaleTag :
    kind === 'general_sale_end' ? `${t.generalSaleTag} ${t.deadlineTag}` :
    null;

  const ctaUrl = kind === 'presale' ? game.presale_url : kind === 'general_sale' ? game.general_sale_url : null;
  const ctaLabel = kind === 'presale' ? t.goToPresale : kind === 'general_sale' ? t.goToGeneralSale : null;
  const ctaClosedLabel = kind === 'presale' ? t.presaleClosedLabel : kind === 'general_sale' ? t.generalSaleClosedLabel : null;
  const ctaEndDateTime = kind === 'presale' ? effectivePresaleEnd(game) : kind === 'general_sale' ? game.general_sale_end_datetime : null;
  const ctaEnded = useSaleWindowEnded(ctaEndDateTime);
  // 공연일(release) 카드용 — 지금 바로 예매 가능하면(상시판매 포함) "예매하기" 버튼. 예매 시작일
  // 카드(위 kind별 CTA)와 별개로, 시작 datetime이 없어 카드가 안 생기는 상시판매 링크를 노출.
  const buyCta = kind === 'release' ? availableTicketingUrl(game, now) : null;

  return (
    <motion.div
      className={styles.card}
      whileHover={{ y: -4, transition: { type: 'spring', stiffness: 400, damping: 22 } }}
      whileTap={{ scale: 0.97 }}
    >
      {/* 카드 클릭 영역을 분리 — 예매 링크(아래)와 중첩 안 되게(nested-interactive 방지).
          GameRow와 같은 이유로 button이 아닌 상세 페이지 <a>: 캘린더가 유일한 진입점인 공연이 많아
          여기가 링크가 아니면 해당 상세 페이지는 사이트맵에만 존재하는 고아 URL이 된다. */}
      <a
        href={`/${lang}/concert/${game.id}`}
        className={styles.cardMain}
        onClick={(e) => {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // 새 탭/새 창은 브라우저에 맡김
          e.preventDefault();
          onPick(game.id);
        }}
      >
      <div className={styles.head}>
        {showImg && (
          <div className={styles.thumb} style={{ '--cat': cat.color } as CSSProperties}>
            <img src={game.image_url!} alt="" aria-hidden="true" className={styles.thumbBg} loading="lazy" />
            <img
              ref={imgRef}
              src={game.image_url!}
              alt={game.name}
              className={styles.thumbFg}
              loading="lazy"
              onError={() => setImgError(true)}
            />
          </div>
        )}
        <div className={styles.headText}>
          <div className={styles.titleRow}>
            <span className={styles.icon} style={{ color: cat.color }}>
              <svg className="ic" aria-hidden="true"><use href={`#${cat.icon}`} /></svg>
            </span>
            <span className={styles.title}>{game.name}</span>
          </div>
        </div>
      </div>
      <div className={styles.meta}>
        {kindTag && <span className={styles.kindTag} style={{ background: cat.color }}>{kindTag}</span>}
        {dateLabel}
      </div>
      {game.developer && (
        <div className={styles.artist}>
          <span className={styles.artistBadge} style={{ background: cat.color }}>{lang ? CATEGORY_LABELS[lang][game.category] : cat.short}</span>
          {game.developer}
        </div>
      )}
      </a>
      {ctaUrl && ctaLabel && (
        ctaEnded ? (
          <span className={`${styles.cta} ${styles.ctaClosed}`} aria-disabled="true">
            {ctaClosedLabel}
          </span>
        ) : (
          <a
            className={styles.cta}
            href={ctaUrl}
            target="_blank"
            rel="noopener"
            onClick={(e) => { e.stopPropagation(); trackEvent('ticketing_click', { game_id: game.id, source: 'calendar_card' }); }}
          >
            {ctaLabel}
          </a>
        )
      )}
      {buyCta && (
        <a
          className={styles.cta}
          href={buyCta.url}
          target="_blank"
          rel="noopener"
          onClick={(e) => e.stopPropagation()}
        >
          {t.buyTicket}
        </a>
      )}
    </motion.div>
  );
}
