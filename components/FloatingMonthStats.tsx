import { getAllGames } from '@/lib/games';
import { kstDateOnly } from '@/lib/utils';
import { CATEGORY_META, hasActiveTicketing, type Category } from '@/lib/types';
import styles from './FloatingMonthStats.module.css';

const ORDER: Category[] = ['concert_tour', 'music_release', 'festival', 'fanmeeting'];

function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// 전 페이지 공용 — 좌측 빈 여백에 떠 있는 '이달의 출시' 위젯(넓은 화면 전용, CSS로 숨김 처리).
// 서버 컴포넌트, 빌드 시각(KST) 기준 — 데이터 일일 갱신 시 재배포로 신선도 유지.
export async function FloatingMonthStats() {
  const games = await getAllGames();
  const now = kstDateOnly(new Date().toISOString());
  const year = now.getFullYear();
  const month = now.getMonth();

  const counts: Record<Category, number> = {
    concert_tour: 0, music_release: 0, festival: 0, fanmeeting: 0,
  };
  let total = 0;
  for (const g of games) {
    const y = Number(g.release_date.slice(0, 4));
    const m = Number(g.release_date.slice(5, 7)) - 1;
    if (y === year && m === month) {
      counts[g.category]++;
      total++;
    }
  }
  const max = Math.max(1, ...ORDER.map(c => counts[c]));

  // 지금 티켓팅 중(선예매/일반예매) · 미출시 → 출시 임박순 최대 5개
  const today = ymd(now);
  const preRegs = games
    .filter(g => hasActiveTicketing(g)
      && !(!g.release_date_approx && g.release_date < today))
    .sort((a, b) => a.release_date.localeCompare(b.release_date))
    .slice(0, 5);

  return (
    <aside className={styles.float} aria-label={`${month + 1}월 출시 통계`}>
      <h3 className={styles.title}>
        <svg className="ic" aria-hidden="true"><use href="#ic-calendar" /></svg>
        {month + 1}월 출시
        <span className={styles.total}>{total}</span>
      </h3>
      <div className={styles.bars}>
        {ORDER.map(c => (
          <div key={c} className={styles.row}>
            <span className={styles.name}>{CATEGORY_META[c].short}</span>
            <span className={styles.track}>
              <span
                className={styles.fill}
                style={{ width: `${(counts[c] / max) * 100}%`, background: CATEGORY_META[c].color }}
              />
            </span>
            <span className={styles.num}>{counts[c]}</span>
          </div>
        ))}
      </div>

      {preRegs.length > 0 && (
        <div className={styles.preSection}>
          <h3 className={styles.subtitle}>
            <svg className="ic" aria-hidden="true"><use href="#ic-star" /></svg>
            지금 사전예약
          </h3>
          <div className={styles.preList}>
            {preRegs.map(g => (
              <a key={g.id} href={`/game/${g.id}`} className={styles.preRow}>
                <span className={styles.preDot} style={{ background: CATEGORY_META[g.category].color }} aria-hidden="true" />
                <span className={styles.preName}>{g.name}</span>
              </a>
            ))}
          </div>
          <a href="/pre-registration" className={styles.preMore}>전체 보기 →</a>
        </div>
      )}
    </aside>
  );
}
