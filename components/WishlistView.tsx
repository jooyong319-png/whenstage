'use client';
import { useMemo, type CSSProperties } from 'react';
import type { Game } from '@/lib/types';
import { CATEGORY_META } from '@/lib/types';
import { calcDayDiff } from '@/lib/utils';
import { useWishlist } from '@/hooks/useWishlist';
import { useLocale } from '@/hooks/useLocale';
import { UI, CAL } from '@/lib/i18nLabels';
import { NotifyToggle } from './NotifyToggle';
import { PageHeader } from './PageHeader';
import styles from './WishlistView.module.css';

export function WishlistView({ games }: { games: Game[] }) {
  const lang = useLocale();
  const ui = lang ? UI[lang] : null;
  const t = lang ? CAL[lang] : null;
  const wishlist = useWishlist();
  const items = useMemo(
    () => games.filter(g => wishlist.has(g.id)).sort((a, b) => a.release_date.localeCompare(b.release_date)),
    [games, wishlist.ids],
  );

  return (
    <section className={styles.section}>
      <PageHeader
        icon="ic-star"
        title={t ? t.myWishlist : '내 찜'}
        subtitle={t ? t.myWishlistSub : '관심 있는 공연·발매 일정을 모아봤어요.'}
        count={items.length > 0 ? items.length : undefined}
        countLabel={lang === 'ko' ? '개' : lang === 'ja' ? '件' : 'saved'}
      />

      <NotifyToggle />

      {items.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon} aria-hidden="true"><svg className="ic"><use href="#ic-star" /></svg></div>
          <p className={styles.emptyText}>{t ? t.wishlistEmptyText : '아직 찜한 일정이 없어요.'}</p>
          <p className={styles.emptyHint}>{t ? t.wishlistEmptyHint : '상세 페이지에서 찜 버튼을 눌러 추가하세요.'}</p>
        </div>
      ) : (
        <ul className={styles.list}>
          {items.map(g => {
            const diff = calcDayDiff(g.release_date);
            const released = diff < 0;
            const tba = ui ? ui.tba : '미정';
            const releasedText = t ? t.released : '출시됨';
            const dd = g.release_date_approx ? tba : released ? releasedText : diff === 0 ? 'D-DAY' : `D-${diff}`;
            const soon = diff >= 0 && diff <= 7;
            const cat = CATEGORY_META[g.category];
            const displayName = g.name;
            const intlLocale = lang === 'en' ? 'en-US' : lang === 'ja' ? 'ja-JP' : 'ko-KR';
            const date = g.release_date_approx
              ? (t ? t.releaseDateTba : '출시일 미정')
              : `${new Intl.DateTimeFormat(intlLocale, { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(g.release_date))} (${t!.weekdays[new Date(g.release_date).getDay()]})`;
            return (
              <li key={g.id} className={styles.row} style={{ '--cat': cat.color } as CSSProperties}>
                <a className={styles.rowMain} href={`/${lang}/concert/${g.id}`}>
                  <span className={styles.titleRow}>
                    <span className={styles.badge} style={{ color: cat.color }}>{cat.short}</span>
                    <span className={styles.name}>{displayName}</span>
                  </span>
                  <span className={styles.date}>{date}</span>
                </a>
                <span className={`${styles.dday} ${soon ? styles.ddaySoon : ''}`}>{dd}</span>
                <button
                  type="button"
                  className={styles.remove}
                  onClick={() => wishlist.toggle(g.id)}
                  aria-label={t ? t.removeFromWishlistAria(displayName) : `${g.name} 찜 해제`}
                >
                  <svg className="ic ic-fill" aria-hidden="true"><use href="#ic-star" /></svg>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
