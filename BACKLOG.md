# BACKLOG.md — 기획→개발 인계 큐

`prompts/PRODUCT_PLANNER.md`가 항목을 추가하고, `prompts/PRODUCT_DEVELOPER.md`가 "대기" 상태인 항목을
위에서부터 하나씩 가져가 구현한다. 사람이 직접 항목을 추가/수정해도 된다.

⚠️ 두 프롬프트 모두 **기존 항목을 삭제하지 않는다** — 상태만 바꾼다(대기 → 진행중 → 완료/보류).
완료된 항목도 지우지 말 것(무엇을 언제 왜 했는지의 기록 자체가 자산).

## 상태 값
- `대기` — 아직 아무도 안 건드림
- `진행중` — 개발 담당이 지금 작업 중(같은 실행 안에서 끝나야 하며, 다음 실행 시작할 때
  `진행중`인 게 남아있으면 이전 실행이 실패한 것 — 원인 확인 후 `대기`로 되돌리거나 `보류`로 표시)
- `완료` — 구현+검증+커밋까지 끝남(커밋 해시 기록)
- `보류` — 시도했으나 실패했거나(타입체크/빌드 실패 등), 사람 판단이 필요해서 멈춤(사유 기록)

---

<!-- 아래에 항목 추가. 형식은 prompts/PRODUCT_PLANNER.md §5 참고. -->

## [20260723-01] 소셜 공유용 루트 잔재 `og-image.png`(gcalen 스캐폴드) 제거
- 상태: 대기
- 등록일: 2026-07-23
- 우선순위: P2(있으면 좋음 — 죽은 에셋 정리)
- 근거: 저장소 루트에 `og-image.png`(32,694B, md5 248263a0…)가 남아있는데, `git log`상
  마지막 변경이 2026-07-21 초기 스캐폴드 커밋(cea0056 "gcalen에서 콘서트로 재구성")이다.
  Next.js App Router는 루트 파일을 정적 서빙하지 않고 `public/`만 서빙하며, 실제 OG/트위터
  카드가 참조하는 건 `public/og-image.png`(19,052B, md5 45082a9…, 2026-07-23 e7007a5에서
  새 브랜드로 재생성)다. 전체 코드에서 URL `/og-image.png`만 참조하므로 루트 파일은 그
  무엇도 참조하지 않는 순수 죽은 에셋(구 브랜드 이미지일 가능성 큼). `grep -rn og-image`로
  루트 파일을 읽는 코드·스크립트가 없음을 확인.
- 스펙:
  - 저장소 루트의 `og-image.png` 파일 1개를 삭제한다(`git rm og-image.png`).
  - `public/og-image.png`는 현재 실서빙 파일이므로 절대 건드리지 않는다.
  - 삭제 후 어떤 코드도 루트 파일을 참조하지 않았으므로 빌드/타입 영향 없음을 확인만 한다.
- 완료 조건:
  - [ ] 루트 `og-image.png`가 저장소에서 제거됨
  - [ ] `grep -rn "og-image" .`(node_modules 제외) 결과에 루트 파일을 가리키는 참조가 없음(원래 없음) 재확인
  - [ ] `npm run build` 통과(OG/트위터 카드가 여전히 `public/og-image.png`로 정상 해석)
- 범위 아닌 것:
  - `public/og-image.png`, `app/api/asset/og-image` 라우트, 콘서트 상세의 `image_url` 폴백 로직은 그대로 둔다(정상 동작 중).

## [20260723-02] KO 위시리스트 카피 용어 통일(`찜` ↔ `즐겨찾기` 혼용 정리)
- 상태: 완료 (2026-07-23, 커밋 47d4bd3)
- 처리 결과: 오너가 직접 "찜으로 통일" 지시 → **"즐겨찾기"가 아니라 "찜"으로 수렴**(아래
  스펙이 1순위로 제안한 방향과 반대). `favorited`→'찜함', `favorite`→'찜하기',
  `myWishlist`→'내 찜', `wishlistEmptyText`/`wishlistEmptyHint`/`removeFromWishlistAria`도
  전부 '찜' 계열로 교체. 겸사겸사 `WishlistButton.tsx`가 로케일 무관 "즐겨찾기"를
  하드코딩해 EN/JA에서도 한국어가 뜨던 버그도 같이 수정(CAL.favorited/favorite 연결).
  타입체크 ✅ / 빌드 ✅ / 실제 배포 페이지 curl 검증 ✅. **다음 사이클에서 이 항목의 스펙
  방향("즐겨찾기로 수렴")을 다시 적용하지 말 것.**
- 등록일: 2026-07-23
- 우선순위: P2(확실한 UX 카피 개선)
- 근거: `lib/i18nLabels.ts` KO 블록에서 같은 위시리스트 기능을 두 용어로 뒤섞어 부른다 —
  `wishlist:'찜'`, `wishlistOnly:'찜한 것만 보기'`, `addToWishlist:'찜하기'`,
  `removeFromWishlist:'찜 해제'`(찜 계열)와 `favorited:'즐겨찾기됨'`, `favorite:'즐겨찾기'`,
  `myWishlist:'내 즐겨찾기'`, `wishlistEmptyText:'아직 즐겨찾기한 일정이 없어요.'`,
  `wishlistEmptyHint:'…즐겨찾기 버튼을 눌러 추가하세요.'`, `removeFromWishlistAria:'…즐겨찾기 제거'`
  (즐겨찾기 계열)가 공존. 사용자가 필터 칩에선 "찜", 상세/위시 페이지에선 "즐겨찾기"를 보게
  돼 같은 동작이 다른 기능처럼 느껴진다. EN/JA는 전부 "Wishlist/wishlist"로 일관되므로 KO만
  해당. `wiki/todo.md`의 "i18nLabels CAL 딕셔너리 wishlist 문구 점검" 플래그와도 일치.
- 스펙:
  - `lib/i18nLabels.ts` **KO 블록 한정**으로 위시리스트 관련 문구의 표기를 하나로 통일한다.
    별 아이콘(★) UI와 의미가 맞는 "즐겨찾기"로 수렴하는 것을 1순위 방향으로 제안(개발 담당이
    두 방향 중 택1하되 KO 전체에서 하나만 남길 것). 대상 키: `wishlist`, `wishlistOnly`,
    `addToWishlist`, `removeFromWishlist`, `favorite`, `favorited`, `myWishlist`,
    `myWishlistSub`, `wishlistEmptyText`, `wishlistEmptyHint`, `removeFromWishlistAria`,
    `notifyNormalSub`("찜한 일정 …") 등 '찜'/'즐겨찾기'가 쓰인 모든 값.
  - 인터페이스 키 이름(`wishlist*`)은 그대로 두고 **표시 문자열만** 바꾼다.
- 완료 조건:
  - [ ] KO 위시리스트 관련 표시 문자열에서 '찜'과 '즐겨찾기'가 혼용되지 않고 한 용어로 통일됨
  - [ ] EN/JA 블록은 변경 없음
  - [ ] `npm run typecheck` / `npm run build` 통과
- 범위 아닌 것:
  - EN/JA 문구, 인터페이스 타입 키 이름 변경, 위시리스트 기능 로직은 손대지 않는다.

## [20260723-03] gcalen 잔재 CSS 모듈명 `PreRegCountdown.module.css` → 컴포넌트명과 일치하게 정리
- 상태: 대기
- 등록일: 2026-07-23
- 우선순위: P2(네이밍 정합성 — 소소한 기술부채)
- 근거: `components/TicketingPhase.tsx`가 `import styles from './PreRegCountdown.module.css'`로
  이름이 어긋난 CSS 모듈을 참조한다. "PreReg(=사전예약, pre-registration)"는 gcalen(게임
  출시) 시절 개념이고 현재 콘서트 도메인엔 사전예약이 없다(선예매/일반예매 티켓팅 단계 =
  TicketingPhase). 컴포넌트는 이미 `TicketingPhase`로 리네임됐는데 CSS 파일만 옛 이름으로
  남아 컴포넌트↔스타일 파일 짝이 어긋나 있다. 2026-07-23 오버홀 때 정리한 orphan 컴포넌트
  목록엔 이 파일이 "실제 사용 중"이라 안 잡혔지만, 사용 중이더라도 이름 불일치는 남아있음.
- 스펙:
  - `components/PreRegCountdown.module.css`를 `components/TicketingPhase.module.css`로
    파일명 변경(`git mv`)하고, `components/TicketingPhase.tsx`의 import 경로를 새 파일명으로
    갱신한다. **CSS 셀렉터/규칙 내용과 컴포넌트 로직은 한 글자도 바꾸지 않는다**(순수 리네임).
  - 다른 파일이 `PreRegCountdown.module.css`를 참조하지 않는지 확인(현재 TicketingPhase 단 1곳).
- 완료 조건:
  - [ ] 파일명이 `TicketingPhase.module.css`로 바뀌고 import가 정상 갱신됨
  - [ ] `grep -rn "PreRegCountdown" .`(node_modules 제외) 결과 0건
  - [ ] `npm run typecheck` / `npm run build` 통과, 티켓팅 단계 UI 시각적 변화 없음
- 범위 아닌 것:
  - `Game`/`GameRow`/`GameModal` 등 `Game` 인터페이스 계열 대규모 리네임은 이번 범위가 아니다
    (`wiki/decisions.md`가 우선순위 낮음으로 명시, 섣불리 손대지 말 것).

## [20260723-04] `notFound()` 발생 페이지가 HTTP 200을 반환하는 soft-404 조사·수정
- 상태: 대기
- 등록일: 2026-07-23
- 우선순위: P1(SEO 직접 영향 — 구글이 soft-404로 플래그하면 검색 노출에 불이익)
- 근거: 존재하지 않는 콘서트 id(`/ko/concert/<없는-id>`)나 아예 매칭 안 되는 경로
  (`/totally-bogus-path`)로 접속하면 `app/(locale)/[lang]/not-found.tsx`/
  `app/(app)/not-found.tsx`(브랜드 "페이지를 찾을 수 없어요" 화면)가 정상적으로 렌더링은
  되는데, 실제 HTTP 응답 상태 코드가 **200**으로 나간다(404가 아님) — 프로덕션 빌드
  (`next build && next start`)로 `curl -D -`로 직접 확인함. 2026-07-23 SEO 작업(멀티 루트
  레이아웃 전환, 커밋 16403d6) **이전 원본 구조에서도 동일하게 재현**되는 걸 별도로
  확인했으므로 이번 리팩터로 생긴 회귀가 아니라 원래부터 있던 문제. 구글은 이런 "화면은
  404처럼 보이는데 상태 코드는 200"인 페이지를 soft-404로 판단해 검색 결과에서 불이익을
  줄 수 있다.
- 스펙:
  - Next.js 14.2.5 App Router에서 `notFound()`/`not-found.tsx` 렌더 시 실제 응답 상태
    코드가 200으로 나가는 원인을 조사한다(App Router의 알려진 이슈/설정 문제일 가능성,
    `next.config.js`의 `experimental` 설정 관련일 가능성, 또는 별도 원인).
  - 수정 후 `next build && next start`로 재현했던 두 케이스(존재하지 않는 concert id,
    완전히 매칭 안 되는 경로)를 `curl -D -`로 재검증해 상태 코드가 404로 나오는지 확인한다.
  - 만약 Next.js 프레임워크 레벨의 알려진 제약으로 코드 수정만으로는 해결 불가능하다고
    판단되면(예: 특정 렌더링 모드의 근본 한계), 그 조사 결과와 근거를 이 항목에 기록하고
    `상태: 보류`로 남긴다 — 억지로 우회 수정하지 않는다.
- 완료 조건:
  - [ ] `/ko/concert/<존재하지-않는-id>` 요청 시 HTTP 404 응답(브랜드 not-found 화면 유지)
  - [ ] `/totally-bogus-path`(로케일 세그먼트조차 없는 경로) 요청 시 HTTP 404 응답
  - [ ] 정상 페이지(`/ko`, `/ko/concert/<실제-id>` 등)는 계속 200 응답(회귀 없음)
  - [ ] `npm run typecheck` / `npm run build` 통과
- 범위 아닌 것:
  - not-found 화면의 디자인/문구 변경은 이번 범위가 아니다(상태 코드만 고친다).
  - `app/(locale)/[lang]/`·`app/(app)/` 멀티 루트 레이아웃 구조 자체를 되돌리는 것은
    범위 아님(2026-07-23 SEO 작업의 핵심 목적이므로 유지).
