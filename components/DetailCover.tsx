'use client';
import { useEffect, useRef, useState } from 'react';
import type { Category } from '@/lib/types';

interface Props {
  imageUrl: string | null;
  alt: string;
  category: Category;
}

// 상세 페이지 풀폭 커버 히어로 — 자르지 않고(contain) 남는 여백은 같은 이미지 블러로 채움.
// 이미지 없거나 로드 실패 시 커버째 숨김(BlogHero와 동일 — 큰 빈 플레이스홀더보다 깔끔).
export function DetailCover({ imageUrl, alt, category }: Props) {
  const [imgError, setImgError] = useState(false);
  const ref = useRef<HTMLImageElement>(null);
  // 하이드레이션 전에 이미 로드 실패한 이미지는 onError를 못 잡으므로 마운트 시 직접 확인.
  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) setImgError(true);
  }, [imageUrl]);
  if (!imageUrl || imgError) return null;

  return (
    <div className={`detail-thumb cat-bg-${category}`}>
      <img src={imageUrl} alt="" aria-hidden="true" className="cover-bg" loading="eager" />
      <img
        ref={ref}
        src={imageUrl}
        alt={alt}
        className="cover-fg"
        loading="eager"
        fetchPriority="high"
        onError={() => setImgError(true)}
      />
    </div>
  );
}
