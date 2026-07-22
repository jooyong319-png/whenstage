'use client';
import type { ReactNode } from 'react';
import { motion, useReducedMotion, type Variants } from 'motion/react';

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.02 } },
};
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 320, damping: 28 } },
};

interface GroupProps { children: ReactNode; className?: string; }

// 그리드/리스트 컨테이너 — 자식(RevealItem)들을 스크롤 진입 시 순차적으로(stagger) 등장시킨다.
// prefers-reduced-motion이면 애니메이션 없이 그냥 렌더(레이아웃은 동일하게 유지).
export function RevealGroup({ children, className }: GroupProps) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
    >
      {children}
    </motion.div>
  );
}

interface ItemProps { children: ReactNode; className?: string; }

// RevealGroup의 자식 — fade+slide-up으로 개별 등장(부모의 staggerChildren이 순서를 조율).
export function RevealItem({ children, className }: ItemProps) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}
