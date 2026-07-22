'use client';
import { usePathname } from 'next/navigation';
import { UI, type Locale } from '@/lib/i18nLabels';

function detectLang(pathname: string): Locale {
  const m = pathname.match(/^\/(ko|en|ja)(\/|$)/);
  return m ? (m[1] as Locale) : 'ko';
}

// 헤더 워드마크 — usePathname으로 언어 자체 감지(레이아웃이 서버 params를 못 받는 라우트 구조라 클라에서 판단).
export function SiteWordmark() {
  const pathname = usePathname();
  const lang = detectLang(pathname);
  const home = `/${lang}`;
  const label = UI[lang].siteNameShort;

  // 전역 헤더 워드마크 — h1은 각 페이지 본문의 고유 제목이 가져야 하므로(페이지당 h1 1개 원칙),
  // 여기선 h1을 쓰지 않는다.
  return (
    <p className="site-wordmark">
      <a href={home}>
        <svg className="ic ic-gamepad" aria-hidden="true"><use href="#ic-star" /></svg> {label}
      </a>
    </p>
  );
}
