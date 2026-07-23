// 라우트 전환마다 재마운트되어 콘텐츠를 부드럽게 페이드인.
// (transform 미사용 → 내부 position:fixed/sticky 깨지지 않음)
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="route-fade">{children}</div>;
}
