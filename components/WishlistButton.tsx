'use client';
import { useWishlist } from '@/hooks/useWishlist';
import { useLocale } from '@/hooks/useLocale';
import { CAL } from '@/lib/i18nLabels';

// 정적(SSG) 상세 페이지에서 쓰는 찜 토글 — 모듈 싱글톤 store 공유.
export function WishlistButton({ id, className }: { id: string; className?: string }) {
  const lang = useLocale();
  const t = lang ? CAL[lang] : null;
  const wishlist = useWishlist();
  const on = wishlist.has(id);
  return (
    <button
      type="button"
      className={`${className ?? ''} ${on ? 'is-wished' : ''}`}
      onClick={() => wishlist.toggle(id)}
      aria-pressed={on}
    >
      <svg className={`ic ${on ? 'ic-fill' : ''}`} aria-hidden="true"><use href="#ic-star" /></svg>
      {t ? (on ? t.favorited : t.favorite) : (on ? '찜함' : '찜하기')}
    </button>
  );
}
