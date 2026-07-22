'use client';
import { useState, useMemo, useEffect, useCallback } from 'react';
import type { Game, FilterState, CalEvent } from '@/lib/types';
import { EVENT_TYPE_META } from '@/lib/types';
import { formatShortDate, kstDateOnly } from '@/lib/utils';
// ── 사이드바 재작업 예정: 아래 import는 임시 주석(재사용 가능) ──
// import { NextByCategory } from './NextByCategory';
// import { PromoBanner } from './PromoBanner';
// import { PopularGames } from './PopularGames';
// import { CalendarSubscribe } from './CalendarSubscribe';
// import { AdFit } from './AdFit';
import { CalendarView } from './CalendarView';
import { ListView } from './ListView';
import { GameModal } from './GameModal';
import { useWishlist } from '@/hooks/useWishlist';
import { useWishlistFilter } from '@/hooks/useWishlistFilter';
import { useLocale } from '@/hooks/useLocale';
import { CAL, UI } from '@/lib/i18nLabels';
import styles from './Home.module.css';

interface HomeProps {
  initialGames: Game[];
  lastUpdated: string;
  serverNow: string;
  initialCalEvents?: CalEvent[];
}

export function Home({ initialGames, lastUpdated, serverNow, initialCalEvents = [] }: HomeProps) {
  const lang = useLocale();
  const t = CAL[lang];
  const [filters, setFilters] = useState<FilterState>({
    category: null,
    platform: null,
    days: -1,          // 기간 필터 제거(월 탭/월 네비가 스코프 담당) → 날짜 무하한(-1=전체).
    search: '',
    wishlistOnly: false,
  });
  // 검색어가 있으면 리스트(검색 결과), 없으면 캘린더 — 별도 토글 없이 검색 여부로 자동 전환.
  const showList = filters.search.trim().length > 0;
  const [calendarCursor, setCalendarCursor] = useState<Date>(() => {
    const d = kstDateOnly(serverNow);
    d.setDate(1);
    return d;
  });
  // 날짜 의존 렌더용 '현재 시각'. SSR/첫 렌더는 serverNow로 고정(하이드레이션 일치),
  // mount 후 실제 현재 시각으로 교체 → D-day·오늘 셀이 클라에서 정확.
  const [now, setNow] = useState<Date>(() => kstDateOnly(serverNow));
  const [openGameId, setOpenGameId] = useState<string | null>(null);

  const calEvents = initialCalEvents;

  // 필터가 이벤트 타입이면 그 타입만, 게임 카테고리면 이벤트 숨김, 없으면 전부
  const displayEvents = useMemo(() => {
    const f = filters.category;
    if (!f) return calEvents;
    if (f in EVENT_TYPE_META) return calEvents.filter(e => e.type === f);
    return [];
  }, [calEvents, filters.category]);

  const wishlist = useWishlist();
  const wishFilter = useWishlistFilter(); // 위시만 보기 토글 — 본문 상단행 ★(§F)
  const wishlistOnly = wishFilter.on;

  // mount 직후 1회: 실제 현재 시각/이번 달로 교체 (하이드레이션 이후라 에러 아님)
  useEffect(() => {
    const real = kstDateOnly(new Date().toISOString());
    setNow(real);
    const m = new Date(real);
    m.setDate(1);
    setCalendarCursor(m);
  }, []);

  // 모달 열기 + URL 변경 (인스타 스타일)
  const openModal = useCallback((id: string) => {
    setOpenGameId(id);
    try {
      const desiredPath = `/${lang}/concert/${id}`;
      if (window.location.pathname !== desiredPath) {
        window.history.pushState({ modal: id }, '', desiredPath);
      }
    } catch { /* no-op */ }
  }, [lang]);

  // 모달 닫기 + URL 복귀
  const closeModal = useCallback((skipHistory = false) => {
    setOpenGameId(null);
    if (!skipHistory) {
      try {
        if (window.history.state?.modal) {
          window.history.back();
        }
      } catch { /* no-op */ }
    }
  }, []);

  // popstate 처리 (뒤로/앞으로)
  useEffect(() => {
    const onPop = () => {
      const m = window.location.pathname.match(/^\/(?:ko|en|ja)\/concert\/([^/]+)$/);
      if (m && initialGames.some(g => g.id === m[1])) {
        setOpenGameId(m[1]);
      } else {
        setOpenGameId(null);
      }
    };
    window.addEventListener('popstate', onPop);
    // 초기 URL이 /[lang]/concert/[id]면 모달 열기
    onPop();
    return () => window.removeEventListener('popstate', onPop);
  }, [initialGames]);

  // 필터 적용
  const filteredGames = useMemo(() => {
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    const future = new Date(today);
    if (filters.days > 0) future.setDate(today.getDate() + filters.days);

    return initialGames.filter(g => {
      if (filters.category && g.category !== filters.category) return false;
      if (wishlistOnly && !wishlist.has(g.id)) return false;

      if (filters.search) {
        const hay = g.name.toLowerCase();
        if (!hay.includes(filters.search.toLowerCase())) return false;
      }

      if (filters.platform) {
        const platforms = g.platforms.map(p => p.toLowerCase());
        if (!platforms.some(p => p.includes(filters.platform!.toLowerCase()))) return false;
      }

      // 기간 필터: 과거 게임은 항상 통과, days > 0이면 미래 상한만 적용
      if (filters.days > 0) {
        const r = new Date(g.release_date);
        if (r > future) return false;
      }

      return true;
    });
  }, [initialGames, filters, wishlist.ids, wishlistOnly, now]);

  // 리스트 전용: '오늘 이후' 하한 적용(캘린더 공유 filteredGames는 무하한 → 과거 달 탐색 보존).
  // 기간 '전체 (과거 포함)'(-1) 선택 시에만 과거 복원. 하한은 now(KST, mount 후) 기준이라 SSR 안전.
  const listGames = useMemo(() => {
    if (filters.days === -1) return filteredGames;
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    return filteredGames.filter(g => new Date(g.release_date) >= today);
  }, [filteredGames, filters.days, now]);


  const openGame = openGameId ? initialGames.find(g => g.id === openGameId) ?? null : null;

  return (
    <div className={styles.home}>
      <h1 className="sr-only">{UI[lang].siteName}</h1>
      <div className={styles.layout}>
        <div className={styles.main}>
          <div className={styles.topRow}>
            <input
              type="search"
              placeholder={t.searchPlaceholder}
              value={filters.search}
              onChange={e => setFilters({ ...filters, search: e.target.value })}
              className={styles.topSearch}
              aria-label={t.searchPlaceholder}
            />
            <button
              type="button"
              className={`${styles.wishToggle} ${wishlistOnly ? styles.wishToggleOn : ''}`}
              onClick={wishFilter.toggle}
              aria-pressed={wishlistOnly}
              aria-label={t.wishlistOnly}
              title={t.wishlistOnly}
            >
              <svg className={wishlistOnly ? 'ic ic-fill' : 'ic'} aria-hidden="true"><use href="#ic-star" /></svg>
              <span className={styles.wishToggleLabel}>{t.wishlist}</span>
            </button>
          </div>

      {showList ? (
        <ListView
          games={listGames}
          events={displayEvents}
          wishlist={wishlist}
          onPick={openModal}
          now={now}
          category={filters.category}
          onCategory={c => setFilters({ ...filters, category: c })}
        />
      ) : (
        <CalendarView
          cursor={calendarCursor}
          onCursorChange={setCalendarCursor}
          games={filteredGames}
          events={displayEvents}
          wishlist={wishlist}
          onPick={openModal}
          now={now}
          category={filters.category}
          onCategory={c => setFilters({ ...filters, category: c })}
        />
      )}

          <p className={styles.lastUpdated}>
            {t.lastUpdated}: {formatShortDate(lastUpdated.slice(0, 10))}
          </p>
        </div>

        {/* ── 오른쪽 사이드바: 재작업 예정, 임시 비활성 (재사용 가능) ──
        <aside className={styles.rightCol} aria-label="추천 일정">
          <NextByCategory games={initialGames} now={now} />
          <AdFit unit="DAN-OszywWckdPV6qhbX" width={300} height={250} />
          <PopularGames meta={Object.fromEntries(initialGames.map(g => [g.id, { name: g.name, category: g.category }]))} />
          <CalendarSubscribe />
          <PromoBanner variant="update" />
        </aside>
        ──────────────────────────────────────────────────────── */}
      </div>

      {openGame && <GameModal game={openGame} onClose={() => closeModal()} wishlist={wishlist} />}
    </div>
  );
}
