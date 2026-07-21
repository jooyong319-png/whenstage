'use client';
import { useEffect, useState } from 'react';
import { supabase, isSupabaseReady } from '@/lib/supabase';
import { showToast } from '@/lib/toast';
import styles from './GameReactions.module.css';

const KEY = 'whenstage.reacted.v1';
type Vote = 'like' | 'dislike';

function getVoted(): Record<string, Vote> {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; }
}

export function GameReactions({ gameId }: { gameId: string }) {
  const [likes, setLikes] = useState<number | null>(null);
  const [dislikes, setDislikes] = useState<number | null>(null);
  const [voted, setVoted] = useState<Vote | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isSupabaseReady() || !supabase) return;
    setVoted(getVoted()[gameId] ?? null);
    let cancelled = false;
    (async () => {
      const head = (reaction: Vote) =>
        supabase!.from('game_reactions').select('*', { count: 'exact', head: true })
          .eq('game_id', gameId).eq('reaction', reaction);
      const [l, d] = await Promise.all([head('like'), head('dislike')]);
      if (cancelled) return;
      setLikes(l.count ?? 0);
      setDislikes(d.count ?? 0);
    })();
    return () => { cancelled = true; };
  }, [gameId]);

  if (!isSupabaseReady()) return null;

  const vote = async (reaction: Vote) => {
    if (voted || busy || !supabase) return;
    setBusy(true);
    const { error } = await supabase.from('game_reactions').insert({ game_id: gameId, reaction });
    setBusy(false);
    if (error) { showToast('잠시 후 다시 시도해주세요'); return; }
    const m = getVoted(); m[gameId] = reaction;
    try { localStorage.setItem(KEY, JSON.stringify(m)); } catch { /* ignore */ }
    setVoted(reaction);
    if (reaction === 'like') setLikes(v => (v ?? 0) + 1);
    else setDislikes(v => (v ?? 0) + 1);
    showToast('소중한 의견 감사해요');
  };

  return (
    <div className={styles.wrap}>
      <span className={styles.q}>이 게임 기대되나요?</span>
      <div className={styles.btns}>
        <button
          type="button"
          className={`${styles.btn} ${voted === 'like' ? styles.onLike : ''}`}
          onClick={() => vote('like')}
          disabled={!!voted || busy}
          aria-pressed={voted === 'like'}
          aria-label="좋아요"
        >
          <svg className="ic" aria-hidden="true"><use href="#ic-thumbs-up" /></svg>
          <span>{likes ?? '–'}</span>
        </button>
        <button
          type="button"
          className={`${styles.btn} ${voted === 'dislike' ? styles.onDislike : ''}`}
          onClick={() => vote('dislike')}
          disabled={!!voted || busy}
          aria-pressed={voted === 'dislike'}
          aria-label="별로예요"
        >
          <svg className="ic" aria-hidden="true"><use href="#ic-thumbs-down" /></svg>
          <span>{dislikes ?? '–'}</span>
        </button>
      </div>
    </div>
  );
}
