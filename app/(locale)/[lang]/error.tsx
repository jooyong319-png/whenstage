'use client';

// (app)/error.tsx와 동일한 내용 — 라우트 그룹(멀티 루트 레이아웃)마다 error 경계도 따로 필요하다
// (not-found.tsx와 같은 이유, 옆의 주석 참고).
export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="state-page">
      <span className="state-icon" aria-hidden="true">
        <svg className="ic"><use href="#ic-refresh" /></svg>
      </span>
      <h1>오류가 발생했어요</h1>
      <p>잠시 후 다시 시도해주세요.</p>
      <button type="button" onClick={reset} className="state-action">
        다시 시도
      </button>
    </div>
  );
}
