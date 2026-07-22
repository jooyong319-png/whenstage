import styles from './RelatedArticleCard.module.css';

interface Props { href: string; title: string; dateText: string; }

// 사이드바용 관련 아티클/뉴스 카드 — 이미지 없이 날짜+제목만(블로그·뉴스 상세 사이드바에서 사용).
export function RelatedArticleCard({ href, title, dateText }: Props) {
  return (
    <a href={href} className={styles.card}>
      <span className={styles.date}>{dateText}</span>
      <span className={styles.title}>{title}</span>
    </a>
  );
}
