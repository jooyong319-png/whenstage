export default function NotFound() {
  return (
    <div className="state-page">
      <span className="state-icon" aria-hidden="true">
        <svg className="ic"><use href="#ic-calendar" /></svg>
      </span>
      <h1>페이지를 찾을 수 없어요</h1>
      <p>요청하신 일정이나 페이지가 없거나 삭제되었습니다.</p>
      <a href="/" className="state-action">← 메인으로 돌아가기</a>
    </div>
  );
}
