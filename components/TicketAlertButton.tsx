'use client';
import { useEffect, useState } from 'react';
import { useWishlist } from '@/hooks/useWishlist';
import { pushConfigured, pushSupported, subscribePush, getCurrentSubscription } from '@/lib/push';
import { showToast } from '@/lib/toast';
import { trackEvent } from '@/lib/analytics';
import { useLocale } from '@/hooks/useLocale';
import { CAL } from '@/lib/i18nLabels';

/**
 * 공연 상세의 "예매 알림 받기" (2026-10-13).
 *
 * 알림은 "찜한 공연의 선예매·일반예매 오픈" 때 간다(app/api/cron/notify). 그런데 찜만 하고
 * 브라우저 알림을 안 켜 두면 **아무것도 안 온다** — 버튼 이름이 "알림 받기"인데 그러면 거짓말이다.
 * 그래서 누르는 순간 찜 + 알림 구독을 같이 한다. 이 클릭 자체가 알림에 대한 명시적 동의다.
 * 알림을 지원하지 않는 브라우저(iOS 사파리 일반 탭 등)는 찜만 되고, 그 사실을 알린다.
 */
export function TicketAlertButton({ id }: { id: string }) {
  const lang = useLocale();
  const t = lang ? CAL[lang] : null;
  const wishlist = useWishlist();
  const wished = wishlist.has(id);
  // 이 브라우저에 알림 구독이 있는지 — null = 아직 모름(첫 렌더·SSR)
  // 🔴 예전엔 '켜짐 = 찜'이었다. 하트로 찜만 하고 알림은 안 켠 사람에게도 "알림 받는 중"이 떴고,
  //    누르면 알림이 켜지는 게 아니라 찜이 풀렸다(Codex 점검 2026-11-04).
  const [subscribed, setSubscribed] = useState<boolean | null>(null);
  useEffect(() => {
    let alive = true;
    if (!pushConfigured() || !pushSupported()) { setSubscribed(false); return; }
    getCurrentSubscription().then(s => { if (alive) setSubscribed(!!s); }).catch(() => { if (alive) setSubscribed(false); });
    return () => { alive = false; };
  }, []);
  // 알림을 못 쓰는 브라우저는 찜이 곧 할 수 있는 전부라 찜 기준으로 표시
  const canPush = pushConfigured() && pushSupported();
  const on = wished && (!canPush || subscribed !== false);
  const [busy, setBusy] = useState(false);

  const onClick = async () => {
    if (on) { wishlist.toggle(id); return; }        // 끄기는 찜 해제만(다른 공연 알림은 그대로)
    if (!pushConfigured() || !pushSupported()) {
      wishlist.toggle(id);
      showToast(t ? t.notifyUnsupportedSaved : '찜했어요. 이 브라우저는 알림을 지원하지 않아요.', 4000);
      return;
    }
    // 구독을 **먼저** 하고 찜은 나중에 — 찜 토글은 권한이 '미결정'이면 "알림 켤까요?" 토스트를 띄운다
    // (hooks/useWishlist nudgeNotify). 여기서 권한을 먼저 정해 두면 그 안내가 겹쳐 뜨지 않는다.
    setBusy(true);
    const ids = wished ? [...wishlist.ids] : [...wishlist.ids, id];
    const r = await subscribePush(ids);
    setBusy(false);
    if (!wished) wishlist.toggle(id);   // 이미 찜한 공연이면 찜은 그대로 두고 알림만 켠다
    if (r === 'ok') {
      setSubscribed(true);
      trackEvent('notify_enable', { source: 'ticket_alert', game_id: id });
      showToast(t ? t.ticketAlertOnToast : '예매가 열리면 알려 드릴게요');
    } else if (r === 'denied') {
      showToast(t ? t.notifyDeniedToast : '알림 권한이 거부됐어요', 4000);
    } else {
      showToast(t ? t.notifyUnsupportedSaved : '찜했어요. 이 브라우저는 알림을 지원하지 않아요.', 4000);
    }
  };

  return (
    <button
      type="button"
      className={`ticket-alert-btn ${on ? 'is-wished' : ''}`}
      onClick={onClick}
      aria-pressed={on}
      disabled={busy}
    >
      <svg className="ic" aria-hidden="true"><use href="#ic-bell" /></svg>
      {t ? (on ? t.ticketAlertOn : t.ticketAlert) : (on ? '예매 알림 받는 중' : '예매 알림 받기')}
    </button>
  );
}
