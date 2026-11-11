'use client';
// 웹 푸시 구독 클라이언트 헬퍼 — 구독정보 + 찜 game_ids + 알림 설정(prefs)을 서버 라우트(/api/push)로 저장.
// 브라우저가 테이블을 직접 건드리지 않는다(2026-11-11) — 이유는 app/api/push/route.ts 머리말.
import { isSupabaseReady } from './supabase';

type PushAction = 'exists' | 'save' | 'update' | 'delete';
async function pushApi(action: PushAction, endpoint: string, extra: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
  const res = await fetch('/api/push', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, endpoint, ...extra }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((json as { error?: string }).error || `HTTP ${res.status}`);
  return json as Record<string, unknown>;
}
import { getFollowKeys } from '@/hooks/useFollow';
import { type NotifyPrefs, DEFAULT_NOTIFY_PREFS, normalizePrefs } from './notifyPrefs';

// env에 붙여넣을 때 따라온 공백/줄바꿈/따옴표 제거(있으면 subscribe 실패 원인)
const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim().replace(/^["']|["']$/g, '');

// 마지막 실패 사유(화면 토스트 진단용)
let lastPushError: string | null = null;
export function getLastPushError(): string | null { return lastPushError; }

// 알림 권한(Notification.permission)과 구독 여부(subscription)는 서로 다른 상태다 — 사용자가
// 토글을 꺼서 unsubscribe()해도 브라우저의 알림 "권한"은 grant된 채로 남는다. 그래서 마운트
// 시 "권한은 있는데 구독이 없다"만으로는 "사용자가 방금 껐다"와 "구독이 우연히 유실됐다
// (TWA 재시작 등)"를 구분할 수 없어, 끄기 직후 새로고침하면 자동 재구독 로직이 다시 켜버리는
// 버그가 있었다. 이 플래그로 "사용자가 명시적으로 껐다"는 의도를 별도 기록해 구분한다.
const OPT_OUT_KEY = 'whenstage.notify.optedOut';
export function markNotifyOptedOut(): void {
  try { localStorage.setItem(OPT_OUT_KEY, '1'); } catch { /* ignore */ }
}
export function clearNotifyOptedOut(): void {
  try { localStorage.removeItem(OPT_OUT_KEY); } catch { /* ignore */ }
}
export function isNotifyOptedOut(): boolean {
  try { return localStorage.getItem(OPT_OUT_KEY) === '1'; } catch { return false; }
}

// ─── 알림 세분화 설정(localStorage 우선, 구독 시 DB에도 동기화) ───
const PREFS_KEY = 'whenstage.notify.prefs';
export function getNotifyPrefs(): NotifyPrefs {
  try { return normalizePrefs(JSON.parse(localStorage.getItem(PREFS_KEY) || '{}')); }
  catch { return DEFAULT_NOTIFY_PREFS; }
}
// 설정 저장 — 로컬에 기록하고, 구독 중이면 DB(prefs 컬럼)도 갱신. 구독 없으면 로컬만.
export async function setNotifyPrefs(prefs: NotifyPrefs): Promise<void> {
  try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); } catch { /* ignore */ }
  const sub = await getCurrentSubscription();
  if (!sub || !isSupabaseReady()) return;
  await pushApi('update', sub.endpoint, { prefs }).catch(() => {});
}

export function pushConfigured(): boolean {
  return !!VAPID_PUBLIC;
}

export function pushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

async function getReg(): Promise<ServiceWorkerRegistration | null> {
  if (!pushSupported()) return null;
  try { return await navigator.serviceWorker.ready; } catch { return null; }
}

export async function getCurrentSubscription(): Promise<PushSubscription | null> {
  const reg = await getReg();
  if (!reg) return null;
  return reg.pushManager.getSubscription();
}

// DB(push_subscriptions)에 이 endpoint가 실제로 등록돼 있는지 — 브라우저 레벨 구독 객체가
// 남아있어도(unsubscribe()가 브라우저 쪽에서만 조용히 실패한 경우 등) 서버가 실제로 알림을
// 보낼지는 이 테이블 기준이므로, ON/OFF 표시는 브라우저 상태만으로 판단하면 안 된다.
// 🔴 조회 **실패**(네트워크·Supabase 장애)는 null — "없음(false)"과 구분한다. 예전엔 실패도 false라서
//    호출부가 멀쩡한 구독을 해지해 버렸다(Codex 점검 2026-11-04).
export async function isEndpointRegistered(endpoint: string): Promise<boolean | null> {
  if (!isSupabaseReady()) return null;
  try {
    const r = await pushApi('exists', endpoint);
    return typeof r.registered === 'boolean' ? r.registered : null;
  } catch { return null; }
}

async function saveSubscription(sub: PushSubscription, gameIds: string[]): Promise<void> {
  if (!isSupabaseReady()) throw new Error('Supabase 미설정');
  const json = sub.toJSON();
  // prefs·팔로우한 가수(artist_keys)는 서버가 best-effort로 따로 갱신한다 — 그 컬럼이 없어도 구독은 성공.
  try {
    await pushApi('save', sub.endpoint, {
      p256dh: json.keys?.p256dh ?? '',
      auth: json.keys?.auth ?? '',
      gameIds,
      prefs: getNotifyPrefs(),
      artistKeys: getFollowKeys(),
    });
  } catch (e) {
    throw new Error('DB ' + ((e as Error)?.message || String(e)));
  }
}

export type SubscribeResult = 'ok' | 'denied' | 'unsupported' | 'error';

export async function subscribePush(gameIds: string[]): Promise<SubscribeResult> {
  if (!pushSupported() || !VAPID_PUBLIC) return 'unsupported';
  // 이미 허용된 경우 재요청하지 않음(중복 프롬프트 방지)
  let perm: NotificationPermission = Notification.permission;
  if (perm === 'default') {
    try { perm = await Notification.requestPermission(); } catch { return 'error'; }
  }
  if (perm !== 'granted') return 'denied';
  const reg = await getReg();
  if (!reg) return 'unsupported';
  lastPushError = null;
  let sub: PushSubscription;
  try {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC) as BufferSource,
    });
  } catch (e) {
    lastPushError = 'subscribe: ' + ((e as Error)?.message || String(e));
    console.error('[push] subscribe 실패', e);
    return 'error';
  }
  try {
    await saveSubscription(sub, gameIds);
  } catch (e) {
    lastPushError = 'save: ' + ((e as Error)?.message || String(e));
    console.error('[push] save 실패', e);
    return 'error';
  }
  clearNotifyOptedOut();
  return 'ok';
}

export async function unsubscribePush(): Promise<void> {
  const sub = await getCurrentSubscription();
  if (!sub) return;
  const endpoint = sub.endpoint;
  // unsubscribe()는 실패해도 던지지 않고 false를 반환할 수 있어(브라우저 레벨 구독이 그대로
  // 남는 경우) — DB 삭제는 결과와 무관하게 항상 시도한다(서버가 보낼지 말지의 기준이 DB이므로
  // 이것만 지워지면 실사용상 "꺼짐"은 보장됨). 브라우저 쪽 구독은 정리 목적으로 한 번 더 시도.
  try {
    const ok = await sub.unsubscribe();
    if (!ok) { await sub.unsubscribe().catch(() => {}); }
  } catch { /* ignore — DB 삭제로 실사용상 꺼짐은 보장 */ }
  if (isSupabaseReady()) {
    await pushApi('delete', endpoint).catch(() => {});
  }
  markNotifyOptedOut();
}

// 팔로우 목록 변경 시 구독자의 artist_keys 동기화(구독 없으면 무시, 컬럼 없으면 조용히 실패)
export async function syncArtistKeys(keys: string[]): Promise<void> {
  const sub = await getCurrentSubscription();
  if (!sub || !isSupabaseReady()) return;
  await pushApi('update', sub.endpoint, { artistKeys: keys }).catch(() => {});
}

// 찜 목록 변경 시 구독자의 game_ids 동기화(구독 없으면 무시)
export async function syncGameIds(gameIds: string[]): Promise<void> {
  const sub = await getCurrentSubscription();
  if (!sub || !isSupabaseReady()) return;
  await pushApi('update', sub.endpoint, { gameIds }).catch(() => {});
}
