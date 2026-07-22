'use client';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import styles from './ArtistCard.module.css';

interface Props {
  href: string;
  name: string;
  image: string | null;
  catColor: string;
  upcomingLabel: string | null; // null이면 배지 없음(다가오는 일정 없음 → 카드도 흐리게)
  metaText: string;
}

// 아티스트 목록 카드 — 정사각 썸네일(블러 배경+원본 겹침) + "N개 예정" 배지.
// 다가오는 일정 없는 아티스트는 카드 전체를 살짝 흐리게 해 우선순위를 시각적으로 드러낸다.
export function ArtistCard({ href, name, image, catColor, upcomingLabel, metaText }: Props) {
  const [imgError, setImgError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setImgError(true);
  }, [image]);
  const showImg = !!image && !imgError;

  return (
    <motion.a
      href={href}
      className={`${styles.card} ${!upcomingLabel ? styles.noUpcoming : ''}`}
      whileHover={{ y: -5, transition: { type: 'spring', stiffness: 380, damping: 24 } }}
      whileTap={{ scale: 0.96 }}
    >
      <div className={styles.thumb}>
        {upcomingLabel && <span className={styles.badge} style={{ background: catColor }}>{upcomingLabel}</span>}
        {showImg ? (
          <>
            <img src={image!} alt="" aria-hidden="true" className={styles.thumbBg} loading="lazy" />
            <img
              ref={imgRef}
              src={image!}
              alt={name}
              className={styles.thumbFg}
              loading="lazy"
              onError={() => setImgError(true)}
            />
          </>
        ) : (
          <div className={styles.thumbPh} aria-hidden="true">{name.slice(0, 1)}</div>
        )}
      </div>
      <div className={styles.body}>
        <div className={styles.name}>{name}</div>
        <div className={styles.meta}>{metaText}</div>
      </div>
    </motion.a>
  );
}
