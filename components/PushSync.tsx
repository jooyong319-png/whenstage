'use client';
import { useEffect, useRef } from 'react';
import { useWishlist } from '@/hooks/useWishlist';
import { useFollow } from '@/hooks/useFollow';
import { syncGameIds, syncArtistKeys } from '@/lib/push';

// 찜 목록이 바뀌면(어느 화면에서든) 푸시 구독자의 game_ids를 디바운스 동기화.
// 구독이 없으면 syncGameIds가 즉시 무시하므로 비구독자에겐 비용 없음.
export function PushSync() {
  const wishlist = useWishlist();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) { first.current = false; return; } // 초기 마운트는 스킵
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      syncGameIds([...wishlist.ids]).catch(() => {});
    }, 1500);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [wishlist.ids]);

  // 팔로우도 같은 방식으로(2026-10-13) — 어느 화면에서 팔로우하든 서버 구독의 artist_keys를 맞춘다
  const follow = useFollow();
  const fTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fFirst = useRef(true);
  useEffect(() => {
    if (fFirst.current) { fFirst.current = false; return; }
    if (fTimer.current) clearTimeout(fTimer.current);
    fTimer.current = setTimeout(() => {
      syncArtistKeys([...follow.keys]).catch(() => {});
    }, 1500);
    return () => { if (fTimer.current) clearTimeout(fTimer.current); };
  }, [follow.keys]);

  return null;
}
