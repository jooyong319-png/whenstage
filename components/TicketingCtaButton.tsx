'use client';
import { useSaleWindowEnded } from '@/hooks/useSaleWindowEnded';
import { useEventEnded } from '@/hooks/useEventEnded';
import { trackEvent } from '@/lib/analytics';
import type { Game } from '@/lib/types';

interface Props {
  url: string;
  endDateTime?: string | null;
  /** 공연 자체가 끝났는지 판정하기 위한 최소 필드 — 마감일이 없어도 CTA를 내려야 한다 */
  event: Pick<Game, 'release_date' | 'festival_days' | 'timezone'>;
  openLabel: string;
  closedLabel: string;
}

// 선예매/일반예매 CTA(콘서트 상세 페이지) — 마감이면 링크 대신 마감 문구로 바꾼다.
export function TicketingCtaButton({ url, endDateTime, event, openLabel, closedLabel }: Props) {
  // 둘 다 훅이라 조건부 호출이 안 된다(||로 단락시키면 훅 순서가 깨진다). 각각 부른 뒤 합친다.
  const saleEnded = useSaleWindowEnded(endDateTime);
  const eventEnded = useEventEnded(event);
  const ended = saleEnded || eventEnded;

  if (ended) {
    return (
      <span className="detail-link detail-link-closed" aria-disabled="true">
        {closedLabel}
      </span>
    );
  }
  return (
    <a
      className="detail-link prereg-cta"
      href={url}
      target="_blank"
      rel="noopener"
      onClick={() => trackEvent('ticketing_click', { source: 'detail' })}
    >
      {openLabel} →
    </a>
  );
}
