'use client';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import type { Game } from '@/lib/types';
import { CATEGORY_META } from '@/lib/types';
import { calcDayDiff } from '@/lib/utils';
import { ShareButton } from './ShareButton';
import { TicketingPhase } from './TicketingPhase';
import { useSaleWindowEnded } from '@/hooks/useSaleWindowEnded';
import { effectivePresaleEnd } from '@/lib/types';
import { useLocale } from '@/hooks/useLocale';
import { UI, CAL, CATEGORY_LABELS } from '@/lib/i18nLabels';
import styles from './GameModal.module.css';

interface Props {
  game: Game;
  onClose: () => void;
  wishlist: { has: (id: string) => boolean; toggle: (id: string) => void };
}

export function GameModal({ game, onClose, wishlist }: Props) {
  const lang = useLocale();
  const ui = UI[lang];
  const t = CAL[lang];
  const presaleEnded = useSaleWindowEnded(effectivePresaleEnd(game));
  const generalSaleEnded = useSaleWindowEnded(game.general_sale_end_datetime);
  const [imgError, setImgError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  // 하이드레이션 전에 이미 로드 실패한 이미지는 onError가 안 잡히므로 마운트 시 직접 확인.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setImgError(true);
  }, [game.image_url]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const diff = calcDayDiff(game.release_date);
  const tba = ui ? ui.tba : '미정';
  const releasedText = t ? t.released : '출시됨';
  const dd = game.release_date_approx ? tba : diff < 0 ? releasedText : diff === 0 ? 'D-DAY' : `D-${diff}`;
  const cat = CATEGORY_META[game.category];
  const catLabel = lang ? CATEGORY_LABELS[lang][game.category] : cat.label;
  const intlLocale = lang === 'en' ? 'en-US' : lang === 'ja' ? 'ja-JP' : 'ko-KR';
  const dateStr = new Intl.DateTimeFormat(intlLocale, { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(game.release_date));
  const weekdayName = t!.weekdays[new Date(game.release_date).getDay()];
  const weekday = game.release_date_approx ? '' : ` (${weekdayName})`;
  const isWished = wishlist.has(game.id);
  const displayName = game.name;
  const displayDesc = game.description;

  return (
    <motion.div
      className={styles.overlay}
      onClick={onClose}
      role="presentation"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={e => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
      >
        <button type="button" className={styles.close} onClick={onClose} aria-label={t ? t.close : '닫기'}>×</button>

        <div className={styles.header}>
          <div className={`${styles.image} cat-bg-${game.category}`}>
            {game.image_url && !imgError ? (
              <>
                <img src={game.image_url} alt="" aria-hidden="true" className={styles.imageBg} loading="lazy" />
                <img ref={imgRef} src={game.image_url} alt={displayName} className={styles.imageFg} loading="lazy" onError={() => setImgError(true)} />
              </>
            ) : (
              <div className={styles.imagePh}>
                <svg className={styles.phIcon} aria-hidden="true"><use href="#ic-image" /></svg>
                <span className={styles.phText}>{t ? t.noImage : '이미지 없음'}</span>
              </div>
            )}
          </div>

          <div className={styles.headerInfo}>
            <span className={`category-tag cat-bg-${game.category}`}>{catLabel}</span>
            <h2 id="modal-title" className={styles.title}>{displayName}</h2>
          </div>
        </div>

        <div className={styles.row}>
          <strong>{ui ? ui.releaseDate : '출시일'}</strong>
          {game.release_date_approx
            ? <span className={styles.dday}>{tba}</span>
            : <>{dateStr}{weekday} · <span className={styles.dday}>{dd}</span></>}
        </div>
        {game.presale && (
          <TicketingPhase label={t.presaleTag} startDateTime={game.presale_datetime} endDateTime={effectivePresaleEnd(game)} timezone={game.timezone} />
        )}
        {game.general_sale && (
          <TicketingPhase label={t.generalSaleTag} startDateTime={game.general_sale_datetime} endDateTime={game.general_sale_end_datetime} timezone={game.timezone} />
        )}
        {game.platforms.length > 0 && <div className={styles.row}><strong>{ui ? ui.platforms : '플랫폼'}</strong>{game.platforms.join(', ')}</div>}
        {game.genres.length > 0 && <div className={styles.row}><strong>{ui ? ui.genres : '장르'}</strong>{game.genres.join(', ')}</div>}
        {game.developer && <div className={styles.row}><strong>{ui ? ui.developer : '개발'}</strong>{game.developer}</div>}
        {game.publisher && game.publisher !== game.developer && (
          <div className={styles.row}><strong>{ui ? ui.publisher : '퍼블리셔'}</strong>{game.publisher}</div>
        )}

        {game.festival_days && game.festival_days.length > 0 && (
          <div className={styles.festivalDays}>
            {game.festival_days.map(day => (
              <div key={day.date} className={styles.festivalDay}>
                <strong className={styles.festivalDayDate}>{day.date}</strong>
                <span className={styles.festivalDayLineup}>{day.lineup.join(', ')}</span>
              </div>
            ))}
          </div>
        )}

        {displayDesc && <p className={styles.desc}>{displayDesc}</p>}

        {game.source_url && (
          <a className={styles.source} href={game.source_url} target="_blank" rel="noopener">
            {t ? t.viewSource : '출처 보기'} <svg className="ic" aria-hidden="true"><use href="#ic-arrow-ur" /></svg>
          </a>
        )}

        {game.presale_url && (
          presaleEnded ? (
            <span className={`${styles.preRegCta} ${styles.preRegCtaClosed}`} aria-disabled="true">
              {t.presaleClosedLabel}
            </span>
          ) : (
            <a className={styles.preRegCta} href={game.presale_url} target="_blank" rel="noopener">
              {t.goToPresale} <svg className="ic" aria-hidden="true"><use href="#ic-arrow-ur" /></svg>
            </a>
          )
        )}
        {game.general_sale_url && (
          generalSaleEnded ? (
            <span className={`${styles.preRegCta} ${styles.preRegCtaClosed}`} aria-disabled="true">
              {t.generalSaleClosedLabel}
            </span>
          ) : (
            <a className={styles.preRegCta} href={game.general_sale_url} target="_blank" rel="noopener">
              {t.goToGeneralSale} <svg className="ic" aria-hidden="true"><use href="#ic-arrow-ur" /></svg>
            </a>
          )
        )}

        <div className={styles.actions}>
          <button
            type="button"
            className={`${styles.fav} ${isWished ? styles.favOn : ''}`}
            onClick={() => wishlist.toggle(game.id)}
            aria-pressed={isWished}
          >
            <svg className={`ic ${isWished ? 'ic-fill' : ''}`} aria-hidden="true"><use href="#ic-star" /></svg>
            {t ? (isWished ? t.favorited : t.favorite) : (isWished ? '즐겨찾기됨' : '즐겨찾기')}
          </button>
          <a className={styles.detail} href={`/${lang}/concert/${game.id}`} target="_blank" rel="noopener">
            <svg className="ic" aria-hidden="true"><use href="#ic-file" /></svg> {t ? t.fullPage : '전체 페이지'} <svg className="ic" aria-hidden="true"><use href="#ic-arrow-ur" /></svg>
          </a>
          <ShareButton url={`/${lang}/concert/${game.id}`} title={displayName} className={styles.share} />
        </div>
      </motion.div>
    </motion.div>
  );
}
