'use client';
import type { Game, CalEvent, FilterKey } from '@/lib/types';
import { GameRow } from './GameRow';
import { EventRow } from './EventRow';
import { CategoryFilterBar } from './CategoryFilterBar';
import { useLocale } from '@/hooks/useLocale';
import { CAL } from '@/lib/i18nLabels';
import styles from './ListView.module.css';

interface Props {
  games: Game[];
  events?: CalEvent[];
  wishlist: { has: (id: string) => boolean; toggle: (id: string) => void; ids: Set<string> };
  onPick: (id: string) => void;
  now: Date;
  category: FilterKey | null;
  onCategory: (c: FilterKey | null) => void;
}

// 검색 결과 리스트 — Home에서 검색어가 있을 때만 렌더된다(월 탐색 없이, 매칭된 전체를 날짜순으로).
export function ListView({ games, events = [], wishlist, onPick, now, category, onCategory }: Props) {
  const lang = useLocale();
  const t = lang ? CAL[lang] : null;

  const items = [
    ...games.map(g => ({ kind: 'game' as const, date: g.release_date, game: g })),
    ...events.map((e, i) => ({ kind: 'event' as const, date: e.date, key: `${e.date}-${i}`, event: e })),
  ].sort((a, b) => a.date.localeCompare(b.date));

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
        </div>
      ) : (
        <ul className={styles.rows}>
          {items.map(it => it.kind === 'game'
            ? <GameRow key={`g-${it.game.id}`} game={it.game} now={now} wishlist={wishlist} onPick={onPick} />
            : <EventRow key={`e-${it.key}`} event={it.event} />
          )}
        </ul>
      )}
    </div>
  );
}
