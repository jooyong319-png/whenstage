'use client';
import { useCallback, useSyncExternalStore } from 'react';
import { showToast } from '@/lib/toast';
import { CAL, type Locale } from '@/lib/i18nLabels';
import { pushSupported, pushConfigured, isNotifyOptedOut, subscribePush } from '@/lib/push';
import { trackEvent } from '@/lib/analytics';

const KEY = 'whenstage.wishlist.v1';
const NUDGE_KEY = 'whenstage.notify.nudge.v1';

// 첫 찜 후 "알림 켜기" 유도 문구(로케일별) — <html lang>에서 현재 로케일을 읽는다.
const NUDGE_COPY: Record<string, { msg: string; action: string; ok: string; denied: string; fail: string }> = {
  ko: { msg: '⭐ 찜했어요! 공연 전에 알려드릴까요?', action: '알림 켜기', ok: '알림을 켰어요 🔔', denied: '알림 권한이 거부됐어요', fail: '알림 설정에 실패했어요' },
  en: { msg: '⭐ Saved! Want a reminder before the show?', action: 'Turn on', ok: 'Notifications on 🔔', denied: 'Notification permission denied', fail: 'Couldn’t enable notifications' },
  ja: { msg: '⭐ 保存しました！公演前にお知らせしますか？', action: 'オンにする', ok: '通知をオンにしました 🔔', denied: '通知が拒否されました', fail: '通知の設定に失敗しました' },
};

// 찜 알림 유도 토스트를 띄울 조건 — 아직 안 봤고, 푸시 지원/설정됐고, 명시적으로 끈 적 없고,
// 알림 권한이 아직 "미결정"(default)일 때만. 이미 켰거나(granted)/거부(denied)면 안 띄운다.
function shouldNudgeNotify(): boolean {
  try { if (localStorage.getItem(NUDGE_KEY)) return false; } catch { return false; }
  if (!pushSupported() || !pushConfigured()) return false;
  if (isNotifyOptedOut()) return false;
  if (typeof Notification === 'undefined' || Notification.permission !== 'default') return false;
  return true;
}

function nudgeNotify(ids: string[]): void {
  try { localStorage.setItem(NUDGE_KEY, '1'); } catch { /* ignore */ }
  const lang = (typeof document !== 'undefined' && document.documentElement.lang) || 'ko';
  const c = NUDGE_COPY[lang] ?? NUDGE_COPY.ko;
  showToast(c.msg, 7000, {
    label: c.action,
    onClick: async () => {
      const r = await subscribePush(ids);
      if (r === 'ok') trackEvent('notify_enable', { source: 'wishlist_nudge' });
      showToast(r === 'ok' ? c.ok : r === 'denied' ? c.denied : c.fail, r === 'ok' ? 2200 : 3500);
    },
  });
}

// ── 모듈 레벨 싱글톤 store ──
// useWishlist를 어디서 몇 번 호출하든 동일 스냅샷을 공유한다(인스턴스별 state 아님).
// useSyncExternalStore로 구독 → 토글/타 탭 변경이 모든 구독자에 즉시 반영.
let snapshot: Set<string> = new Set();
let initialized = false;
const listeners = new Set<() => void>();

function readStorage(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(arr) ? (arr as string[]) : []);
  } catch {
    return new Set();
  }
}

function emit(): void {
  listeners.forEach(l => l());
}

function handleStorage(e: StorageEvent): void {
  if (e.key === KEY) {
    snapshot = readStorage(); // 타 탭 변경 동기화
    emit();
  }
}

function subscribe(listener: () => void): () => void {
  // 첫 구독 시 1회 lazy 초기화(클라 전용) — 첫 렌더는 빈 스냅샷이라 SSR 일치
  if (!initialized) {
    initialized = true;
    snapshot = readStorage();
    window.addEventListener('storage', handleStorage);
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      window.removeEventListener('storage', handleStorage);
      initialized = false;
    }
  };
}

function getSnapshot(): Set<string> {
  return snapshot;
}

const SERVER_SNAPSHOT: Set<string> = new Set();
function getServerSnapshot(): Set<string> {
  return SERVER_SNAPSHOT;
}

function toggleId(id: string): void {
  const next = new Set(snapshot);
  let added: boolean;
  if (next.has(id)) { next.delete(id); added = false; }
  else { next.add(id); added = true; }
  snapshot = next; // 새 참조 → 구독자 리렌더 트리거
  try {
    localStorage.setItem(KEY, JSON.stringify([...next]));
  } catch {
    /* quota 초과 등 무시 */
  }
  emit();
  trackEvent('wishlist_toggle', { action: added ? 'add' : 'remove', game_id: id });
  // 첫 찜 순간이 알림 유도의 최적 타이밍 — 조건 맞으면 "알림 켜기" 액션 토스트(한 번만),
  // 아니면 기존 확인 토스트.
  if (added && shouldNudgeNotify()) {
    nudgeNotify([...next]);
  } else {
    const lang = (typeof document !== 'undefined' && document.documentElement.lang) || 'ko';
    const cal = CAL[lang as Locale] ?? CAL.ko;
    showToast(added ? cal.wishlistAddedToast : cal.wishlistRemovedToast);
  }
}

export interface WishlistApi {
  ids: Set<string>;
  toggle: (id: string) => void;
  has: (id: string) => boolean;
}

export function useWishlist(): WishlistApi {
  const ids = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const toggle = useCallback((id: string) => toggleId(id), []);
  const has = useCallback((id: string) => ids.has(id), [ids]);
  return { ids, toggle, has };
}
