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
      {/* h2 — 본문은 h1 다음 h2 없이 바로 이 제목이 와서 h3면 제목 순서가 건너뛴다(axe heading-order) */}
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.list}>{children}</div>
      {moreHref && (
        <a href={moreHref} className={styles.more}>{moreLabel} →</a>
      )}
    </section>
  );
}
