import nextVitals from 'eslint-config-next/core-web-vitals';

const config = [
  { ignores: ['.next/**', 'node_modules/**', 'public/**', 'next-env.d.ts'] },
  ...nextVitals,
  {
    rules: {
      // 이 프로젝트는 next/image를 일부러 쓰지 않는다(이미지 변환 요청 비용 — app/robots.ts 주석 참고).
      '@next/next/no-img-element': 'off',
      // 내부 링크를 일부러 <a href>로 둔다 — <Link>의 prefetch가 ISR 읽기를 불렸다(next.config.js 주석, 2026-09-07).
      '@next/next/no-html-link-for-pages': 'off',
      // React 19 린트의 새 규칙. 기존 코드(마운트 뒤 클라이언트 값으로 맞추는 패턴)가 여럿 걸려
      // 일단 경고로 둔다 — 새 코드에서 늘리지 말고, 고칠 때 하나씩 줄일 것.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/refs': 'warn',
    },
  },
];

export default config;
