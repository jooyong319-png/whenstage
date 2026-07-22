'use client';
import { useMemo, useState, useEffect, useRef, type CSSProperties } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { Game, CalEvent, FilterKey } from '@/lib/types';
import { CATEGORY_META } from '@/lib/types';
import type { Category } from '@/lib/types';
import { CategoryFilterBar } from './CategoryFilterBar';
import { ScheduleCard, type ScheduleKind } from './ScheduleCard';
import { EventRow } from './EventRow';
import { useLocale } from '@/hooks/useLocale';
import { CAL, CATEGORY_LABELS } from '@/lib/i18nLabels';
import styles from './CalendarView.module.css';

interface Props {
  cursor: Date;
  onCursorChange: (d: Date) => void;
  games: Game[];
  events?: CalEvent[];
  wishlist: { has: (id: string) => boolean; toggle: (id: string) => void };
  onPick: (id: string) => void;
  now: Date;
  category: FilterKey | null;
  onCategory: (c: FilterKey | null) => void;
}

interface CalEntry { game: Game; kind: ScheduleKind; }

const LEGEND_CATS: Category[] = ['concert_tour', 'music_release', 'festival', 'fanmeeting'];

// 선예매/일반예매 datetime(ISO, 오프셋 포함)에서 달력 배치용 날짜만 추출 — 오프셋을 UTC로
// 환산하지 않고 문자열 앞 10자만 쓴다(작성된 그대로가 곧 그 공연 타임존 기준 로컬 날짜이므로).
function dateOnly(iso: string | null | undefined): string | null {
  return iso ? iso.slice(0, 10) : null;
}

interface Cell {
  date: Date;
  iso: string;
  inMonth: boolean;
  entries: CalEntry[];
  isToday: boolean;
}

function pad(n: number): string { return String(n).padStart(2, '0'); }
function toISO(d: Date): string { return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }

function buildCells(cursor: Date, games: Game[], now: Date): Cell[] {
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = firstOfMonth.getDay();
  const start = new Date(year, month, 1 - startWeekday);
  const today = new Date(now); today.setHours(0,0,0,0);
  const byDate = new Map<string, CalEntry[]>();
  const addEntry = (date: string | null | undefined, game: Game, kind: ScheduleKind) => {
    if (!date) return;
    if (!byDate.has(date)) byDate.set(date, []);
    byDate.get(date)!.push({ game, kind });
  };
  for (const g of games) {
    addEntry(g.release_date, g, 'release');
    addEntry(dateOnly(g.presale_datetime), g, 'presale');
    addEntry(dateOnly(g.presale_end_datetime), g, 'presale_end');
    addEntry(dateOnly(g.general_sale_datetime), g, 'general_sale');
    addEntry(dateOnly(g.general_sale_end_datetime), g, 'general_sale_end');
  }
  const cells: Cell[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    d.setHours(0, 0, 0, 0);
    const iso = toISO(d);
    cells.push({
      date: d, iso,
      inMonth: d.getMonth() === month,
      entries: byDate.get(iso) ?? [],
      isToday: d.getTime() === today.getTime(),
    });
  }
  return cells;
}

export function CalendarView({ cursor, onCursorChange, games, events = [], wishlist: _wishlist, onPick, now, category, onCategory }: Props) {
  const lang = useLocale();
  const t = CAL[lang];
  const eventsByDate = useMemo(() => {
    const m = new Map<string, CalEvent[]>();
    for (const e of events) {
      if (!m.has(e.date)) m.set(e.date, []);
      m.get(e.date)!.push(e);
    }
    return m;
  }, [events]);
  const cells = useMemo(() => buildCells(cursor, games, now), [cursor, games, now]);
  const monthLabel = new Intl.DateTimeFormat(
    lang === 'en' ? 'en-US' : lang === 'ja' ? 'ja-JP' : 'ko-KR',
    { year: 'numeric', month: 'long' }
  ).format(cursor);
  const [selectedISO, setSelectedISO] = useState<string>(() => toISO(now));
  // 직전 커서 연-월 — 실제 월 이동에만 선택을 그 달 1일로 리셋
  const prevYMRef = useRef<string | null>(null);

  // 달이 바뀌면 선택 해제 — 단 첫 실행과 '같은 월' 재갱신(Home mount의 이번 달 교체)은 유지
  useEffect(() => {
    const ym = `${cursor.getFullYear()}-${cursor.getMonth()}`;
    if (prevYMRef.current === null) { prevYMRef.current = ym; return; }
    if (prevYMRef.current !== ym) {
      prevYMRef.current = ym;
      const inMonth = now.getFullYear() === cursor.getFullYear() && now.getMonth() === cursor.getMonth();
      setSelectedISO(inMonth ? toISO(now) : toISO(new Date(cursor.getFullYear(), cursor.getMonth(), 1)));
    }
  }, [cursor, now]);

  // 월 전환 방향(슬라이드 애니메이션용)
  const [slideDir, setSlideDir] = useState<'next' | 'prev'>('next');
  const prev = () => { setSlideDir('prev'); const d = new Date(cursor); d.setMonth(d.getMonth() - 1); onCursorChange(d); };
  const next = () => { setSlideDir('next'); const d = new Date(cursor); d.setMonth(d.getMonth() + 1); onCursorChange(d); };
  const today = () => { const d = new Date(); d.setDate(1); setSlideDir(d < cursor ? 'prev' : 'next'); onCursorChange(d); };

  // 좌우 스와이프로 이전/다음 달 이동(앱·모바일 제스처)
  const swipeRef = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    const p = e.touches[0];
    swipeRef.current = { x: p.clientX, y: p.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const s = swipeRef.current;
    swipeRef.current = null;
    if (!s) return;
    const p = e.changedTouches[0];
    const dx = p.clientX - s.x;
    const dy = p.clientY - s.y;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0) next();
      else prev();
    }
  };

  function onCellClick(cell: Cell) {
    if (!cell.inMonth) {
      // 인접월 셀: 그 달로 점프 + 그 날짜 선택
      onCursorChange(new Date(cell.date.getFullYear(), cell.date.getMonth(), 1));
      setSelectedISO(cell.iso);
      return;
    }
    setSelectedISO(cell.iso);
  }

  // 선택된 날짜의 출시·선예매·일반예매 항목
  const panelEntries = useMemo<CalEntry[]>(() => {
    const out: CalEntry[] = [];
    for (const g of games) {
      if (g.release_date === selectedISO) out.push({ game: g, kind: 'release' });
      if (dateOnly(g.presale_datetime) === selectedISO) out.push({ game: g, kind: 'presale' });
      if (dateOnly(g.presale_end_datetime) === selectedISO) out.push({ game: g, kind: 'presale_end' });
      if (dateOnly(g.general_sale_datetime) === selectedISO) out.push({ game: g, kind: 'general_sale' });
      if (dateOnly(g.general_sale_end_datetime) === selectedISO) out.push({ game: g, kind: 'general_sale_end' });
    }
    return out.sort((a, b) => a.game.name.localeCompare(b.game.name));
  }, [selectedISO, games]);

  // 선택된 날짜에 일정이 없을 때 보여줄 "다음 일정" 미리보기 — 전체 games 대상으로
  // selectedISO 이후 가장 가까운 항목부터 날짜순으로 최대 4개까지 뽑는다(단일 날짜에 안 묶임).
  const nextEntries = useMemo<CalEntry[]>(() => {
    if (panelEntries.length > 0) return [];
    type Dated = CalEntry & { date: string };
    const all: Dated[] = [];
    for (const g of games) {
      if (g.release_date > selectedISO) all.push({ game: g, kind: 'release', date: g.release_date });
      const presaleD = dateOnly(g.presale_datetime);
      if (presaleD && presaleD > selectedISO) all.push({ game: g, kind: 'presale', date: presaleD });
      const gsD = dateOnly(g.general_sale_datetime);
      if (gsD && gsD > selectedISO) all.push({ game: g, kind: 'general_sale', date: gsD });
    }
    return all
      .sort((a, b) => a.date.localeCompare(b.date) || a.game.name.localeCompare(b.game.name))
      .slice(0, 4);
  }, [panelEntries, games, selectedISO]);

  const isToday = selectedISO === toISO(now);
  const panelTitle = isToday
    ? (t ? t.todaySchedule : '오늘의 일정')
    : `${selectedISO} (${(t ? t.weekdays : ['일','월','화','수','목','금','토'])[new Date(selectedISO).getDay()]})`;

  return (
    <section className={styles.view}>
      <CategoryFilterBar category={category} onCategory={onCategory} className={styles.calCatBar} />

      <div className={styles.body}>
        <div className={styles.calCol}>
          <header className={styles.header}>
            <button type="button" className={styles.navBtn} onClick={prev} aria-label={t ? t.prevMonth : '이전 달'}>‹</button>
            <h2 className={styles.label}>{monthLabel}</h2>
            <button type="button" className={styles.navBtn} onClick={next} aria-label={t ? t.nextMonth : '다음 달'}>›</button>
            <button type="button" className={styles.todayBtn} onClick={today}>{t ? t.goToToday : '오늘로'}</button>
          </header>

          <div
            className={`${styles.grid} ${slideDir === 'prev' ? styles.slidePrev : styles.slideNext}`}
            key={`${cursor.getFullYear()}-${cursor.getMonth()}`}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            {(t ? t.weekdays : ['일','월','화','수','목','금','토']).map((d, i) => (<div key={d} className={`${styles.dayHead} ${i === 0 ? styles.sun : i === 6 ? styles.sat : ''}`.trim()}>{d}</div>))}
            {cells.map((cell, i) => {
              const has = cell.entries.length > 0;
              const dots = cell.entries.slice(0, 3);
              const overflow = cell.entries.length - 3;
              const isSelected = selectedISO === cell.iso;

              return (
                <div
                  key={i}
                  className={[
                    styles.cell,
                    !cell.inMonth ? styles.cellOther : '',
                    isSelected ? styles.cellSelected : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => onCellClick(cell)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onCellClick(cell);
                    }
                  }}
                  title={has ? cell.entries.map(e => e.game.name).join(', ') : undefined}
                >
                  <div className={`${styles.cellDate} ${cell.date.getDay() === 0 ? styles.sun : cell.date.getDay() === 6 ? styles.sat : ''}`.trim()}>
                    <span className={cell.isToday || isSelected ? styles.cellDateNum : undefined}>{cell.date.getDate()}</span>
                  </div>

                  {has && (
                    <div className={styles.cellDots}>
                      {dots.map((e, idx) => (
                        <span
                          key={`${e.game.id}-${e.kind}-${idx}`}
                          className={styles.cellDot}
                          style={{ background: CATEGORY_META[e.game.category].color, opacity: e.kind.endsWith('_end') ? 0.45 : 1 }}
                        />
                      ))}
                      {overflow > 0 && <span className={styles.cellDotMore}>+{overflow}</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {cells.every(c => c.entries.length === 0) && (
            <div className={styles.empty}>
              <div className={styles.emptyIcon} aria-hidden="true"><svg className="ic"><use href="#ic-calendar" /></svg></div>
              <p className={styles.emptyText}>{t ? t.noReleaseThisMonth : '이 달 출시 일정이 없어요.'}</p>
              <p className={styles.emptyHint}>{t ? t.swipeHint : '좌우로 밀거나 ‹ ›로 다른 달을 살펴보세요.'}</p>
            </div>
          )}

          <ul className={styles.legend}>
            {LEGEND_CATS.map(c => (
              <li key={c} className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: CATEGORY_META[c].color }} aria-hidden="true" />
                {CATEGORY_LABELS[lang][c]}
              </li>
            ))}
          </ul>
        </div>

        <aside className={styles.sidePanel}>
          <h3 className={styles.sidePanelTitle}>{panelTitle}</h3>
          <AnimatePresence mode="wait">
            {panelEntries.length === 0 && (eventsByDate.get(selectedISO) ?? []).length === 0 ? (
              <motion.div
                key={`empty-${selectedISO}`}
                className={styles.dayEmptyWrap}
                initial={{ opacity: 0, x: 14 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -14 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
              >
                <p className={styles.dayEmpty}>{t ? t.noScheduleThisDate : '이 날짜엔 일정이 없어요.'}</p>
                {nextEntries.length > 0 && (
                  <div className={styles.nextUp}>
                    <p className={styles.nextUpLabel}>{t ? t.nextSchedule : '다음 일정'}</p>
                    <div className={styles.scheduleGrid}>
                      {nextEntries.map(({ game: g, kind }) => (
                        <ScheduleCard key={`next-${g.id}-${kind}`} game={g} kind={kind} onPick={onPick} />
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key={`filled-${selectedISO}`}
                className={styles.scheduleGrid}
                initial={{ opacity: 0, x: 14 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -14 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
              >
                {(eventsByDate.get(selectedISO) ?? []).map((ev, idx) => (
                  <EventRow key={`ev-${idx}`} event={ev} />
                ))}
                {panelEntries.map(({ game: g, kind }) => (
                  <ScheduleCard key={`${g.id}-${kind}`} game={g} kind={kind} onPick={onPick} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </aside>
      </div>
    </section>
  );
}
