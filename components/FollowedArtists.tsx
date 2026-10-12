'use client';
import { useEffect, useMemo, useState } from 'react';
import type { Game } from '@/lib/types';
import { normalizeArtistKey, nextTicketOpening } from '@/lib/types';
import { formatEventDateTimeShort, formatDateShort, calcDayDiff } from '@/lib/utils';
import { useFollow } from '@/hooks/useFollow';
import { useLocale } from '@/hooks/useLocale';
import { CAL } from '@/lib/i18nLabels';
import { FollowButton } from './FollowButton';
import styles from './WishlistView.module.css';

const TEXT = {
  ko: { title: '팔로우한 가수', empty: '아직 팔로우한 가수가 없어요.', hint: '가수를 팔로우하면 새 공연이 잡히거나 예매가 열릴 때 알려 드려요.', browse: '아티스트 둘러보기', nextShow: '다음 공연', none: '예정된 공연 없음 — 새 공연이 잡히면 알려 드릴게요' },
  en: { title: 'Artists you follow', empty: "You don't follow any artists yet.", hint: "Follow an artist and we'll tell you when a new show is announced or tickets go on sale.", browse: 'Browse artists', nextShow: 'Next show', none: "No upcoming shows — we'll tell you when one is announced" },
  ja: { title: 'フォロー中のアーティスト', empty: 'まだフォローしているアーティストはいません。', hint: 'アーティストをフォローすると、新しい公演の発表や発売開始をお知らせします。', browse: 'アーティストを見る', nextShow: '次の公演', none: '予定されている公演なし — 発表され次第お知らせします' },
};

/**
 * "내 알림" 페이지의 팔로우한 가수 구역 (2026-10-13).
 * 가수마다 **다음 예매 오픈**(있으면 먼저)과 다음 공연을 보여준다 — 이 페이지 하나로 "내 가수 다음 일정"이 보이게.
 * 현재 로케일의 팔로우만 보여준다(키가 `로케일:이름`, 로케일마다 데이터가 독립).
 */
export function FollowedArtists({ games }: { games: Game[] }) {
  const lang = useLocale();
  const follow = useFollow();
  // 예매 오픈·D-day는 방문 시각 기준 — 첫 렌더는 빈 값(하이드레이션 일치), mount 후 계산
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => { setNow(new Date()); }, []);

  const rows = useMemo(() => {
    if (!lang || !now) return [];
    const prefix = `${lang}:`;
    const today = new Date(now); today.setHours(0, 0, 0, 0);
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    return [...follow.keys]
      .filter(k => k.startsWith(prefix))
      .map(k => {
        const artistKey = k.slice(prefix.length);
        const mine = games.filter(g => g.developer && normalizeArtistKey(g.developer) === artistKey);
        const name = mine.reduce((n, g) => (g.developer!.length > n.length ? g.developer! : n), artistKey);
        const upcoming = mine
          .filter(g => g.release_date_approx || g.release_date >= todayStr)
          .sort((a, b) => a.release_date.localeCompare(b.release_date));
        const opening = upcoming
          .map(g => ({ g, o: nextTicketOpening(g, now) }))
          .filter((x): x is { g: Game; o: NonNullable<typeof x.o> } => !!x.o)
          .sort((a, b) => new Date(a.o.at).getTime() - new Date(b.o.at).getTime())[0] ?? null;
        return { key: k, artistKey, name, next: upcoming[0] ?? null, opening };
      })
      // 예매가 곧 열리는 가수 먼저, 그다음 공연이 가까운 순
      .sort((a, b) => {
        if (a.opening && b.opening) return new Date(a.opening.o.at).getTime() - new Date(b.opening.o.at).getTime();
        if (a.opening) return -1;
        if (b.opening) return 1;
        return (a.next?.release_date ?? '9999').localeCompare(b.next?.release_date ?? '9999');
      });
  }, [follow.keys, games, lang, now]);

  if (!lang) return null;
  const t = TEXT[lang];
  const cal = CAL[lang];

  return (
    <section className={styles.followSection} aria-label={t.title}>
      <h2 className={styles.followTitle}>{t.title}{rows.length > 0 && <span className={styles.followCount}>{rows.length}</span>}</h2>
      {now && rows.length === 0 ? (
        <div className={styles.followEmpty}>
          <p className={styles.emptyText}>{t.empty}</p>
          <p className={styles.emptyHint}>{t.hint}</p>
          <a className={styles.followBrowse} href={`/${lang}/artist`}>{t.browse} →</a>
        </div>
      ) : (
        <ul className={styles.followList}>
          {rows.map(r => (
            <li key={r.key} className={styles.followItem}>
              <div className={styles.followMain}>
                <a className={styles.followName} href={`/${lang}/artist/${encodeURIComponent(r.artistKey)}`}>{r.name}</a>
                {r.opening ? (
                  <a className={styles.followLine} href={`/${lang}/concert/${r.opening.g.id}`}>
                    <span className={styles.followTicket}>
                      {(() => { const d = calcDayDiff(r.opening.o.at.slice(0, 10), now!); return d <= 0 ? cal.ticketToday : cal.ticketDday(`D-${d}`); })()}
                    </span>
                    {formatEventDateTimeShort(r.opening.o.at, r.opening.g.timezone || 'Asia/Seoul', lang)} · {r.opening.g.name}
                  </a>
                ) : r.next ? (
                  <a className={styles.followLine} href={`/${lang}/concert/${r.next.id}`}>
                    {t.nextShow} · {r.next.release_date_approx ? '' : formatDateShort(r.next.release_date, lang)} {r.next.name}
                  </a>
                ) : (
                  <span className={styles.followLineMuted}>{t.none}</span>
                )}
              </div>
              <FollowButton lang={lang} artistKey={r.artistKey} artistName={r.name} size="sm" />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
