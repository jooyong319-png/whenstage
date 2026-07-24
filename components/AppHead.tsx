// 루트 레이아웃 2종((locale)/[lang]와 (app))이 공유하는 <head> 내용 — 테마 초기화 스크립트(FOUC 방지)
// + 폰트 프리로드. lang 속성 자체는 이제 각 루트 레이아웃이 서버에서 params.lang으로 직접 렌더링하므로
// (기존에 있던 클라이언트 lang 패치 스크립트는 더 이상 필요 없어 제거함).
export function AppHead() {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html:
            "(function(){try{var t=localStorage.getItem('theme')||'dark';document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();",
        }}
      />
      <link rel="preload" href="/fonts/PretendardVariable.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
    </>
  );
}
