'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'motion/react';
import type { Game } from '@/lib/types';
import { CATEGORY_META } from '@/lib/types';
import { calcDayDiff, formatShortDate } from '@/lib/utils';
import type { Locale } from '@/lib/i18nLabels';
import styles from './Home.module.css';

interface Props {
  slides: Game[];                        // 히어로에 순환할 대형 공연들(이미지 보유, 최대 5)
  cardImages: Record<string, string>;
  tickerItems: Game[];
  now: Date;
  lang: Locale;
  heroTitle: string;                     // 가치 제안 킥커(SEO h1)
  heroSubtitle: string;                  // 티커 없을 때 폴백 문구
}

const AUTO_MS = 6000;

// 홈 히어로 — 시네마틱 스포트라이트 캐러셀. 상위 대형 공연 이미지를 배경으로 자동 순환하고,
// 그 위에 "지금 주목"(공연명·D-day·날짜·카테고리)을 얹는다. 호버/포커스 시 정지, 좌우·도트 조작,
// prefers-reduced-motion이면 자동 전환 없이 수동 조작만. 슬라이드가 없으면 기존 글로우 히어로.
export function HeroSpotlight({ slides, cardImages, tickerItems, now, lang, heroTitle, heroSubtitle }: Props) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const hasCarousel = slides.length > 1;
  const cine = slides.length > 0;

  const spotlightLabel = lang === 'en' ? 'Spotlight' : lang === 'ja' ? '注目の公演' : '지금 주목';
  const prevLabel = lang === 'en' ? 'Previous' : lang === 'ja' ? '前へ' : '이전';
  const nextLabel = lang === 'en' ? 'Next' : lang === 'ja' ? '次へ' : '다음';

  const go = useCallback((dir: number) => {
    setActive(a => (a + dir + slides.length) % slides.length);
  }, [slides.length]);

  // active가 슬라이드 수 범위를 벗어나지 않게(데이터 갱신 대비)
  useEffect(() => {
    if (active >= slides.length) setActive(0);
  }, [slides.length, active]);

  // 자동 전환 — 정지 상태거나 reduced-motion이면 멈춤
  const reduceRef = useRef(false);
  useEffect(() => {
    reduceRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);
  useEffect(() => {
    if (!hasCarousel || paused || reduceRef.current) return;
    const t = setInterval(() => setActive(a => (a + 1) % slides.length), AUTO_MS);
    return () => clearInterval(t);
  }, [hasCarousel, paused, slides.length]);

  const cur = cine ? slides[Math.min(active, slides.length - 1)] : null;
  const curCat = cur ? CATEGORY_META[cur.category] : null;
  const curDiff = cur ? calcDayDiff(cur.release_date, now) : 0;
  const curDday = curDiff <= 0 ? 'D-DAY' : `D-${curDiff}`;

  return (
    <motion.section
      className={`${styles.hero} ${cine ? styles.heroCine : ''}`}
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {cine && (
        <div className={styles.heroBackdrop} aria-hidden="true">
          {/* 모든 슬라이드 이미지를 겹쳐 두고 opacity로 크로스페이드 → 전환 시 로딩 깜빡임 없음 */}
          {slides.map((g, i) => (
            <img
              key={g.id}
              src={cardImages[g.id]}
              alt=""
              className={styles.heroBackdropImg}
              style={{ opacity: i === active ? 1 : 0 }}
              loading={i === 0 ? 'eager' : 'lazy'}
            />
          ))}
          <span className={styles.heroBackdropVeil} />
        </div>
      )}

      {[styles.heroBlobA, styles.heroBlobB, styles.heroBlobC, styles.heroBlobD, styles.heroBlobE].map((cls, i) => (
        <motion.span
          key={i}
          className={`${styles.heroBlob} ${cls}`}
          aria-hidden="true"
          animate={{
            x: [0, i % 2 ? -18 : 18, i % 2 ? 12 : -12, 0],
            y: [0, i % 2 ? 14 : -14, i % 2 ? -10 : 12, 0],
          }}
          transition={{ duration: 11 + i * 1.2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
        />
      ))}

      {hasCarousel && (
        <div className={styles.heroControls}>
          <button type="button" className={styles.heroArrow} onClick={() => go(-1)} aria-label={prevLabel}>‹</button>
          <div className={styles.heroDots} role="tablist" aria-label={spotlightLabel}>
            {slides.map((g, i) => (
              <button
                key={g.id}
                type="button"
                role="tab"
                aria-selected={i === active}
                aria-label={`${i + 1} / ${slides.length}`}
                className={`${styles.heroDot} ${i === active ? styles.heroDotOn : ''}`}
                onClick={() => setActive(i)}
              />
            ))}
          </div>
          <button type="button" className={styles.heroArrow} onClick={() => go(1)} aria-label={nextLabel}>›</button>
        </div>
      )}

      <div className={styles.heroInner}>
        <h1 className={styles.heroTitle}>{heroTitle}</h1>
        {cur && curCat && (
          <a key={cur.id} href={`/${lang}/concert/${cur.id}`} className={styles.spotlight}>
            <span className={styles.spotlightEyebrow}>
              <svg className="ic" aria-hidden="true"><use href="#ic-flame" /></svg>
              {spotlightLabel}
            </span>
            <span className={styles.spotlightName}>{cur.name}</span>
            <span className={styles.spotlightMeta}>
              <span className={styles.spotlightDday} style={{ color: curCat.color }}>{curDday}</span>
              <span className={styles.spotlightSep} aria-hidden="true">·</span>
              <span className={styles.spotlightDate}>{formatShortDate(cur.release_date)}</span>
              <span className={styles.spotlightBadge} style={{ background: curCat.color }}>{curCat.short}</span>
            </span>
          </a>
        )}
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
          <p className={styles.heroSubtitle}>{heroSubtitle}</p>
        )}
      </div>
    </motion.section>
  );
}
