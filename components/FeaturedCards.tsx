'use client';
import { Fragment, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import type { Game, Category } from '@/lib/types';
import { CATEGORY_META } from '@/lib/types';
import { useLocale } from '@/hooks/useLocale';
import { CAL, UI, type Locale } from '@/lib/i18nLabels';
import styles from './FeaturedCards.module.css';

interface Props { games: Game[]; now: Date; variant?: 'hero' | 'list'; }

// 카드 표시용 정규화 데이터
interface CardData {
  key: string;
  href: string;
  external: boolean;
  imageUrl: string | null;
  badge: string;
  badgeColor: string;
  badgeTextColor: string;
  name: string;
  dateText: string;
  countdownLabel: string;
  targetMs: number | null;   // null이면 카운트다운 없이 fallbackText 표시
  fallbackText: string;
}

const CATS: Category[] = ['concert_tour', 'music_release', 'festival', 'fanmeeting'];

function pad(n: number): string { return String(n).padStart(2, '0'); }
function shortDate(iso: string): string { const [, m, d] = iso.split('-'); return `${m}.${d}`; }
function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// 선예매·일반예매 중 하나라도 "지금" 진행 중인지(시작함·아직 안 끝남) — 오늘 날짜 문자열과 비교.
function isActiveTicketing(g: Game, today: string): boolean {
  const phases: Array<[boolean | undefined, string | null | undefined, string | null | undefined]> = [
    [g.presale, g.presale_datetime, g.presale_end_datetime],
    [g.general_sale, g.general_sale_datetime, g.general_sale_end_datetime],
  ];
  return phases.some(([flag, start, end]) => {
    if (!flag) return false;
    const startDate = start ? start.slice(0, 10) : null;
    const endDate = end ? end.slice(0, 10) : null;
    if (startDate && startDate > today) return false;
    if (endDate && endDate < today) return false;
    return true;
  });
}

function gameToCard(game: Game, isPreReg: boolean, lang: Locale | null): CardData {
  const cat = CATEGORY_META[game.category];
  const tba = lang ? UI[lang].tba : '미정';
  const t = lang ? CAL[lang] : null;
  const ticketBadge = t ? (game.presale ? t.presaleTag : t.generalSaleTag) : (game.presale ? '선예매' : '일반예매');
  return {
    key: `game-${game.id}`,
    href: `/${lang ?? 'ko'}/concert/${game.id}`,
    external: false,
    imageUrl: game.image_url,
    badge: isPreReg ? ticketBadge : cat.short,
    badgeColor: isPreReg ? 'var(--accent-warm)' : cat.color,
    badgeTextColor: isPreReg ? 'var(--on-warm)' : '#fff',
    name: game.name,
    dateText: game.release_date_approx ? tba : shortDate(game.release_date),
    countdownLabel: lang === 'ko' ? '출시까지 남은 시간' : lang === 'en' ? 'Time until release' : '発売までの時間',
    targetMs: game.release_date_approx ? null : new Date(`${game.release_date}T00:00:00+09:00`).getTime(),
    fallbackText: tba,
  };
}

interface Parts { Days: number; Hours: number; Min: number; Sec: number; }
function useCountdown(targetMs: number | null): { mounted: boolean; parts: Parts | null } {
  const [mounted, setMounted] = useState(false);
  const [parts, setParts] = useState<Parts | null>(null);
  useEffect(() => {
    setMounted(true);
    if (targetMs == null) return;
    const tick = () => {
      const diff = targetMs - Date.now();
      if (diff <= 0) { setParts(null); return; }
      setParts({
        Days: Math.floor(diff / 86400000),
        Hours: Math.floor((diff % 86400000) / 3600000),
        Min: Math.floor((diff % 3600000) / 60000),
        Sec: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetMs]);
  return { mounted, parts };
}

function FeaturedCard({ data }: { data: CardData }) {
  const { mounted, parts } = useCountdown(data.targetMs);
  const [imgError, setImgError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  // 하이드레이션 전에 이미 로드 실패한 이미지는 onError가 안 잡히므로 마운트 시 직접 확인.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setImgError(true);
  }, [data.imageUrl]);
  const showTimer = data.targetMs != null && mounted && parts;
  const showSkeleton = data.targetMs != null && !mounted; // 마운트 전(카운트다운 대상 있음) → 스켈레톤

  const inner = (
    <>
      <div className={styles.head}>
        <div className={styles.thumb}>
          {data.imageUrl && !imgError ? (
            <>
              <img src={data.imageUrl} alt="" aria-hidden="true" className={styles.thumbBg} loading="lazy" />
              <img ref={imgRef} src={data.imageUrl} alt={data.name} className={styles.thumbFg} loading="lazy" onError={() => setImgError(true)} />
            </>
          ) : (
            <div className={styles.thumbPh}>
              <svg className={styles.phIcon} aria-hidden="true"><use href="#ic-image" /></svg>
            </div>
          )}
        </div>
        <div className={styles.info}>
          <span className={styles.badge} style={{ background: data.badgeColor, color: data.badgeTextColor }}>{data.badge}</span>
          <span className={styles.name}>{data.name}</span>
          <span className={styles.date}>{data.dateText}</span>
        </div>
      </div>

      <div className={styles.timerLabel}>
        <svg className="ic" aria-hidden="true"><use href="#ic-calendar" /></svg> {data.countdownLabel}
      </div>
      {showTimer ? (
        <div className={styles.timer}>
          {(Object.keys(parts) as (keyof Parts)[]).map((label, i) => (
            <Fragment key={label}>
              {i > 0 && <span className={styles.sep} aria-hidden="true">:</span>}
              <div className={styles.unit}>
                <span className={styles.num}>{pad(parts[label])}</span>
                <span className={styles.unitLabel}>{label}</span>
              </div>
            </Fragment>
          ))}
        </div>
      ) : showSkeleton ? (
        // 마운트 전에도 최종 카운트다운과 동일한 박스 그리드를 보여주고 숫자만 "--"로 채운다 —
        // 예전엔 반짝이는 스켈레톤 바였는데, 마운트 후 완전히 다른 모양(숫자 그리드)으로 바뀌는 게
        // 눈에 띄게 어색해서(page 열리자마자 "뭔가 보였다가 다른 게 뜬다") 모양 자체를 통일했다.
        <div className={styles.timer} aria-hidden="true">
          {(['Days', 'Hours', 'Min', 'Sec'] as const).map((label, i) => (
            <Fragment key={label}>
              {i > 0 && <span className={styles.sep}>:</span>}
              <div className={styles.unit}>
                <span className={styles.num}>--</span>
                <span className={styles.unitLabel}>{label}</span>
              </div>
            </Fragment>
          ))}
        </div>
      ) : (
        <div className={styles.mijeong}>{data.fallbackText}</div>
      )}
    </>
  );

  const cardStyle = { '--cat': data.badgeColor } as CSSProperties;
  return data.external
    ? <a href={data.href} target="_blank" rel="noopener" className={styles.card} style={cardStyle}>{inner}</a>
    : <Link href={data.href} className={styles.card} style={cardStyle}>{inner}</Link>;
}

// 서브페이지 사이드바 — 풀에서 중복 없이 최대 count개. 마운트 후 셔플은 SSR 결과와 달라서 진입 직후
// 카드가 눈에 띄게 바뀌는 깜빡임을 유발했던 원인이라 제거 — 항상 서버가 내려준 순서 그대로 렌더.
function ListCards({ pool, count }: { pool: CardData[]; count: number }) {
  const picked = pool.slice(0, count);
  if (picked.length === 0) return null;
  return (
    <div className={styles.cards}>
      {picked.map(c => <FeaturedCard key={c.key} data={c} />)}
    </div>
  );
}

// 카드 묶음 — hero(홈): 사전예약 + 리롤 1개 / list(서브페이지 사이드바): 풀에서 랜덤 4장(중복 없이)
export function FeaturedCards({ games, now, variant = 'hero' }: Props) {
  const lang = useLocale();
  const today = ymd(now);
  const notReleased = (g: Game) => g.release_date_approx || g.release_date >= today;

  // 티켓팅(선예매/일반예매) 진행 중인 게임 목록 → 진입 시 이 중 '랜덤 1개' 노출(고정 최신 아님)
  const preRegList = useMemo(() => games
    .filter(g => notReleased(g) && isActiveTicketing(g, today))
    .sort((a, b) => a.release_date.localeCompare(b.release_date)),
    [games, today]);

  // 진입 시 1회 랜덤(마운트 전엔 [0] → 서버/클라 동일, 하이드레이션 안전)
  const [preRegIdx, setPreRegIdx] = useState(0);
  useEffect(() => {
    if (preRegList.length === 0) return;
    setPreRegIdx(Math.floor(Math.random() * preRegList.length));
  }, [preRegList.length]);
  const preReg = preRegList.length > 0 ? preRegList[preRegIdx % preRegList.length] : undefined;

  // 카테고리별 '가장 임박한 출시' 1개씩 (상단 사전예약 카드와 중복 제외)
  const categoryItems = useMemo(() => CATS
    .map(c => games
      .filter(g => notReleased(g) && g.category === c && g.id !== preReg?.id)
      .sort((a, b) => a.release_date.localeCompare(b.release_date))[0])
    .filter((g): g is Game => Boolean(g))
    .map(g => gameToCard(g, false, lang)),
    [games, preReg?.id, today, lang]);

  const pool = categoryItems;

  // 진입 시 1회 랜덤 선택 (hero 전용)
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (variant !== 'hero' || pool.length === 0) return;
    setIdx(Math.floor(Math.random() * pool.length));
  }, [variant, pool.length]);

  if (!preReg && pool.length === 0) return null;

  // list: 풀(사전예약 + 카테고리별)에서 중복 없이 랜덤 4장
  if (variant === 'list') {
    const listPool = [
      ...(preReg ? [gameToCard(preReg, true, lang)] : []),
      ...categoryItems,
    ];
    return <ListCards pool={listPool} count={4} />;
  }

  // hero: 위=사전예약, 아래=리롤 1개
  const bottom = pool.length > 0 ? pool[idx % pool.length] : null;
  return (
    <div className={styles.cards}>
      {preReg && <FeaturedCard data={gameToCard(preReg, true, lang)} />}
      {bottom && <FeaturedCard key={bottom.key} data={bottom} />}
    </div>
  );
}
