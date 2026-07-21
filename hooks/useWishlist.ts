'use client';
import { useCallback, useSyncExternalStore } from 'react';
import { showToast } from '@/lib/toast';

const KEY = 'whenstage.wishlist.v1';

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
  showToast(added ? '즐겨찾기에 추가됨' : '즐겨찾기에서 제거됨');
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
