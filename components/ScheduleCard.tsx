'use client';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { motion } from 'motion/react';
import type { Game } from '@/lib/types';
import { CATEGORY_META } from '@/lib/types';
import { formatShortDate, formatEventDateTime } from '@/lib/utils';
import { useLocale } from '@/hooks/useLocale';
import { CAL, CATEGORY_LABELS } from '@/lib/i18nLabels';
import styles from './ScheduleCard.module.css';

export type ScheduleKind = 'release' | 'presale' | 'presale_end' | 'general_sale' | 'general_sale_end';

interface Props {
  game: Game;
  kind: ScheduleKind;
  onPick: (id: string) => void;
}

// 캘린더 옆 "오늘의 일정" 패널 카드 — 아이콘+제목, 일시, 아티스트, (선예매/일반예매면) 예매 CTA.
export function ScheduleCard({ game, kind, onPick }: Props) {
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

  return (
    <motion.div
      className={styles.card}
      role="button"
      tabIndex={0}
      onClick={() => onPick(game.id)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPick(game.id); } }}
      whileHover={{ y: -4, transition: { type: 'spring', stiffness: 400, damping: 22 } }}
      whileTap={{ scale: 0.97 }}
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
      {ctaUrl && ctaLabel && (
        <a
          className={styles.cta}
          href={ctaUrl}
          target="_blank"
          rel="noopener"
          onClick={(e) => e.stopPropagation()}
        >
          {ctaLabel}
        </a>
      )}
    </motion.div>
  );
}
