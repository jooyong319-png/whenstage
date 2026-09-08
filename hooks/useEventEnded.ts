'use client';
import { useEffect, useState } from 'react';
import { eventEndDate, hasEventEnded, type Game } from '@/lib/types';

// 공연이 이미 끝났는지를 마운트 후 실제 시각으로 판정 — SSG 정적 페이지라 서버에서 계산하면
// 빌드 시점에 고정된다(useSaleWindowEnded와 같은 이유). 하루 2회 리서처 push로 재빌드되긴
// 하지만, 그 사이에 끝난 공연이 반나절 동안 "예매 중"으로 남는 건 이 판정이 막는다.
// 마운트 전에는 항상 false(열림) — 하이드레이션 불일치 방지.
export function useEventEnded(
  g: Pick<Game, 'release_date' | 'festival_days' | 'timezone'>,
): boolean {
  const [ended, setEnded] = useState(false);
  // festival_days는 배열이라 그대로 의존성에 넣으면 매 렌더 새 참조가 된다. 마지막 날짜
  // 하나로 줄여서 넣는다 — 그 뒤로는 festival_days가 없는 항목과 계산이 같아진다.
  const lastDay = eventEndDate(g);
  const { timezone } = g;
  useEffect(() => {
    setEnded(hasEventEnded({ release_date: lastDay, festival_days: null, timezone }, new Date()));
  }, [lastDay, timezone]);
  return ended;
}
