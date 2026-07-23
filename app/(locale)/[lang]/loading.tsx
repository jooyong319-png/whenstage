// (app)/loading.tsx와 동일한 내용 — 라우트 그룹(멀티 루트 레이아웃)이라 로딩 경계도 그룹마다
// 따로 있어야 실제 콘텐츠 페이지(/ko, /en, /ja 전부) 전환 중 스켈레톤이 계속 뜬다.
export default function Loading() {
  return (
    <div className="route-skeleton" aria-hidden="true">
      <div className="sk-line sk-title" />
      <div className="sk-grid">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="sk-card" />
        ))}
      </div>
    </div>
  );
}
