import type { ReactNode } from 'react';
import { getAllGames } from '@/lib/games';
import { kstDateOnly } from '@/lib/utils';
import { FeaturedCards } from './FeaturedCards';
import { CAL, type Locale } from '@/lib/i18nLabels';
// ── 사이드바 재구성: 아래 위젯들은 임시 주석(재사용 가능) ──
// import type { Category } from '@/lib/types';
// import { NextByCategory } from './NextByCategory';
// import { PromoBanner } from './PromoBanner';
// import { PopularGames } from './PopularGames';
// import { CalendarSubscribe } from './CalendarSubscribe';
// import { AdFit } from './AdFit';
import styles from './PageShell.module.css';

interface Props {
  children: ReactNode;
  lang?: Locale;
}

// 서브페이지(출시예정·카테고리·블로그·상세) 공용 2컬럼 셸 — 우측 레일에 카테고리별 카드 나열.
// 정적 생성이라 빌드 시각(KST) 기준 D-day(데이터 일일 갱신 시 재배포로 신선도 유지).
export async function PageShell({ children, lang }: Props) {
  const games = await getAllGames(lang);
  const now = kstDateOnly(new Date().toISOString());

  return (
    <div className={styles.layout}>
      <main className={styles.main}>{children}</main>

      <aside className={styles.rightCol} aria-label={lang ? CAL[lang].recommendedSchedule : '추천 일정'}>
        <FeaturedCards games={games} now={now} variant="list" />
        {/* ── 이전 위젯들: 재구성으로 임시 비활성 (재사용 가능) ──
        <NextByCategory games={games} now={now} />
        <AdFit unit="DAN-OszywWckdPV6qhbX" width={300} height={250} />
        <PopularGames meta={meta} />
        <CalendarSubscribe />
        <PromoBanner variant="update" />
        ──────────────────────────────────────────── */}
      </aside>
    </div>
  );
}
