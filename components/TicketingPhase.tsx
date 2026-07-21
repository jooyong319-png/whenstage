'use client';
import { Fragment, useEffect, useState } from 'react';
import { useLocale } from '@/hooks/useLocale';
import { CAL } from '@/lib/i18nLabels';
import { formatEventDateTime } from '@/lib/utils';
import styles from './PreRegCountdown.module.css';

interface Props {
  label: string;                    // '선예매' / '일반예매' 등 이 구간의 이름
  startDateTime?: string | null;    // ISO 8601(오프셋 포함)
  endDateTime?: string | null;
  timezone: string;
}

interface Parts { Days: number; Hours: number; Min: number; Sec: number; }

function pad(n: number): string { return String(n).padStart(2, '0'); }

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

// 티켓팅 한 구간(선예매 또는 일반예매)의 카운트다운 — 시작 전이면 '시작까지', 시작했고
// 마감이 있으면 '마감까지'를 보여준다. 마감이 없으면(매진 시까지 판매) 안내 문구만 표시.
// 시각은 항상 그 공연의 timezone 기준으로 표기해 뷰어의 브라우저 시간대와 무관하게 정확하다.
export function TicketingPhase({ label, startDateTime, endDateTime, timezone }: Props) {
  const lang = useLocale();
  const t = CAL[lang];

  const startMs = startDateTime ? new Date(startDateTime).getTime() : null;
  const endMs = endDateTime ? new Date(endDateTime).getTime() : null;
  const notStartedYet = startMs != null && Date.now() < startMs;
  const targetMs = notStartedYet ? startMs : endMs;

  const { mounted, parts } = useCountdown(targetMs);
  const ended = endMs != null && Date.now() >= endMs && !notStartedYet;
  const showTimer = targetMs != null && mounted && parts;
  const showSkeleton = targetMs != null && !mounted;

  const startLabel = startDateTime ? formatEventDateTime(startDateTime, timezone, lang) : null;

  return (
    <section className={styles.box} aria-label={t.ticketingInfo}>
      <div className={styles.head}>
        <span className={styles.live}><span className={styles.dot} aria-hidden="true" /> {label}</span>
        {startLabel && <span className={styles.start}>{startLabel}</span>}
      </div>

      {showTimer ? (
        <>
          <div className={styles.grid}>
            {(Object.keys(parts) as (keyof Parts)[]).map((k, i) => (
              <Fragment key={k}>
                {i > 0 && <span className={styles.sep} aria-hidden="true">:</span>}
                <div className={styles.unit}>
                  <span className={styles.num}>{pad(parts[k])}</span>
                  <span className={styles.label}>{k}</span>
                </div>
              </Fragment>
            ))}
          </div>
          <p className={styles.caption}>{notStartedYet ? label : t.ticketingTimeLeft}</p>
        </>
      ) : showSkeleton ? (
        <div className={styles.timerSkeleton} aria-hidden="true" />
      ) : (
        <p className={styles.deadline}>{ended ? t.ticketingClosedText : t.ticketingDeadlineTba}</p>
      )}
    </section>
  );
}
