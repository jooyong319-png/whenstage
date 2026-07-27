// GA4 커스텀 이벤트 전송 — gtag가 로드된 프로덕션에서만 동작(없으면 조용히 무시).
// 예매하기/찜/알림 켜기 같은 핵심 전환 행동을 추적해 나중에 데이터로 개선 판단.
type GtagFn = (command: 'event', name: string, params?: Record<string, unknown>) => void;

export function trackEvent(name: string, params?: Record<string, unknown>): void {
  try {
    const w = window as unknown as { gtag?: GtagFn };
    if (typeof w.gtag === 'function') w.gtag('event', name, params ?? {});
  } catch { /* ignore */ }
}
