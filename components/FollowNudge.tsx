'use client';
import { useEffect, useMemo, useState } from 'react';
import type { Game } from '@/lib/types';
import { normalizeArtistKey, eventStatusOf } from '@/lib/types';
import { useFollow } from '@/hooks/useFollow';
import { useLocale } from '@/hooks/useLocale';
import { FollowButton } from './FollowButton';
import styles from './TicketingBoard.module.css';

const TEXT = {
  ko: { title: '가수를 팔로우하면 예매 전에 알려 드려요', sub: '어느 예매처든 새 공연이 잡히거나 예매가 열리면 알림이 가요.', following: (n: number) => `팔로우 중인 가수 ${n}명`, my: '내 알림 보기' },
  en: { title: 'Follow artists — we’ll tell you before tickets go on sale', sub: 'Get an alert when a new show is announced or tickets open, on any ticket site.', following: (n: number) => `Following ${n} artist${n === 1 ? '' : 's'}`, my: 'My alerts' },
  ja: { title: 'アーティストをフォローすると発売前にお知らせ', sub: 'どのプレイガイドでも、新しい公演の発表や発売開始を通知します。', following: (n: number) => `フォロー中 ${n}組`, my: 'マイ通知を見る' },
};

const MAX = 6;

/**
 * 홈 예매 보드 위 팔로우 안내 (2026-10-13) — "왜 WhenStage인가"를 첫 화면에서 보이게.
 * 아직 아무도 안 따랐으면: 한 줄 설명 + 다가오는 공연이 많은 가수 바로 팔로우.
 * 이미 따르고 있으면: "팔로우 중 N명 · 내 알림 보기" 한 줄(같은 권유를 반복하지 않는다).
 * 팔로우 상태는 브라우저 저장소라 첫 렌더(서버)엔 모른다 → mount 전엔 아무것도 그리지 않는다.
 */
export function FollowNudge({ games }: { games: Game[] }) {
  const lang = useLocale();
  const follow = useFollow();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const picks = useMemo(() => {
    const today = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
    const by = new Map<string, { name: string; count: number; first: string }>();
    for (const g of games) {
      if (!g.developer || g.category === 'music_release' || eventStatusOf(g) === 'cancelled') continue;
      if (!g.release_date_approx && g.release_date < today) continue;
      // 페스티벌 출연진 목록("A, B, C")은 한 가수가 아니다
      if (/[,、&＆]|指揮/.test(g.developer)) continue;   // 합동 공연('A & B')·지휘자 병기도 한 가수가 아니다
      const key = normalizeArtistKey(g.developer);
      const cur = by.get(key) ?? { name: g.developer, count: 0, first: g.release_date };
      cur.count++;
      if (g.developer.length > cur.name.length) cur.name = g.developer;
      if (g.release_date < cur.first) cur.first = g.release_date;
      by.set(key, cur);
    }
    return [...by.entries()]
      .sort((a, b) => b[1].count - a[1].count || a[1].first.localeCompare(b[1].first))
      .slice(0, MAX)
      .map(([key, v]) => ({ key, name: v.name }));
  }, [games]);

  if (!lang || !mounted) return null;
  const t = TEXT[lang];
  const mine = [...follow.keys].filter(k => k.startsWith(`${lang}:`)).length;

  if (mine > 0) {
    return (
      <p className={styles.nudgeLine}>
        {t.following(mine)} · <a href={`/${lang}/wishlist`} data-ev="nav_click" data-area="nudge">{t.my} →</a>
      </p>
    );
  }
  if (picks.length === 0) return null;
  return (
    <section className={styles.nudge} aria-label={t.title}>
      <p className={styles.nudgeTitle}>{t.title}</p>
      <p className={styles.nudgeSub}>{t.sub}</p>
      <ul className={styles.nudgeList}>
        {picks.map(p => (
          <li key={p.key} className={styles.nudgeItem}>
            <a href={`/${lang}/artist/${encodeURIComponent(p.key)}`} className={styles.nudgeName}>{p.name}</a>
            <FollowButton lang={lang} artistKey={p.key} artistName={p.name} size="sm" />
          </li>
        ))}
      </ul>
    </section>
  );
}
