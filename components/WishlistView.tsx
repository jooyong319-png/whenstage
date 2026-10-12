'use client';
import { useMemo, type CSSProperties } from 'react';
import type { Game } from '@/lib/types';
import { CATEGORY_META, eventStatusOf } from '@/lib/types';
import { calcDayDiff, parseDateOnly } from '@/lib/utils';
import { useWishlist } from '@/hooks/useWishlist';
import { useLocale } from '@/hooks/useLocale';
import { UI, CAL, CATEGORY_LABELS, pastLabel } from '@/lib/i18nLabels';
import { NotifyToggle } from './NotifyToggle';
import { FollowedArtists } from './FollowedArtists';
import { PageHeader } from './PageHeader';
import styles from './WishlistView.module.css';

const MY_ALERTS = {
  ko: { title: '내 알림', sub: '팔로우한 가수와 찜한 공연의 새 소식·예매 오픈을 알려 드려요.', saved: '찜한 공연' },
  en: { title: 'My alerts', sub: 'New shows and ticket sales for the artists you follow and the shows you saved.', saved: 'Saved shows' },
  ja: { title: 'マイ通知', sub: 'フォロー中のアーティストと保存した公演の新着・発売開始をお知らせします。', saved: '保存した公演' },
};

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
      {/* '내 찜' → '내 알림'(2026-10-13): 팔로우한 가수 + 찜한 공연 + 알림 설정을 한곳에.
          알림이 오는 이유(팔로우·찜)와 알림 설정이 같은 화면에 있어야 켜고 끄기가 이해된다 */}
      <PageHeader
        icon="ic-bell"
        title={MY_ALERTS[lang ?? 'ko'].title}
        subtitle={MY_ALERTS[lang ?? 'ko'].sub}
      />

      <NotifyToggle />

      <FollowedArtists games={games} />

      <h2 className={styles.followTitle}>{MY_ALERTS[lang ?? 'ko'].saved}{items.length > 0 && <span className={styles.followCount}>{items.length}</span>}</h2>

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
            const releasedText = t ? pastLabel(g.category, t) : '종료';
            const status = eventStatusOf(g);
            const statusText = status === 'cancelled' ? (t ? t.cancelledTag : '취소') : status === 'postponed' ? (t ? t.postponedTag : '연기') : null;
            const dd = statusText ?? (g.release_date_approx ? tba : released ? releasedText : diff === 0 ? 'D-DAY' : `D-${diff}`);
            const soon = diff >= 0 && diff <= 7;
            const cat = CATEGORY_META[g.category];
            const displayName = g.name;
            const intlLocale = lang === 'en' ? 'en-US' : lang === 'ja' ? 'ja-JP' : 'ko-KR';
            const date = g.release_date_approx
              ? (t ? t.releaseDateTba : '출시일 미정')
              : `${new Intl.DateTimeFormat(intlLocale, { year: 'numeric', month: 'long', day: 'numeric' }).format(parseDateOnly(g.release_date))} (${t!.weekdays[parseDateOnly(g.release_date).getDay()]})`;
            return (
              <li key={g.id} className={styles.row} style={{ '--cat': cat.color } as CSSProperties}>
                <a className={styles.rowMain} href={`/${lang}/concert/${g.id}`}>
                  <span className={styles.titleRow}>
                    <span className={styles.badge} style={{ color: cat.color }}>{lang ? CATEGORY_LABELS[lang][g.category] : cat.short}</span>
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
