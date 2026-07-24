import type { CSSProperties } from 'react';
import styles from './PageHeader.module.css';

interface Props {
  icon: string;          // SVG 스프라이트 id (예: 'ic-star')
  title: string;
  subtitle: string;
  count?: number;        // 이 페이지의 항목 수(모노 카운트 칩)
  countLabel?: string;   // 카운트 단위(로케일별, 예: '아티스트' / 'stories')
  accent?: string;       // 아이콘 타일 색 (기본 브랜드 accent)
}

// 인덱스 페이지 공용 헤더 — 컬러 아이콘 타일 + 제목 + 모노 카운트 + 설명 + 그라데이션 언더라인.
// news/artist/blog/venue/wishlist가 공유해 통일감을 준다.
export function PageHeader({ icon, title, subtitle, count, countLabel, accent }: Props) {
  return (
    <header className={styles.header}>
      <div className={styles.top}>
        <span
          className={styles.iconTile}
          style={accent ? ({ '--tile': accent } as CSSProperties) : undefined}
          aria-hidden="true"
        >
          <svg className="ic"><use href={`#${icon}`} /></svg>
        </span>
        <h1 className={styles.title}>{title}</h1>
        {count != null && (
          <span className={styles.count}>
            <span className={styles.countNum}>{count}</span>
            {countLabel && <span className={styles.countLabel}>{countLabel}</span>}
          </span>
        )}
      </div>
      <p className={styles.subtitle}>{subtitle}</p>
    </header>
  );
}
