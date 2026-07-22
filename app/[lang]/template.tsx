'use client';
import { motion } from 'motion/react';

// Next.js App Router template.tsx는 layout.tsx와 달리 라우트가 바뀔 때마다 새로 마운트된다 —
// 그 특성을 이용해 페이지 진입마다 살짝 페이드+슬라이드업으로 등장하게 한다(MotionConfig의
// reducedMotion="user"가 상위 레이아웃에서 이미 적용돼 있어 별도 체크 불필요).
export default function LocaleTemplate({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
