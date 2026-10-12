'use client';
import { useEffect } from 'react';
import { trackEvent } from '@/lib/analytics';

/**
 * 서버 컴포넌트 페이지의 링크 클릭을 GA4로 (2026-10-13).
 *
 * 티켓팅·월별 페이지는 서버 컴포넌트라 링크에 onClick을 달 수 없다. 대신 링크에
 * `data-ev="이벤트명" data-source="어디서" data-id="공연 id"`를 붙여 두면 여기서 한 번에 잡는다.
 * 문서 전체에 리스너 하나 — 페이지마다 클라이언트 컴포넌트를 늘리지 않는다.
 */
export function ClickTracker() {
  // 알림을 눌러 들어온 방문(크론이 URL에 ?from=push&k=<종류>를 붙인다) → notification_open 1회,
  // 주소창은 깨끗하게 되돌린다(공유·북마크에 꼬리가 남지 않게)
  useEffect(() => {
    try {
      const u = new URL(window.location.href);
      if (u.searchParams.get('from') !== 'push') return;
      trackEvent('notification_open', { item: u.searchParams.get('k') ?? 'unknown' });
      u.searchParams.delete('from');
      u.searchParams.delete('k');
      window.history.replaceState(window.history.state, '', u.pathname + (u.search ? u.search : '') + u.hash);
    } catch { /* 무시 */ }
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest?.('[data-ev]') as HTMLElement | null;
      if (!el) return;
      const { ev, source, id, area } = el.dataset;
      if (!ev) return;
      // 메뉴 항목은 링크 경로로 정한다: /ko → calendar, /ko/month/2026-10 → month, /ko/guide/glossary → glossary
      let item = el.dataset.item;
      if (!item && ev === 'nav_click' && el instanceof HTMLAnchorElement) {
        const parts = el.pathname.split('/').filter(Boolean).slice(1);   // 로케일 접두사 제거
        item = parts.length === 0 ? 'calendar' : parts[0] === 'guide' && parts[1] ? parts[1] : parts[0];
      }
      trackEvent(ev, {
        ...(source ? { source } : {}),
        ...(area ? { area } : {}),
        ...(item ? { item } : {}),
        ...(id ? { game_id: id } : {}),
      });
    };
    document.addEventListener('click', onClick, { capture: true });
    return () => document.removeEventListener('click', onClick, { capture: true });
  }, []);
  return null;
}
