'use client';
import type { Game, FilterKey } from '@/lib/types';
import { isTicketingLiveNow } from '@/lib/types';
import { GameRow } from './GameRow';
import { CategoryFilterBar } from './CategoryFilterBar';
import { RequestShowButton } from './RequestShowButton';
import { useLocale } from '@/hooks/useLocale';
import { CAL } from '@/lib/i18nLabels';
import styles from './ListView.module.css';

interface Props {
  games: Game[];
  wishlist: { has: (id: string) => boolean; toggle: (id: string) => void; ids: Set<string> };
  onPick: (id: string) => void;
  now: Date;
  category: FilterKey | null;
  onCategory: (c: FilterKey | null) => void;
  query?: string;              // 검색어 — 0건일 때 '이 공연 알려 주세요'에 쓴다
}

// 검색 결과 리스트 — Home에서 검색어가 있을 때만 렌더된다(월 탐색 없이, 매칭된 전체를 날짜순으로).
export function ListView({ games, wishlist, onPick, now, category, onCategory, query }: Props) {
  const lang = useLocale();
  const t = lang ? CAL[lang] : null;

  const items = [...games].sort((a, b) => a.release_date.localeCompare(b.release_date));

  return (
    <div className={styles.listView}>
      <div className={styles.resultBar}>
        <p className={styles.resultCount}>{t ? t.totalItems(items.length) : `총 ${items.length}개`}</p>
        <CategoryFilterBar category={category} onCategory={onCategory} className={styles.catRow} />
      </div>

      {items.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon} aria-hidden="true"><svg className="ic"><use href="#ic-calendar" /></svg></div>
          <p className={styles.emptyText}>{t ? t.noSearchResults : '검색 결과가 없어요.'}</p>
          {query && <RequestShowButton query={query} />}
        </div>
      ) : (
        <ul className={styles.rows}>
          {items.map(g => (
            <GameRow
              key={g.id}
              game={g}
              now={now}
              wishlist={wishlist}
              onPick={onPick}
              preBadge={isTicketingLiveNow(g, now) ? (t ? t.onSaleNowBadge : '예매중') : undefined}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
