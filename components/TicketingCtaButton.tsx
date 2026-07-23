'use client';
import { useSaleWindowEnded } from '@/hooks/useSaleWindowEnded';

interface Props {
  url: string;
  endDateTime?: string | null;
  openLabel: string;
  closedLabel: string;
}

// 선예매/일반예매 CTA(콘서트 상세 페이지) — 마감이면 링크 대신 마감 문구로 바꾼다.
export function TicketingCtaButton({ url, endDateTime, openLabel, closedLabel }: Props) {
  const ended = useSaleWindowEnded(endDateTime);

  if (ended) {
    return (
      <span className="detail-link detail-link-closed" aria-disabled="true">
        {closedLabel}
      </span>
    );
  }
  return (
    <a className="detail-link prereg-cta" href={url} target="_blank" rel="noopener">
      {openLabel} →
    </a>
  );
}
