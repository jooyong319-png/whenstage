'use client';
import { useEffect, useState } from 'react';
import { supabase, isSupabaseReady } from '@/lib/supabase';
import styles from './ViewCounter.module.css';

interface Props { gameId: string; }

// 같은 브라우저에서 같은 게임을 하루 1회만 집계 (새로고침·재방문 중복 + StrictMode
// 이펙트 2회 실행 인플레 방지). insert 전에 동기적으로 표시해 두 번째 호출이 즉시 걸러진다.
// localStorage 불가 시엔 그냥 집계(우아한 폴백).
function shouldCount(gameId: string): boolean {
  try {
    const KEY = 'whenstage.viewed.v1';
    const raw = localStorage.getItem(KEY);
    const map = (raw ? JSON.parse(raw) : {}) as Record<string, string>;
    const today = new Date().toISOString().slice(0, 10);
    if (map[gameId] === today) return false;
    map[gameId] = today;
    localStorage.setItem(KEY, JSON.stringify(map));
    return true;
  } catch {
    return true;
  }
}

export function ViewCounter({ gameId }: Props) {
  const [count, setCount] = useState<number | null>(null);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    if (!isSupabaseReady() || !supabase) return;
    let cancelled = false;

    async function track() {
      try {
        // 1) 하루 1회만 이번 방문을 1행으로 기록 (중복 집계·테이블 폭증 방지)
        if (shouldCount(gameId)) {
          await supabase!.from('page_views').insert({ game_id: gameId, count: 1 });
        }

        // 2) 이 게임의 누적 조회수 = 행 개수 (집계 여부와 무관하게 항상 표시)
        const { count: total, error: selErr } = await supabase!
          .from('page_views')
          .select('*', { count: 'exact', head: true })
          .eq('game_id', gameId);

        if (cancelled) return;
        if (selErr) { setError(true); return; }
        setCount(total ?? 0);
      } catch {
        if (!cancelled) setError(true);
      }
    }

    track();
    return () => { cancelled = true; };
  }, [gameId]);

  // 미설정 / 에러 시 조용히 안 보임
  if (!isSupabaseReady() || error || count === null) return null;

  return (
    <div className={styles.counter} aria-label="조회수">
      <span className={styles.icon}><svg className="ic" aria-hidden="true"><use href="#ic-eye" /></svg></span>
      <span className={styles.num}>{count.toLocaleString()}</span>
      <span className={styles.label}>회 조회</span>
    </div>
  );
}
