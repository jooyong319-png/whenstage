import type { ReactNode } from 'react';
import { getAllGames } from '@/lib/games';
import { kstDateOnly } from '@/lib/utils';
import { FeaturedCards } from './FeaturedCards';
import { CAL, type Locale } from '@/lib/i18nLabels';
import styles from './PageShell.module.css';

interface Props {
  children: ReactNode;
  lang?: Locale;
  // 페이지 맥락에 맞는 사이드바 콘텐츠(예: 같은 아티스트의 다른 일정, 관련 아티클) — 안 넘기면
  // 기본값인 카테고리별 추천 일정(FeaturedCards)을 그대로 보여준다.
  sidebar?: ReactNode;
}

// 서브페이지(출시예정·카테고리·블로그·상세) 공용 2컬럼 셸 — 우측 레일에 카테고리별 카드 나열.
// 정적 생성이라 빌드 시각(KST) 기준 D-day(데이터 일일 갱신 시 재배포로 신선도 유지).
export async function PageShell({ children, lang, sidebar }: Props) {
  const now = kstDateOnly(new Date().toISOString());
  const defaultSidebar = sidebar ?? <FeaturedCards games={await getAllGames(lang)} now={now} />;

  return (
    <div className={styles.layout}>
      <main className={styles.main}>{children}</main>

      <aside className={styles.rightCol} aria-label={lang ? CAL[lang].recommendedSchedule : '추천 일정'}>
        {defaultSidebar}
      </aside>
    </div>
  );
}
