// (app)/not-found.tsx와 동일한 내용 — 라우트 그룹(멀티 루트 레이아웃)에서는 not-found 경계가
// 그룹을 넘어가지 않아서, (app)/not-found.tsx가 (locale)/[lang]/** 안에서 터지는 notFound()는
// 못 잡는다(라우트 그룹마다 따로 있어야 함). 여기 없으면 Next.js 기본 무스타일 에러 화면으로 떨어짐.
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
