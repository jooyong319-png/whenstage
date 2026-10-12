'use client';
import { useState } from 'react';
import { useFollow, followKey } from '@/hooks/useFollow';
import { useWishlist } from '@/hooks/useWishlist';
import { pushConfigured, pushSupported, subscribePush } from '@/lib/push';
import { showToast } from '@/lib/toast';
import { trackEvent } from '@/lib/analytics';
import type { Locale } from '@/lib/i18nLabels';

const TEXT: Record<Locale, {
  follow: string; following: string;
  on: (n: string) => string; off: (n: string) => string; noPush: (n: string) => string; denied: string;
}> = {
  ko: {
    follow: '팔로우', following: '팔로우 중',
    on: n => `${n} 팔로우했어요. 새 공연과 예매 오픈을 알려 드릴게요.`,
    off: n => `${n} 팔로우를 끊었어요.`,
    noPush: n => `${n} 팔로우했어요. 이 브라우저는 알림을 지원하지 않아요.`,
    denied: '팔로우했지만 알림 권한이 거부돼 알림은 가지 않아요.',
  },
  en: {
    follow: 'Follow', following: 'Following',
    on: n => `Following ${n}. We'll tell you about new shows and ticket sales.`,
    off: n => `Unfollowed ${n}.`,
    noPush: n => `Following ${n}. This browser does not support notifications.`,
    denied: 'Followed, but notifications are blocked, so alerts won’t arrive.',
  },
  ja: {
    follow: 'フォロー', following: 'フォロー中',
    on: n => `${n}をフォローしました。新しい公演と発売開始をお知らせします。`,
    off: n => `${n}のフォローを解除しました。`,
    noPush: n => `${n}をフォローしました。このブラウザは通知に対応していません。`,
    denied: 'フォローしましたが、通知がブロックされているため通知は届きません。',
  },
};

/**
 * "이 가수 팔로우" (2026-10-13). 누르는 순간 팔로우 + 알림 구독을 같이 한다 —
 * 팔로우했는데 브라우저 알림이 꺼져 있으면 아무것도 안 오니, 버튼이 약속하는 걸 지키려면 둘이 한 동작이어야 한다
 * (TicketAlertButton과 같은 이유). 구독을 먼저 하고 팔로우를 나중에 한다.
 */
export function FollowButton({ lang, artistKey, artistName, size = 'md' }: {
  lang: Locale; artistKey: string; artistName: string; size?: 'sm' | 'md';
}) {
  const t = TEXT[lang];
  const follow = useFollow();
  const wishlist = useWishlist();
  const key = followKey(lang, artistKey);
  const on = follow.has(key);
  const [busy, setBusy] = useState(false);

  const onClick = async () => {
    if (on) { follow.toggle(key); showToast(t.off(artistName)); return; }
    if (!pushConfigured() || !pushSupported()) {
      follow.toggle(key);
      showToast(t.noPush(artistName), 4000);
      return;
    }
    setBusy(true);
    const r = await subscribePush([...wishlist.ids]);
    setBusy(false);
    follow.toggle(key);
    if (r === 'ok') {
      trackEvent('notify_enable', { source: 'follow_artist', item: key });
      showToast(t.on(artistName), 3500);
    } else if (r === 'denied') {
      showToast(t.denied, 4500);
    } else {
      showToast(t.noPush(artistName), 4000);
    }
  };

  return (
    <button
      type="button"
      className={`follow-btn follow-btn-${size} ${on ? 'is-following' : ''}`}
      onClick={onClick}
      aria-pressed={on}
      disabled={busy}
    >
      <svg className="ic" aria-hidden="true"><use href={on ? '#ic-bell' : '#ic-star'} /></svg>
      {on ? t.following : t.follow}
    </button>
  );
}
