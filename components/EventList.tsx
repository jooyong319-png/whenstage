'use client';
import { useState } from 'react';
import { kstDateOnly } from '@/lib/utils';
import { useLiveNow, ServerNowProvider } from '@/hooks/useLiveNow';
import { AnimatePresence } from 'motion/react';
import type { Game } from '@/lib/types';
import { isTicketingLiveNow } from '@/lib/types';
import { GameRow } from './GameRow';
import { GameModal } from './GameModal';
import { useWishlist } from '@/hooks/useWishlist';
import { useLocale } from '@/hooks/useLocale';
import { CAL } from '@/lib/i18nLabels';
import styles from './ListView.module.css';

interface Props { events: Game[]; serverNow: string; }

// 아티스트/공연장 상세 — 일정 목록(클릭 시 사이트 공통 모달로 상세 확인). 새 페이지로 이동하지 않음.
export function EventList({ events, serverNow }: Props) {
  const lang = useLocale();
  const t = lang ? CAL[lang] : null;
  const wishlist = useWishlist();
  const [openId, setOpenId] = useState<string | null>(null);
  // 🔴 예전엔 useState(new Date()) — 서버(빌드 시각)와 브라우저(접속 시각)가 달라 하이드레이션이 깨졌다.
  //    첫 렌더는 빌드 시각의 '오늘'(서버와 같게), 마운트 뒤엔 실제 시각(1분마다 갱신)
  // (Provider는 아래 GameRow용 — 이 컴포넌트 자체는 Provider 밖이라 live가 마운트 전엔 null)
  const live = useLiveNow();
  const now = live ?? kstDateOnly(serverNow);          // 날짜(D-day)용
  const instant = live ?? new Date(serverNow);          // 판매 시각 비교용 — 서버·브라우저가 같은 순간
  const openGame = events.find(g => g.id === openId) ?? null;

  return (
    <ServerNowProvider value={serverNow}>
      <ul className={styles.rows}>
        {events.map(g => (
          <GameRow
            key={g.id}
            game={g}
            now={now}
            wishlist={wishlist}
            onPick={setOpenId}
            preBadge={isTicketingLiveNow(g, instant) ? (t ? t.onSaleNowBadge : '예매중') : undefined}
          />
        ))}
      </ul>
      <AnimatePresence>
        {openGame && <GameModal game={openGame} onClose={() => setOpenId(null)} wishlist={wishlist} />}
      </AnimatePresence>
    </ServerNowProvider>
  );
}
