'use client';
import type { ReactNode } from 'react';
import { MotionConfig } from 'motion/react';

// reducedMotion="user": OS의 prefers-reduced-motion 설정을 감지해 transform 기반 모션(hover
// lift, tap scale, layout 애니메이션 등)을 자동으로 꺼준다 — 컴포넌트마다 따로 체크할 필요 없음.
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
