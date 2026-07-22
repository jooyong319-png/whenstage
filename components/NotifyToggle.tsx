'use client';
import { useEffect, useRef, useState } from 'react';
import { useWishlist } from '@/hooks/useWishlist';
import { pushConfigured, pushSupported, getCurrentSubscription, subscribePush, unsubscribePush, getLastPushError } from '@/lib/push';
import { showToast } from '@/lib/toast';
import { useLocale } from '@/hooks/useLocale';
import { CAL } from '@/lib/i18nLabels';
import styles from './NotifyToggle.module.css';

type State = 'loading' | 'on' | 'off' | 'denied' | 'hidden';

export function NotifyToggle() {
  const lang = useLocale();
  const t = lang ? CAL[lang] : null;
  const wishlist = useWishlist();
  const idsRef = useRef(wishlist.ids);
  idsRef.current = wishlist.ids; // 항상 최신 찜 목록 유지(재구독 시 game_ids로 사용)
  const [state, setState] = useState<State>('loading');

  useEffect(() => {
    if (!pushConfigured() || !pushSupported()) { setState('hidden'); return; }
    if (Notification.permission === 'denied') { setState('denied'); return; }
    (async () => {
      try {
        const sub = await getCurrentSubscription();
        if (sub) { setState('on'); return; }
        // 권한은 허용돼 있는데 구독이 유실됨(TWA 재시작 등) → 조용히 재구독해 ON 유지 + 410 방지
        if (Notification.permission === 'granted') {
          const r = await subscribePush([...idsRef.current]);
          setState(r === 'ok' ? 'on' : 'off');
        } else {
          setState('off');
        }
      } catch {
        setState('off');
      }
    })();
  }, []);

  if (state === 'hidden') return null;

  const onToggle = async () => {
    if (state === 'on') {
      setState('loading');
      await unsubscribePush();
      setState('off');
      showToast(t ? t.notifyOffToast : '출시 알림을 껐어요');
      return;
    }
    setState('loading');
    const r = await subscribePush([...wishlist.ids]);
    if (r === 'ok') { setState('on'); showToast(t ? t.notifyOnToast : '출시 알림을 켰어요'); }
    else if (r === 'denied') { setState('denied'); showToast(t ? t.notifyDeniedToast : '알림 권한이 거부됐어요'); }
    else {
      setState('off');
      const reason = getLastPushError() ?? (t ? t.notifyUnknownError : '알 수 없음');
      showToast(t ? t.notifyFailToast(reason) : `알림 실패: ${reason}`, 5000);
    }
  };

  const disabled = state === 'loading' || state === 'denied';

  return (
    <div className={styles.box}>
      <span className={styles.icon} aria-hidden="true">
        <svg className="ic"><use href="#ic-bell" /></svg>
      </span>
      <div className={styles.text}>
        <strong>{t ? t.notifyTitle : '출시 알림'}</strong>
        <span className={styles.sub}>
          {state === 'denied'
            ? (t ? t.notifyDeniedSub : '브라우저 설정에서 알림을 허용해 주세요.')
            : (t ? t.notifyNormalSub : '찜한 일정 하루 전·당일에 알려드려요.')}
        </span>
      </div>
      <button
        type="button"
        className={`${styles.switch} ${state === 'on' ? styles.on : ''}`}
        onClick={onToggle}
        disabled={disabled}
        aria-pressed={state === 'on'}
        aria-label={t ? t.notifyToggleAria : '출시 알림 토글'}
      >
        <span className={styles.knob} />
      </button>
    </div>
  );
}
