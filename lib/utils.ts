// 서버/클라이언트 양쪽에서 안전한 순수 헬퍼 (fs 의존 없음)

// 'YYYY-MM-DD'(시간대 없는 달력 날짜) → 실행 환경의 '그 날짜 로컬 자정'.
// new Date('2026-09-23')은 UTC 자정으로 읽혀서, UTC보다 느린 시간대(미주)의 브라우저에선
// 9/22 저녁이 된다 → 오늘 공연이 '지난 공연'으로 빠지고 D-day·요일이 하루 밀리며,
// 서버(UTC) HTML과 달라 하이드레이션도 깨진다. 날짜 문자열은 반드시 이걸로 읽는다.
export function parseDateOnly(date: string): Date {
  const [y, m, d] = date.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
}

// D-day 계산
export function calcDayDiff(release_date: string, now: Date = new Date()): number {
  const r = parseDateOnly(release_date);
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
  const d = parseDateOnly(release_date);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

// 짧은 포맷 ('2026.06.18')
export function formatShortDate(release_date: string): string {
  const d = parseDateOnly(release_date);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

// 요일 (한글)
export function getKoreanWeekday(release_date: string): string {
  const d = parseDateOnly(release_date);
  return ['일', '월', '화', '수', '목', '금', '토'][d.getDay()];
}

// 티켓팅 시각을 "그 공연의 타임존" 기준으로 포맷 (예: '2026. 8. 5. 오전 11:00 GMT+9').
// 뷰어의 브라우저 타임존과 무관하게 항상 같은 값을 보여줘야, 해외 팬이 자기 시간대로
// 착각해 티켓팅을 놓치는 사고를 막을 수 있다 — 그래서 항상 timezone을 명시해 포맷한다.
// 예외: 한국어 페이지 + 한국 공연(Asia/Seoul)은 읽는 사람과 공연의 시간대가 같아
// 'GMT+9'가 소음일 뿐이라 뺀다.
export function formatEventDateTime(iso: string, timezone: string, locale: 'ko' | 'en' | 'ja'): string {
  const intlLocale = locale === 'en' ? 'en-US' : locale === 'ja' ? 'ja-JP' : 'ko-KR';
  const dtf = new Intl.DateTimeFormat(intlLocale, {
    timeZone: timezone,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    ...(isHomeTimezone(timezone, locale) ? {} : { timeZoneName: 'short' as const }),
  });
  return dtf.format(new Date(iso));
}

// 카드용 짧은 버전 — '9월 23일 (수) 17:00'. 시간대 규칙은 위와 같다.
// 공연일 카드(formatDateShort + release_time)와 같은 모양이 되도록 24시간제.
export function formatEventDateTimeShort(iso: string, timezone: string, locale: 'ko' | 'en' | 'ja', withYear = false): string {
  const dtf = new Intl.DateTimeFormat(intlLocaleOf(locale), {
    timeZone: timezone,
    ...(withYear ? { year: 'numeric' as const } : {}),
    month: locale === 'en' ? 'short' : 'long',
    day: 'numeric',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    ...(isHomeTimezone(timezone, locale) ? {} : { timeZoneName: 'short' as const }),
  });
  return dtf.format(new Date(iso));
}

// 'YYYY-MM-DD'(시간대 없는 달력 날짜) → '9월 23일 (수)'. UTC로 고정해 실행 환경과 무관하게 같은 날.
export function formatDateShort(date: string, locale: 'ko' | 'en' | 'ja', withYear = false): string {
  const [y, m, d] = date.split('-').map(Number);
  return new Intl.DateTimeFormat(intlLocaleOf(locale), {
    timeZone: 'UTC',
    ...(withYear ? { year: 'numeric' as const } : {}),
    month: locale === 'en' ? 'short' : 'long',
    day: 'numeric',
    weekday: 'short',
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

function intlLocaleOf(locale: 'ko' | 'en' | 'ja'): string {
  return locale === 'en' ? 'en-US' : locale === 'ja' ? 'ja-JP' : 'ko-KR';
}

function isHomeTimezone(timezone: string, locale: 'ko' | 'en' | 'ja'): boolean {
  return locale === 'ko' && timezone === 'Asia/Seoul';
}
