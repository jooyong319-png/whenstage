import type { ReactNode } from 'react';
import styles from './SidebarSection.module.css';

interface Props {
  title: string;
  moreHref?: string;
  moreLabel?: string;
  children: ReactNode;
}

// 맥락형 사이드바 섹션 공용 래퍼 — 제목 + 카드 목록 + (선택)전체보기 링크.
export function SidebarSection({ title, moreHref, moreLabel, children }: Props) {
  return (
    <section className={styles.section}>
      <h3 className={styles.title}>{title}</h3>
      <div className={styles.list}>{children}</div>
      {moreHref && (
        <a href={moreHref} className={styles.more}>{moreLabel} →</a>
      )}
    </section>
  );
}
