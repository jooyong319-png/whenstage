'use client';
import { type CSSProperties } from 'react';
import { motion } from 'motion/react';
import type { Game } from '@/lib/types';
import { CATEGORY_META } from '@/lib/types';
import { calcDayDiff, formatShortDate } from '@/lib/utils';
import { useLocale } from '@/hooks/useLocale';
import { CAL, UI } from '@/lib/i18nLabels';
import styles from './UpcomingStrip.module.css';

interface Props {
  games: Game[];               // 이미 정렬/필터된 다가오는 일정
  cardImages: Record<string, string>;
  now: Date;
  onPick: (id: string) => void;
}

// 홈 캘린더 아래 "다가오는 일정" 이미지 스트립 — 캘린더 중심 홈의 빈 공간을 이미지 카드로 채워
// 밀도·에너지를 올린다(아티스트 그리드와 같은 시각 언어). 이미지 없으면 카테고리색 그라데이션 폴백.
export function UpcomingStrip({ games, cardImages, now, onPick }: Props) {
  const lang = useLocale();
  const t = lang ? CAL[lang] : null;
  const ui = lang ? UI[lang] : null;
  if (games.length === 0) return null;

  const title = lang === 'en' ? 'Upcoming' : lang === 'ja' ? '近日の予定' : '다가오는 일정';

  return (
    <section className={styles.section} aria-label={title}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.grid}>
        {games.map((g, i) => {
          const cat = CATEGORY_META[g.category];
          const img = cardImages[g.id];
          const diff = g.release_date_approx ? null : calcDayDiff(g.release_date, now);
          const dday = diff == null ? (ui ? ui.tba : '미정') : diff <= 0 ? 'D-DAY' : `D-${diff}`;
          const dateText = g.release_date_approx ? (ui ? ui.tba : '미정') : formatShortDate(g.release_date);
          return (
            <motion.button
              type="button"
              key={g.id}
              className={styles.card}
              style={{ '--cat': cat.color } as CSSProperties}
              onClick={() => onPick(g.id)}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.35, ease: 'easeOut', delay: Math.min(i * 0.04, 0.4) }}
              whileHover={{ y: -5, transition: { type: 'spring', stiffness: 400, damping: 22 } }}
              whileTap={{ scale: 0.97 }}
            >
              <div className={styles.thumb}>
                {img ? (
                  <>
                    <img src={img} alt="" aria-hidden="true" className={styles.thumbBg} loading="lazy" />
                    <img src={img} alt={g.name} className={styles.thumbFg} loading="lazy" />
                  </>
                ) : (
                  <div className={styles.thumbPh} aria-hidden="true">
                    <svg className="ic"><use href={`#${cat.icon}`} /></svg>
                  </div>
                )}
                <span className={styles.dday}>{dday}</span>
              </div>
              <div className={styles.body}>
                <span className={styles.badge} style={{ background: cat.color }}>{cat.short}</span>
                <span className={styles.name}>{g.name}</span>
                <span className={styles.date}>{dateText}</span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
