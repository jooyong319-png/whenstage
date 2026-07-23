'use client';
import { useEffect, useRef, useState } from 'react';
import { useWishlist } from '@/hooks/useWishlist';
import { pushConfigured, pushSupported, getCurrentSubscription, subscribePush, unsubscribePush, isEndpointRegistered, isNotifyOptedOut, markNotifyOptedOut, getLastPushError } from '@/lib/push';
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
        if (sub) {
          // 브라우저에 구독 객체가 남아있어도, 서버(DB)에 실제로 등록돼 있어야 알림이 실제로
          // 온다 — 예전에 끄기를 눌렀는데 브라우저 쪽 unsubscribe()가 조용히 실패해서 DB만
          // 지워지고 브라우저 구독은 남아있던 경우, 여기서 걸러서 진짜로 정리한다.
          if (await isEndpointRegistered(sub.endpoint)) { setState('on'); return; }
          await sub.unsubscribe().catch(() => {});
          markNotifyOptedOut(); // DB에 없는 상태는 "구독 없음"으로 취급 — 다음에 다시 켤 땐 토글을 명시적으로 눌러야 함
          setState('off');
          return;
        }
        // 권한(permission)은 끄기 눌러도 grant된 채로 남기 때문에, "권한 있음 + 구독 없음"만으론
        // "방금 사용자가 껐다"와 "구독이 우연히 유실됐다(TWA 재시작 등)"를 구분할 수 없다 —
        // isNotifyOptedOut()으로 명시적으로 끈 적이 있는지 먼저 확인해야 끄기 직후 새로고침
        // 했을 때 자동으로 다시 켜버리는 걸 막을 수 있다.
        if (Notification.permission === 'granted' && !isNotifyOptedOut()) {
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
