'use client';
import { useEffect, useRef, useState } from 'react';
import type { Game } from '@/lib/types';
import { CATEGORY_META } from '@/lib/types';
import styles from './RelatedEventCard.module.css';

interface Props { game: Game; lang: string; dateText: string; }

// 사이드바용 소형 이벤트 카드 — 같은 아티스트/공연장의 다른 일정에 사용(카운트다운 없음, FeaturedCard보다 가벼움).
export function RelatedEventCard({ game, lang, dateText }: Props) {
  const [imgError, setImgError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setImgError(true);
  }, [game.image_url]);
  const cat = CATEGORY_META[game.category];
  const showImg = !!game.image_url && !imgError;

  return (
    <a href={`/${lang}/concert/${game.id}`} className={styles.card}>
      <div className={styles.thumb}>
        {showImg ? (
          <>
            <img src={game.image_url!} alt="" aria-hidden="true" className={styles.thumbBg} loading="lazy" />
            <img ref={imgRef} src={game.image_url!} alt="" className={styles.thumbFg} loading="lazy" onError={() => setImgError(true)} />
          </>
        ) : (
          <div className={styles.thumbPh} style={{ background: cat.color }} aria-hidden="true" />
        )}
      </div>
      <div className={styles.info}>
        <span className={styles.badge} style={{ background: cat.color }}>{cat.short}</span>
        <span className={styles.name}>{game.name}</span>
        <span className={styles.date}>{dateText}</span>
      </div>
    </a>
  );
}
