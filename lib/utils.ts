// 서버/클라이언트 양쪽에서 안전한 순수 헬퍼 (fs 의존 없음)

// D-day 계산
export function calcDayDiff(release_date: string, now: Date = new Date()): number {
  const r = new Date(release_date);
  r.setHours(0, 0, 0, 0);
  const t = new Date(now);
  t.setHours(0, 0, 0, 0);
  return Math.ceil((r.getTime() - t.getTime()) / (1000 * 60 * 60 * 24));
}

// SSR(서버=UTC)와 클라(=KST, UTC+9)의 하이드레이션 불일치 방지용.
// ISO instant를 KST 달력 날짜로 변환해, 실행 환경 timezone과 무관하게
// 동일한 연/월/일의 '로컬 자정' Date를 반환한다. (getDate/getMonth/getDay 등
// 로컬 필드가 서버·클라 양쪽에서 같은 값이 되도록 → 첫 렌더 HTML 일치)
// KST는 DST가 없어 항상 +9 고정.
export function kstDateOnly(iso: string): Date {
  const shifted = new Date(new Date(iso).getTime() + 9 * 60 * 60 * 1000);
  return new Date(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate());
}

// 표시용 날짜 포맷 ('2026년 6월 18일')
export function formatKoreanDate(release_date: string): string {
  const d = new Date(release_date);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

// 짧은 포맷 ('2026.06.18')
export function formatShortDate(release_date: string): string {
  const d = new Date(release_date);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

// 요일 (한글)
export function getKoreanWeekday(release_date: string): string {
  const d = new Date(release_date);
  return ['일', '월', '화', '수', '목', '금', '토'][d.getDay()];
}

// 티켓팅 시각을 "그 공연의 타임존" 기준으로 포맷 (예: '2026. 8. 5. 오전 11:00 GMT+9').
// 뷰어의 브라우저 타임존과 무관하게 항상 같은 값을 보여줘야, 해외 팬이 자기 시간대로
// 착각해 티켓팅을 놓치는 사고를 막을 수 있다 — 그래서 항상 timezone을 명시해 포맷한다.
export function formatEventDateTime(iso: string, timezone: string, locale: 'ko' | 'en' | 'ja'): string {
  const intlLocale = locale === 'en' ? 'en-US' : locale === 'ja' ? 'ja-JP' : 'ko-KR';
  const dtf = new Intl.DateTimeFormat(intlLocale, {
    timeZone: timezone,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  });
  return dtf.format(new Date(iso));
}
