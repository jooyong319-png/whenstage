'use client';
import { useState } from 'react';
import { useLocale } from '@/hooks/useLocale';
import { CAL } from '@/lib/i18nLabels';

interface Props {
  /** 공유할 경로 또는 절대 URL (예: '/concert/abc') */
  url: string;
  title: string;
  className?: string;
}

// 공유 버튼 — 모바일은 Web Share API(navigator.share), 데스크톱은 링크 클립보드 복사로 폴백.
export function ShareButton({ url, title, className }: Props) {
  const lang = useLocale();
  const t = lang ? CAL[lang] : null;
  const [copied, setCopied] = useState(false);

  const onShare = async () => {
    const fullUrl = url.startsWith('http') ? url : `https://whenstage.com${url}`;
    // 모바일/지원 브라우저: 네이티브 공유 시트
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, url: fullUrl });
      } catch {
        /* 사용자가 취소하거나 실패 — 무시 */
      }
      return;
    }
    // 폴백: 클립보드 복사 + '복사됨' 피드백
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard 차단 환경 — 무시 */
    }
  };

  return (
    <button type="button" className={className} onClick={onShare} aria-label={t ? t.share : '공유'}>
      <svg className="ic" aria-hidden="true"><use href="#ic-share" /></svg>
      {copied ? (t ? t.copied : '복사됨') : (t ? t.share : '공유')}
    </button>
  );
}
