'use client';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { Game, FilterState } from '@/lib/types';
import { normalizeArtistKey, CATEGORY_META } from '@/lib/types';
import { formatShortDate, kstDateOnly, calcDayDiff } from '@/lib/utils';
import { CalendarView } from './CalendarView';
import { ListView } from './ListView';
import { UpcomingStrip } from './UpcomingStrip';
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
  artistAliases: Record<string, string[]>;
  cardImages: Record<string, string>;
}

export function Home({ initialGames, lastUpdated, serverNow, artistAliases, cardImages }: HomeProps) {
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
        const q = filters.search.toLowerCase();
        // 이벤트 제목만으로는 부족함(예: "BIGBANG 2026 WORLD TOUR IN GOYANG"엔 "빅뱅"이 아예
        // 없음) — developer(아티스트명) 원문도 직접 매치 대상에 넣는다.
        const nameMatch = g.name.toLowerCase().includes(q);
        const devKey = g.developer ? normalizeArtistKey(g.developer) : null;
        const devMatch = g.developer ? g.developer.toLowerCase().includes(q) : false;
        // "bigbang" 검색으로 "빅뱅"이 나오게(역방향도) — 큐레이션된 영문/로마자 별칭
        // (data/artist-aliases.json) 중 하나라도 검색어를 포함하면 매치로 본다.
        const aliasMatch = devKey
          ? (artistAliases[devKey] ?? []).some(a => a.toLowerCase().includes(q))
          : false;
        if (!nameMatch && !devMatch && !aliasMatch) return false;
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

  const ui = UI[lang];

  // 히어로 마퀴 티커 — 확정일(approx 제외) 다가오는 일정 중 가까운 순 10개(실데이터, 장식 아님)
  const tickerItems = useMemo(() => {
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    return initialGames
      .filter(g => !g.release_date_approx && new Date(g.release_date) >= today)
      .sort((a, b) => a.release_date.localeCompare(b.release_date))
      .slice(0, 10);
  }, [initialGames, now]);

  // 캘린더 아래 "다가오는 일정" 스트립용 — 카테고리/찜 필터 반영(filteredGames 기반), 오늘 이후만,
  // 가까운 순 12개. 캘린더의 빈 공간을 이미지 카드로 채운다.
  const upcomingForStrip = useMemo(() => {
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    return filteredGames
      .filter(g => g.release_date_approx || new Date(g.release_date) >= today)
      .sort((a, b) => a.release_date.localeCompare(b.release_date))
      .slice(0, 12);
  }, [filteredGames, now]);

  return (
    <div className={styles.home}>
      <motion.section
        className={styles.hero}
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <motion.span
          className={`${styles.heroBlob} ${styles.heroBlobA}`}
          aria-hidden="true"
          animate={{ x: [0, 22, -8, 0], y: [0, -16, 10, 0] }}
          transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.span
          className={`${styles.heroBlob} ${styles.heroBlobB}`}
          aria-hidden="true"
          animate={{ x: [0, -18, 12, 0], y: [0, 14, -10, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        />
        <motion.span
          className={`${styles.heroBlob} ${styles.heroBlobC}`}
          aria-hidden="true"
          animate={{ x: [0, 16, -14, 0], y: [0, -12, 14, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        <motion.span
          className={`${styles.heroBlob} ${styles.heroBlobD}`}
          aria-hidden="true"
          animate={{ x: [0, -20, 8, 0], y: [0, 10, -14, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
        />
        <motion.span
          className={`${styles.heroBlob} ${styles.heroBlobE}`}
          aria-hidden="true"
          animate={{ x: [0, 14, -10, 0], y: [0, 12, -8, 0] }}
          transition={{ duration: 12.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
        />
        <h1 className={styles.heroTitle}>{ui.heroTitle}</h1>
        {tickerItems.length > 0 ? (
          <div className={styles.tickerWrap}>
            <div className={styles.tickerTrack}>
              {[...tickerItems, ...tickerItems].map((g, i) => (
                <a
                  key={`${g.id}-${i}`}
                  href={`/${lang}/concert/${g.id}`}
                  className={styles.tickerItem}
                  aria-hidden={i >= tickerItems.length || undefined}
                  tabIndex={i >= tickerItems.length ? -1 : undefined}
                >
                  <span className={styles.tickerDday} style={{ color: CATEGORY_META[g.category].color }}>D-{calcDayDiff(g.release_date, now)}</span>
                  <span className={styles.tickerName}>{g.name}</span>
                  <span className={styles.tickerDate}>{formatShortDate(g.release_date)}</span>
                </a>
              ))}
            </div>
          </div>
        ) : (
          <p className={styles.heroSubtitle}>{ui.heroSubtitle}</p>
        )}
      </motion.section>
      <div className={styles.layout}>
        <div className={styles.main}>
          <motion.div
            className={styles.topRow}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
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
          </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut', delay: 0.08 }}
      >
      {showList ? (
        <ListView
          games={listGames}
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
          wishlist={wishlist}
          onPick={openModal}
          now={now}
          category={filters.category}
          onCategory={c => setFilters({ ...filters, category: c })}
        />
      )}
      </motion.div>

          {!showList && (
            <UpcomingStrip games={upcomingForStrip} cardImages={cardImages} now={now} onPick={openModal} />
          )}

          <p className={styles.lastUpdated}>
            {t.lastUpdated}: {formatShortDate(lastUpdated.slice(0, 10))}
          </p>
        </div>
      </div>

      <AnimatePresence>
        {openGame && <GameModal game={openGame} onClose={() => closeModal()} wishlist={wishlist} />}
      </AnimatePresence>
    </div>
  );
}
