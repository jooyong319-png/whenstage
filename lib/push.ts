'use client';
// 웹 푸시 구독 클라이언트 헬퍼 — Supabase에 구독정보 + 찜 game_ids 저장.
import { supabase, isSupabaseReady } from './supabase';

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
export async function isEndpointRegistered(endpoint: string): Promise<boolean> {
  if (!isSupabaseReady() || !supabase) return false;
  const { data, error } = await supabase
    .from('push_subscriptions')
    .select('endpoint')
    .eq('endpoint', endpoint)
    .maybeSingle();
  return !error && !!data;
}

async function saveSubscription(sub: PushSubscription, gameIds: string[]): Promise<void> {
  if (!isSupabaseReady() || !supabase) throw new Error('Supabase 미설정');
  const json = sub.toJSON();
  const { error } = await supabase.from('push_subscriptions').upsert(
    {
      endpoint: sub.endpoint,
      p256dh: json.keys?.p256dh ?? '',
      auth: json.keys?.auth ?? '',
      game_ids: gameIds,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'endpoint' },
  );
  if (error) throw new Error('DB ' + error.message);
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
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC),
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
  if (isSupabaseReady() && supabase) {
    await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint);
  }
  markNotifyOptedOut();
}

// 찜 목록 변경 시 구독자의 game_ids 동기화(구독 없으면 무시)
export async function syncGameIds(gameIds: string[]): Promise<void> {
  const sub = await getCurrentSubscription();
  if (!sub || !isSupabaseReady() || !supabase) return;
  await supabase
    .from('push_subscriptions')
    .update({ game_ids: gameIds, updated_at: new Date().toISOString() })
    .eq('endpoint', sub.endpoint);
}
