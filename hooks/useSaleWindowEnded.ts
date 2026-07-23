'use client';
import { useEffect, useState } from 'react';
import { hasSaleWindowEnded } from '@/lib/types';

// 선예매/일반예매 마감 여부를 마운트 후 실제 시각으로 판정 — SSG 정적 페이지라 서버에서
// 계산하면 빌드 시점에 고정돼버리므로(TicketingPhase의 마감 판정과 동일 이유), 클라이언트
// 전용으로 둔다. 마운트 전에는 항상 false(열림) — 하이드레이션 불일치 방지.
export function useSaleWindowEnded(endDateTime: string | null | undefined): boolean {
  const [ended, setEnded] = useState(false);
  useEffect(() => {
    setEnded(hasSaleWindowEnded(endDateTime, new Date()));
  }, [endDateTime]);
  return ended;
}
