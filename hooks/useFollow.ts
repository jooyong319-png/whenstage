'use client';
import { useCallback, useSyncExternalStore } from 'react';
import { trackEvent } from '@/lib/analytics';

/**
 * 가수 팔로우 (2026-10-13) — "좋아하는 가수만 고르면, 어느 예매처든 예매 열리기 전에 알려 드립니다."
 *
 * 찜(useWishlist)과 같은 모듈 싱글톤 store. 찜은 **공연** 단위, 팔로우는 **가수** 단위다 —
 * 예매처 알림은 공연이 등록된 뒤에야 걸 수 있는데, 팔로우는 아직 발표 안 된 공연까지 받는다.
 *
 * 키는 `로케일:정규화된 아티스트명`(예: `ko:권진아`, `en:Kwon Jin-ah`). 로케일마다 데이터가 독립이고
 * 표기도 달라서(lib/artists normalizeArtistKey), 로케일을 붙여야 알림 크론이 어느 데이터에서 찾을지 안다.
 */
const KEY = 'whenstage.follow.v1';

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

function emit(): void { listeners.forEach(l => l()); }

function handleStorage(e: StorageEvent): void {
  if (e.key === KEY) { snapshot = readStorage(); emit(); }
}

function subscribe(listener: () => void): () => void {
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

const SERVER_SNAPSHOT: Set<string> = new Set();

/** 지금 팔로우 목록 — 알림 구독 동기화(lib/push)가 읽는다 */
export function getFollowKeys(): string[] {
  if (!initialized && typeof window !== 'undefined') snapshot = readStorage();
  return [...snapshot];
}

export function followKey(lang: string, artistKey: string): string {
  return `${lang}:${artistKey}`;
}

function toggleKey(key: string): boolean {
  const next = new Set(snapshot);
  const added = !next.has(key);
  if (added) next.add(key); else next.delete(key);
  snapshot = next;
  try { localStorage.setItem(KEY, JSON.stringify([...next])); } catch { /* 무시 */ }
  emit();
  trackEvent('follow_artist', { action: added ? 'follow' : 'unfollow', item: key });
  return added;
}

export interface FollowApi {
  keys: Set<string>;
  has: (key: string) => boolean;
  toggle: (key: string) => boolean;   // true = 이번에 팔로우함
}

export function useFollow(): FollowApi {
  const keys = useSyncExternalStore(subscribe, () => snapshot, () => SERVER_SNAPSHOT);
  const has = useCallback((k: string) => keys.has(k), [keys]);
  const toggle = useCallback((k: string) => toggleKey(k), []);
  return { keys, has, toggle };
}
