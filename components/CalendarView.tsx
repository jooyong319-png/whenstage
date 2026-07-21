'use client';
import { useMemo, useState, useEffect, useRef, type CSSProperties } from 'react';
import type { Category, Game, CalEvent, FilterKey } from '@/lib/types';
// (Category는 셀 색에 CATEGORY_META로만 사용)
import { CATEGORY_META } from '@/lib/types';
import { calcDayDiff, formatShortDate } from '@/lib/utils';
import { CategoryFilterBar } from './CategoryFilterBar';
import { GameRow } from './GameRow';
import { EventRow } from './EventRow';
import { useLocale } from '@/hooks/useLocale';
import { CAL, CATEGORY_LABELS, type Locale } from '@/lib/i18nLabels';
import styles from './CalendarView.module.css';

const LEGEND_CATS: Category[] = ['concert_tour', 'music_release', 'festival', 'fanmeeting'];

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

// 캘린더 셀 위의 한 개 표기 = 게임 1개 × 유형(출시 / 선예매 시작·마감 / 일반예매 시작·마감)
type CalKind = 'release' | 'presale' | 'presale_end' | 'general_sale' | 'general_sale_end';
interface CalEntry { game: Game; kind: CalKind; }
// 셀 소형 태그 · 상세 패널 배지 · 지난 날짜 라벨 (release는 태그/배지 없음)
function kindTag(lang: Locale): Record<CalKind, string> {
  const t = CAL[lang];
  return { release: '', presale: t.presaleTag, presale_end: t.deadlineTag, general_sale: t.generalSaleTag, general_sale_end: t.deadlineTag };
}
function kindBadge(lang: Locale): Record<CalKind, string> {
  const t = CAL[lang];
  return { release: '', presale: t.presaleStartBadge, presale_end: t.presaleEndBadge, general_sale: t.generalSaleStartBadge, general_sale_end: t.generalSaleEndBadge };
}
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
  const addEntry = (date: string | null | undefined, game: Game, kind: CalKind) => {
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

export function CalendarView({ cursor, onCursorChange, games, events = [], wishlist, onPick, now, category, onCategory }: Props) {
  const lang = useLocale();
  const t = CAL[lang];
  const KIND_TAG = useMemo(() => kindTag(lang), [lang]);
  const KIND_BADGE = useMemo(() => kindBadge(lang), [lang]);
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
  const [selectedISO, setSelectedISO] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  // 사용자 클릭 선택에만 패널로 스크롤(진입 자동선택은 점프 안 함)
  const scrollOnSelect = useRef(false);
  // 직전 커서 연-월. 첫 실행(mount)·동일 월 갱신은 선택 유지, 실제 월 이동에만 해제
  const prevYMRef = useRef<string | null>(null);
  // 사용자가 날짜를 직접 클릭했는지 — 클릭 전까진 '오늘' 자동 선택 유지
  const userSelected = useRef(false);

  // 달이 바뀌면 선택 해제 — 단 첫 실행과 '같은 월' 재갱신(Home mount의 이번 달 교체)은 유지
  useEffect(() => {
    const ym = `${cursor.getFullYear()}-${cursor.getMonth()}`;
    if (prevYMRef.current === null) { prevYMRef.current = ym; return; }
    if (prevYMRef.current !== ym) { prevYMRef.current = ym; setSelectedISO(null); }
  }, [cursor]);

  // 진입 시 기본으로 '오늘' 패널 열기 (사용자 클릭 전 + 오늘이 보고 있는 달에 있을 때, 스크롤 점프 없이)
  useEffect(() => {
    if (userSelected.current) return;
    const inMonth = now.getFullYear() === cursor.getFullYear() && now.getMonth() === cursor.getMonth();
    if (inMonth) setSelectedISO(toISO(now));
  }, [now, cursor]);

  // 패널 표시 시 스크롤 — 사용자 클릭 선택에만(초기 자동선택 제외)
  useEffect(() => {
    if (selectedISO && scrollOnSelect.current && panelRef.current) {
      panelRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    scrollOnSelect.current = false;
  }, [selectedISO]);

  // 월 전환 방향(슬라이드 애니메이션용)
  const [slideDir, setSlideDir] = useState<'next' | 'prev'>('next');
  const prev = () => { setSlideDir('prev'); const d = new Date(cursor); d.setMonth(d.getMonth() - 1); onCursorChange(d); };
  const next = () => { setSlideDir('next'); const d = new Date(cursor); d.setMonth(d.getMonth() + 1); onCursorChange(d); };
  const today = () => { const d = new Date(); d.setDate(1); setSlideDir(d < cursor ? 'prev' : 'next'); onCursorChange(d); };

  // 좌우 스와이프로 이전/다음 달 이동(앱·모바일 제스처)
  const swipeRef = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    swipeRef.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const s = swipeRef.current;
    swipeRef.current = null;
    if (!s) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - s.x;
    const dy = t.clientY - s.y;
    // 충분히 가로로 움직였고 세로 스크롤이 아닐 때만
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0) next();
      else prev();
    }
  };

  function onCellClick(cell: Cell) {
    userSelected.current = true; // 사용자가 직접 날짜 선택 → 자동 '오늘' 유지 해제
    scrollOnSelect.current = true; // 사용자 클릭 → 패널로 스크롤 허용
    if (!cell.inMonth) {
      // 인접월 셀: 그 달로 점프 + 그 날짜 선택
      onCursorChange(new Date(cell.date.getFullYear(), cell.date.getMonth(), 1));
      setSelectedISO(cell.iso);
      return;
    }
    // 출시 유무와 관계없이 모든 셀 클릭 가능 → 그 날짜 이후 게임 패널 표시
    setSelectedISO(prev => prev === cell.iso ? null : cell.iso);
  }

  // day-detail-panel: 선택한 "그 날짜"의 출시 + 사전예약 시작 표기
  const panelEntries = useMemo<CalEntry[]>(() => {
    if (!selectedISO) return [];
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

  return (
    <section className={styles.view}>
      <CategoryFilterBar category={category} onCategory={onCategory} className={styles.calCatBar} />
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
          const showName = has && cell.inMonth;
          const firstEntry = cell.entries[0];
          const firstGame = firstEntry?.game;
          const dots = cell.entries.slice(0, 3);
          const overflow = cell.entries.length - 3;
          const isSelected = selectedISO === cell.iso;
          const isClickable = true; // 모든 셀 클릭 가능 (출시 없는 날도 '이후 출시' 패널 표시)

          return (
            <div
              key={i}
              style={has && firstGame ? ({ '--cat': CATEGORY_META[firstGame.category].color } as CSSProperties) : undefined}
              className={[
                styles.cell,
                !cell.inMonth ? styles.cellOther : '',
                cell.isToday ? styles.cellToday : '',
                has ? styles.cellHas : '',
                isSelected ? styles.cellSelected : '',
                isClickable ? styles.cellClickable : '',
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
              title={has ? cell.entries.map(e => KIND_TAG[e.kind] ? `${e.game.name} (${KIND_TAG[e.kind]})` : e.game.name).join(', ') : undefined}
            >
              <div className={`${styles.cellDate} ${cell.date.getDay() === 0 ? styles.sun : cell.date.getDay() === 6 ? styles.sat : ''}`.trim()}>
                {cell.isToday
                  ? <span className={styles.cellTodayNum}>{cell.date.getDate()}</span>
                  : cell.date.getDate()}
              </div>

              {showName && firstGame && (
                <div className={styles.cellName}>
                  {firstGame.name}
                  {KIND_TAG[firstEntry.kind] && <span className={styles.cellPreTag}>{KIND_TAG[firstEntry.kind]}</span>}
                  {cell.entries.length > 1 && <span className={styles.cellMore}>+{cell.entries.length - 1}</span>}
                </div>
              )}

              {has && (
                <div className={styles.cellDots}>
                  {dots.map((e, idx) => {
                    const c = CATEGORY_META[e.game.category].color;
                    return (
                      <span
                        key={`${e.game.id}-${e.kind}-${idx}`}
                        className={styles.cellDot}
                        style={e.kind === 'release'
                          ? { background: c }
                          : { background: 'transparent', boxShadow: `inset 0 0 0 2px ${c}`, opacity: e.kind.endsWith('_end') ? 0.5 : 1 }} // 선예매/일반예매 = 속 빈 링(마감은 흐리게)
                        title={KIND_TAG[e.kind] ? `${e.game.name} (${KIND_TAG[e.kind]})` : e.game.name}
                      />
                    );
                  })}
                  {overflow > 0 && <span className={styles.cellDotMore}>+{overflow}</span>}
                </div>
              )}

              {eventsByDate.has(cell.iso) && cell.inMonth && (
                <div className={styles.cellEvents}>
                  {eventsByDate.get(cell.iso)!.slice(0, 2).map((ev, idx) => (
                    <span key={idx} className={styles.cellEvent} style={{ '--ev': ev.color } as CSSProperties} title={ev.label}>
                      {ev.label}
                    </span>
                  ))}
                  {eventsByDate.get(cell.iso)!.length > 2 && (
                    <span className={styles.cellEventMore}>+{eventsByDate.get(cell.iso)!.length - 2}</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 색상 범례 — 셀 점·이벤트 칩에 쓰인 카테고리·이벤트 색이 뭘 뜻하는지 안내 */}
      <div className={styles.legend}>
        <div className={styles.legendGroup}>
          {LEGEND_CATS.map(c => (
            <span key={c} className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: CATEGORY_META[c].color }} aria-hidden="true" />
              {lang ? CATEGORY_LABELS[lang][c] : CATEGORY_META[c].short}
            </span>
          ))}
        </div>
      </div>

      {cells.every(c => c.entries.length === 0) && (
        <div className={styles.empty}>
          <div className={styles.emptyIcon} aria-hidden="true"><svg className="ic"><use href="#ic-calendar" /></svg></div>
          <p className={styles.emptyText}>{t ? t.noReleaseThisMonth : '이 달 출시 일정이 없어요.'}</p>
          <p className={styles.emptyHint}>{t ? t.swipeHint : '좌우로 밀거나 ‹ ›로 다른 달을 살펴보세요.'}</p>
        </div>
      )}

      {/* day-detail-panel: 셀 클릭 시 그 날짜 이후 출시 게임 리스트 */}
      {selectedISO && (
        <div ref={panelRef} className={styles.dayPanel}>
          <header className={styles.dayPanelHeader}>
            <h3 className={styles.dayPanelTitle}>
              {formatShortDate(selectedISO)} ({t!.weekdays[new Date(selectedISO).getDay()]})
            </h3>
            <button
              type="button"
              className={styles.dayPanelClose}
              onClick={() => setSelectedISO(null)}
              aria-label={t ? t.closePanel : '패널 닫기'}
            >×</button>
          </header>
          <div className={styles.dayPanelList}>
            {panelEntries.length === 0 && (eventsByDate.get(selectedISO) ?? []).length === 0 ? (
              <p className={styles.dayEmpty}>{t ? t.noScheduleThisDate : '이 날짜엔 일정이 없어요.'}</p>
            ) : (
              <ul className={styles.dayGameList}>
                {(eventsByDate.get(selectedISO) ?? []).map((ev, idx) => (
                  <EventRow key={`ev-${idx}`} event={ev} />
                ))}
                {panelEntries.map(({ game: g, kind }) => (
                  <GameRow
                    key={`${g.id}-${kind}`}
                    game={g}
                    now={now}
                    wishlist={wishlist}
                    onPick={onPick}
                    preBadge={KIND_BADGE[kind] || undefined}
                  />
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
