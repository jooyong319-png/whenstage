'use client';
import { useState } from 'react';
import type { Game } from '@/lib/types';
import { GameRow } from './GameRow';
import { GameModal } from './GameModal';
import { useWishlist } from '@/hooks/useWishlist';
import styles from './ListView.module.css';

interface Props { events: Game[]; }

// 아티스트/공연장 상세 — 일정 목록(클릭 시 사이트 공통 모달로 상세 확인). 새 페이지로 이동하지 않음.
export function EventList({ events }: Props) {
  const wishlist = useWishlist();
  const [openId, setOpenId] = useState<string | null>(null);
  const [now] = useState(() => new Date());
  const openGame = events.find(g => g.id === openId) ?? null;

  return (
    <>
      <ul className={styles.rows}>
        {events.map(g => (
          <GameRow key={g.id} game={g} now={now} wishlist={wishlist} onPick={setOpenId} />
        ))}
      </ul>
      {openGame && <GameModal game={openGame} onClose={() => setOpenId(null)} wishlist={wishlist} />}
    </>
  );
}
