import { NextResponse, type NextRequest } from 'next/server';
import { LOCALES, type Locale } from '@/lib/i18nLabels';

const COOKIE_NAME = 'NEXT_LOCALE';

function isLocale(v: string): v is Locale {
  return (LOCALES as string[]).includes(v);
}

// "ko-KR,ko;q=0.9,en-US;q=0.8" → q값 내림차순으로 훑어 지원하는 첫 언어를 고름.
function pickFromAcceptLanguage(header: string | null): Locale | null {
  if (!header) return null;
  const entries = header
    .split(',')
    .map(part => {
      const [tag, qPart] = part.trim().split(';q=');
      return { base: tag.trim().toLowerCase().split('-')[0], q: qPart ? parseFloat(qPart) : 1 };
    })
    .sort((a, b) => b.q - a.q);

  for (const { base } of entries) {
    if (isLocale(base)) return base;
  }
  return null;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 이미 /ko, /en, /ja로 시작하는 경로는 절대 건드리지 않는다 — 크롤러가 각 언어 페이지를
  // 그대로 인덱싱해야 하므로(가장 흔한 실수: 여기서 다시 리다이렉트해버리는 것) 매처와
  // 이중으로 방어한다.
  if (pathname !== '/') {
    return NextResponse.next();
  }

  // 쿠키(사용자가 언어 스위처로 수동 선택한 값)가 최우선, 없으면 Accept-Language, 그마저 없으면 ko.
  const cookieLocale = req.cookies.get(COOKIE_NAME)?.value;
  const locale: Locale =
    (cookieLocale && isLocale(cookieLocale) ? cookieLocale : null) ??
    pickFromAcceptLanguage(req.headers.get('accept-language')) ??
    'ko';

  const url = req.nextUrl.clone();
  url.pathname = `/${locale}`;

  // 307(임시)을 쓰는 이유 — **목적지가 고정이 아니다.** 같은 `/`가 요청자에 따라
  // `/ko`·`/en`·`/ja`로 갈린다. 308(영구)은 "이 주소는 영원히 저기"라는 선언이라
  // 브라우저·크롤러가 캐시해버리고, 그러면 한 언어로 굳어 나머지가 영영 못 간다.
  // (2026-09-21 외부 점검에서 308 전환을 제안받았으나 이 이유로 유지하기로 했다.)
  const res = NextResponse.redirect(url, 307);

  // 🔴 분기 리다이렉트에는 Vary가 필수다. 이게 없으면 CDN·프록시 같은 공유 캐시가
  // `/ → /ko` 한 번의 응답을 모든 사용자에게 돌려줘 영어 사용자가 한국어로 끌려간다.
  // 응답이 무엇에 따라 달라지는지를 그대로 적는다 — 위에서 쿠키와 Accept-Language를 본다.
  res.headers.set('Vary', 'Accept-Language, Cookie');
  return res;
}

// 루트(/)에서만 실행 — 다른 모든 경로(/ko/*, /en/*, /ja/*, API, 정적 파일 등)는 미들웨어 자체가 돌지 않는다.
export const config = {
  matcher: '/',
};
