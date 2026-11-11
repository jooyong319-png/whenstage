'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import styles from './LanguageSwitcher.module.css';

type PageLang = 'ko' | 'en' | 'ja';

// 언어별 정적 페이지가 실제로 존재하는 최상위 라우트(app/[lang]/<slug>/page.tsx 목록과 동일하게 유지)
const STATIC_PAGES = new Set(['about', 'guide', 'contact', 'privacy', 'terms', 'wishlist', 'blog', 'news']);
// 항목별 상세 페이지(슬러그 하나 더 붙는 형태)가 존재하는 콘텐츠 타입 — concert 상세는 로케일별 독립 데이터라
// id가 언어마다 다르므로 언어 전환 시 상세 유지가 불가능해 여기선 홈으로 보낸다(DETAIL_TYPES에서 제외).
const DETAIL_TYPES = new Set(['blog', 'news']);

interface Parsed {
  lang: PageLang;
  // 'home' = /ko 류, 'static' = /ko/about 류, 'detail' = /ko/blog/[slug] 류, 'unmapped' = 번역 라우트 없음(콘서트 상세 등)
  kind: 'home' | 'static' | 'detail' | 'unmapped';
  rel: string; // 언어 접두사 뺀 상대 경로 조각(예: 'about', 'blog/foo')
}

function parsePath(pathname: string): Parsed {
  const localeMatch = pathname.match(/^\/(ko|en|ja)(\/.*)?$/);
  const lang: PageLang = localeMatch ? (localeMatch[1] as PageLang) : 'ko';
  const rest = localeMatch ? (localeMatch[2] ?? '/') : pathname;

  if (rest === '/' || rest === '') return { lang, kind: 'home', rel: '' };

  const parts = rest.split('/').filter(Boolean);
  if (parts.length === 1 && STATIC_PAGES.has(parts[0])) {
    return { lang, kind: 'static', rel: parts[0] };
  }
  if (parts.length === 2 && DETAIL_TYPES.has(parts[0])) {
    return { lang, kind: 'detail', rel: `${parts[0]}/${parts[1]}` };
  }
  return { lang, kind: 'unmapped', rel: '' };
}

function buildUrl(target: PageLang, p: Parsed): string {
  if (p.kind === 'home' || p.kind === 'unmapped') {
    return `/${target}`;
  }
  // 🔴 블로그·뉴스 글은 언어마다 따로 쓴 글이라 슬러그가 겹치지 않는다(content/blog/*.ko.md 등) —
  //    슬러그를 그대로 두면 다른 언어에선 항상 404였다(Codex 점검 2026-11-04). 같은 언어의 목록으로 보낸다.
  if (p.kind === 'detail') return `/${target}/${p.rel.split('/')[0]}`;
  return `/${target}/${p.rel}`;
}

const LANGS: { key: PageLang; label: string; short: string }[] = [
  { key: 'ko', label: '한국어', short: 'KO' },
  { key: 'en', label: 'English', short: 'EN' },
  { key: 'ja', label: '日本語', short: 'JA' },
];

interface Props {
  // 헤더의 다른 드롭다운(☰ 메뉴)과 동시에 열리지 않도록 부모(HeaderNav)가 열림 상태를 관리·전달.
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// 모든 페이지 헤더에 노출. 번역 라우트가 없는 페이지(콘서트 상세 등 로케일별 독립 데이터)에서는
// 그 언어의 홈으로 안내(대상 페이지가 항상 존재하므로 dead link 없음).
export function LanguageSwitcher({ open, onOpenChange }: Props) {
  const pathname = usePathname();
  const parsed = parsePath(pathname);
  const ref = useRef<HTMLDivElement>(null);

  // 바깥 클릭·Esc로 닫기 (HeaderNav ☰ 메뉴와 동일 패턴)
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onOpenChange(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onOpenChange(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onOpenChange]);

  const current = LANGS.find(l => l.key === parsed.lang) ?? LANGS[0];

  return (
    <div className={styles.wrap} ref={ref}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => onOpenChange(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Language / 言語 / 언어"
      >
        <svg className="ic" aria-hidden="true"><use href="#ic-globe" /></svg>
        <span className={styles.triggerLabel}>{current.short}</span>
        <svg className={`ic ${styles.chevron} ${open ? styles.chevronOpen : ''}`} aria-hidden="true"><use href="#ic-chevron-down" /></svg>
      </button>

      {open && (
        <ul className={styles.menu} role="listbox">
          {LANGS.map(l => (
            <li key={l.key} role="presentation">
              <a
                href={parsed.lang === l.key ? pathname : buildUrl(l.key, parsed)}
                className={`${styles.item} ${parsed.lang === l.key ? styles.itemActive : ''}`}
                role="option"
                aria-selected={parsed.lang === l.key}
                onClick={() => {
                  // 수동 선택값을 쿠키에 저장 — proxy.ts가 '/' 진입 시 이 값을 최우선으로 사용.
                  document.cookie = `NEXT_LOCALE=${l.key}; path=/; max-age=31536000; SameSite=Lax`;
                  onOpenChange(false);
                }}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
