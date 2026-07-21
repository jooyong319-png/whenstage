'use client';
import { useState } from 'react';
import { showToast } from '@/lib/toast';
import styles from './CalendarSubscribe.module.css';

const ICS_WEBCAL = 'webcal://whenstage.com/calendar.ics';
const GOOGLE_ADD = 'https://calendar.google.com/calendar/u/0/r?cid=webcal%3A%2F%2Fwhenstage.com%2Fcalendar.ics';

export function CalendarSubscribe() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(ICS_WEBCAL);
      setCopied(true);
      showToast('구독 링크를 복사했어요');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('복사에 실패했어요');
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.head}>
        <span className={styles.icon} aria-hidden="true"><svg className="ic"><use href="#ic-calendar" /></svg></span>
        <div>
          <strong className={styles.title}>캘린더 구독</strong>
          <span className={styles.sub}>출시 일정을 내 캘린더에서 바로</span>
        </div>
      </div>
      <p className={styles.desc}>한 번 구독하면 새 게임이 추가될 때마다 내 구글·애플 캘린더에 자동으로 반영돼요.</p>
      <a className={styles.primary} href={GOOGLE_ADD} target="_blank" rel="noopener">Google 캘린더에 추가</a>
      <button type="button" className={styles.secondary} onClick={copy}>
        {copied ? '복사됨' : '구독 링크 복사 (애플 등)'}
      </button>
    </div>
  );
}
