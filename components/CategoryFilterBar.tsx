'use client';
import type { CSSProperties } from 'react';
import type { Category, FilterKey } from '@/lib/types';
import { CATEGORY_META } from '@/lib/types';
import { useLocale } from '@/hooks/useLocale';
import { CAL, CATEGORY_LABELS } from '@/lib/i18nLabels';
import styles from './CategoryFilterBar.module.css';

interface Props {
  category: FilterKey | null;
  onCategory: (c: FilterKey | null) => void;
  className?: string;
}

const CATS: Category[] = ['concert_tour', 'music_release', 'festival', 'fanmeeting'];
const CAT_ICON: Record<Category, string> = {
  concert_tour: 'ic-star',
  music_release: 'ic-flame',
  festival: 'ic-globe',
  fanmeeting: 'ic-comment',
};

// 카테고리 아이콘 필터 줄 — 리스트·캘린더 공용. filters.category(전역) 단일 출처를 토글.
export function CategoryFilterBar({ category, onCategory, className }: Props) {
  const lang = useLocale();
  const t = lang ? CAL[lang] : null;

  return (
    <div className={`${styles.bar} ${className ?? ''}`} role="group" aria-label={t ? t.categoryFilter : '카테고리 필터'}>
      <button
        type="button"
        className={`${styles.item} ${category === null ? styles.active : ''}`}
        aria-pressed={category === null}
        onClick={() => onCategory(null)}
      >
        <span className={styles.icon}><svg className="ic" aria-hidden="true"><use href="#ic-grid" /></svg></span>
        <span className={styles.label}>{t ? t.all : '전체'}</span>
      </button>

      {CATS.map(c => (
        <button
          key={c}
          type="button"
          className={`${styles.item} ${category === c ? styles.active : ''}`}
          style={{ '--cat': CATEGORY_META[c].color } as CSSProperties}
          aria-pressed={category === c}
          onClick={() => onCategory(category === c ? null : c)}
        >
          <span className={styles.icon}><svg className="ic" aria-hidden="true"><use href={`#${CAT_ICON[c]}`} /></svg></span>
          <span className={styles.label}>{lang ? CATEGORY_LABELS[lang][c] : CATEGORY_META[c].short}</span>
        </button>
      ))}
    </div>
  );
}
