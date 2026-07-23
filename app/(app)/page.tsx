import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

// 실제 라우팅은 middleware.ts가 Accept-Language/쿠키 기준으로 처리(/ko, /en, /ja로 리다이렉트).
// 이 페이지는 미들웨어를 우회한 요청(엣지 케이스)에 대한 안전망일 뿐이라 색인 대상이 아님.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function RootPage() {
  redirect('/ko');
}
