'use client';
import { useEffect, useRef, useState } from 'react';
import styles from './RelatedArtistCard.module.css';

interface Props { href: string; name: string; image: string | null; metaText: string; }

// 사이드바용 소형 아티스트 카드 — 아티스트 상세 페이지의 "인기 있는 다른 아티스트" 추천에 사용.
export function RelatedArtistCard({ href, name, image, metaText }: Props) {
  const [imgError, setImgError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setImgError(true);
  }, [image]);
  const showImg = !!image && !imgError;

  return (
    <a href={href} className={styles.card}>
      <div className={styles.avatar}>
        {showImg ? (
          <img ref={imgRef} src={image!} alt="" className={styles.img} loading="lazy" onError={() => setImgError(true)} />
        ) : (
          <div className={styles.placeholder} aria-hidden="true">{name.slice(0, 1)}</div>
        )}
      </div>
      <div className={styles.info}>
        <span className={styles.name}>{name}</span>
        <span className={styles.meta}>{metaText}</span>
      </div>
    </a>
  );
}
