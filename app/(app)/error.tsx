'use client';

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
