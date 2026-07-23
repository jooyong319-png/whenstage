// 라우트 전환 중 표시되는 스켈레톤 (Next App Router Suspense)
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
