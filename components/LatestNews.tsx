'use client';
import { motion } from 'motion/react';
import { useLocale } from '@/hooks/useLocale';
import { formatShortDate } from '@/lib/utils';
import styles from './LatestNews.module.css';

export interface LatestNewsItem {
  slug: string;
  title: string;
  description: string;
  date: string;
  heroImage: string | null;
}

interface Props {
  items: LatestNewsItem[];
}

// 홈 하단 "최신 소식" — 캘린더/스트립 아래 빈 공간을 매일 갱신되는 뉴스 카드로 채운다.
// 크로스링크(체류시간·SEO)와 "살아있는 사이트" 인상을 동시에. 2건 미만이면 렌더 안 함.
export function LatestNews({ items }: Props) {
  const lang = useLocale();
  if (!lang || items.length < 2) return null;

  const title = lang === 'en' ? 'Latest news' : lang === 'ja' ? '最新ニュース' : '최신 소식';
  const more = lang === 'en' ? 'View all' : lang === 'ja' ? 'すべて見る' : '전체 보기';

  return (
    <section className={styles.section} aria-label={title}>
      <div className={styles.head}>
        <h2 className={styles.title}>{title}</h2>
        <a href={`/${lang}/news`} className={styles.more}>
          {more}
          <svg className="ic" aria-hidden="true"><use href="#ic-arrow-ur" /></svg>
        </a>
      </div>
      <div className={styles.grid}>
        {items.map((n, i) => (
          <motion.a
            key={n.slug}
            href={`/${lang}/news/${n.slug}`}
            className={styles.card}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.35, ease: 'easeOut', delay: Math.min(i * 0.05, 0.3) }}
          >
            {/* 이미지 없는 글에 16:9 빈 자리를 두면 모바일에서 카드 하나가 화면 절반을 먹는다
                (주간 브리핑은 전부 이미지 없음) — 없으면 자리 자체를 안 만든다 */}
            {n.heroImage && (
              <div className={styles.thumb}>
                <img src={n.heroImage} alt="" aria-hidden="true" className={styles.thumbBg} loading="lazy" />
                <img src={n.heroImage} alt={n.title} className={styles.thumbFg} loading="lazy" />
              </div>
            )}
            <div className={styles.body}>
              <span className={styles.date}>{formatShortDate(n.date)}</span>
              <span className={styles.cardTitle}>{n.title}</span>
              <span className={styles.desc}>{n.description}</span>
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
}
