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
- 상태: 완료 (2026-07-24, 커밋 f6a5134)
- 등록일: 2026-07-23
- 처리 기록(2026-07-24, 개발 담당): 루트 `og-image.png` 1개를 `git rm`으로 삭제. 검증 = **코드 리뷰 + 타입체크**(오너 합의로 저위험 항목은 무거운 `npm run build` 생략, `prompts/PRODUCT_DEVELOPER.md` 개정 참고). 타입체크(`npm run typecheck`) ✅ 통과, `grep`으로 루트 파일을 직접 읽는 코드 0건 재확인(모든 참조는 URL `/og-image.png` = `public/og-image.png`로 해석). 순수 죽은 에셋 삭제라 빌드 영향 없음. (경위: 앞선 시도에서 클라우드 샌드박스가 270페이지 SSG 빌드를 완주 못 해 한때 `보류`였으나, 저위험 항목 검증 기준을 타입체크로 조정하며 완료 처리.)
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
- 상태: 완료 (2026-07-24, 커밋 53218d0)
- 등록일: 2026-07-23
- 처리 기록(2026-07-24, 개발 담당): `git mv components/PreRegCountdown.module.css components/TicketingPhase.module.css`로 순수 리네임, `components/TicketingPhase.tsx` 6행 import 경로를 `./TicketingPhase.module.css`로 갱신. CSS 셀렉터/규칙·컴포넌트 로직은 한 글자도 안 바꿈(rename diff 0줄). 검증 = **타입체크 + 코드 리뷰**(저위험 5-A 항목이라 무거운 `npm run build` 생략): `npx tsc --noEmit` ✅ 통과, `PreRegCountdown` 코드(.ts/.tsx/.css/.js) 참조 0건 재확인(남은 매치는 BACKLOG/wiki/PROJECT_STATUS 등 이력·설명 문서뿐 — 6-C상 단순 리네임은 위키 갱신 트리거 아님이라 문서는 손대지 않음).
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
- 상태: 보류 (2026-07-24 — 고위험 항목, 샌드박스 빌드 완주 불가로 런타임(HTTP 상태 코드) 검증 미완 → 로컬/Vercel 위임)
- 등록일: 2026-07-23
- 처리 기록(2026-07-24, 개발 담당): 근본 원인 조사 완료 + 후보 수정 준비(타입체크 ✅)했으나 §5-B에 따라 코드 push 보류. 이 항목은 완료 조건이 `next build && next start` + `curl -D -`로 HTTP 상태 코드(404)를 확인하는 **런타임 검증 필수의 고위험(라우팅/프레임워크) 변경**인데, 이 클라우드 샌드박스는 프로덕션 빌드가 정적 생성 단계("Generating static pages 0/314")에서 이번에도 멈춰(39/314 생성 후 130초+ 무진행) 완주 못 함 → 그린 빌드·런타임 상태 코드 미확인. 조사 결과: (1) 미존재 콘서트 id 케이스 — `concert/[id]`·`artist/[slug]`·`venue/[slug]`·`news/[slug]`·`blog/[slug]` 다섯 동적 라우트가 `generateStaticParams`는 있으나 `export const dynamicParams = false`가 없어, 정적 목록에 없는 param을 요청하면 온디맨드 렌더되며 `notFound()`가 200으로 나가는 게 유력 원인. 후보 수정 = 위 5개 파일에 `export const dynamicParams = false;` 추가(`npx tsc --noEmit` ✅ 통과 확인, 코드는 §6-B에 따라 되돌림). (2) 로케일 세그먼트조차 없는 완전 미매칭 경로(`/totally-bogus-path`) 케이스 — param 문제가 아니라 전역 not-found 상태 문제. 이 앱은 루트 `app/layout.tsx`가 없고(두 레이아웃 모두 route group 내부) 루트 `app/not-found.tsx`도 없어 route group만으로 전역 404가 200으로 떨어지는 것으로 추정 → `dynamicParams`로는 안 고쳐지고, 루트 레이아웃 부재 탓에 루트 not-found 추가가 까다로워 신중한 작업+런타임 검증 필요(규칙 9). 권장: 전체 빌드가 도는 로컬(`d:/Gcalen/whenstage`) 또는 Vercel 프리뷰에서 (1) 후보 수정 적용 후 `curl -D -`로 두 케이스(미존재 id·완전 미매칭 경로) 재현·검증, (2)는 루트 전역 not-found 방식을 별도 조사. 검증 통과 시 완료 처리.
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

## [20260724-01] 쉼표로 여러 아티스트를 한 `developer`에 담은 항목이 "합쳐진 유령 아티스트"로 묶이는 문제
- 상태: 보류 (2026-07-24 — 구현·타입체크·단위테스트 완료, 고위험 변경이라 전체 빌드 검증 필요한데 샌드박스 빌드 완주 불가 → 브랜치에 올리고 로컬/Vercel 프리뷰 검증에 위임)
- 등록일: 2026-07-24
- 처리 기록(2026-07-24, 개발 담당): 스펙대로 구현 완료 후 §5-B에 따라 main 직접 push 보류. 구현 내용 = (1) `lib/types.ts`에 `splitArtists(developer): string[]` 신설 — 괄호(반각/전각) 깊이를 존중해 최상위 쉼표에서만 분리, 알려진 단일-아티스트 예외 목록(`Tyler, the Creator`/`Earth, Wind & Fire`/`Crosby, Stills & Nash` 등)과 "쉼표 뒤 소문자 조각은 앞과 재병합"(관사·접속사) 이중 가드로 false split 방지("확신 없으면 안 쪼갠다" 원칙). (2) `lib/artists.ts` `getAllArtists()` 그룹핑을 splitArtists 기반으로 교체 — 한 콘서트가 여러 아티스트 그룹에 동시 소속 가능, 대표 표시명은 developer 원문이 아니라 분리된 개별 아티스트명 중 최장 표기(합쳐진 유령 카드 제거). (3) `concert/[id]/page.tsx` 아티스트 칩을 아티스트별 개별 링크로 렌더(합쳐진 슬러그 링크 0건), 사이드바 '다른 일정'은 대표(첫) 아티스트 기준. **검증**: `npx tsc --noEmit` ✅ 오류 0 + splitArtists 단위테스트 9케이스 ✅(실데이터 `Avenged Sevenfold, Good Charlotte`/`Lupe Fiasco, Gym Class Heroes, B.o.B`/`ZZ Top, Cheap Trick`/`Djo (Joe Keery), Pond` 4건 정상 분리, `Tyler, the Creator`·`Earth, Wind & Fire`·`Crosby, Stills, Nash & Young`·`에스파(aespa)` 미분할). 코드 리뷰 = 합쳐진 슬러그로 가는 아티스트 **링크** 잔존 0건(남은 `normalizeArtistKey(g.developer)` 3곳은 이미지 폴백/검색 별칭 조회라 링크 아님, 범위 밖). **미완**: 완료 조건의 `npm run build`(고위험 §5-B 필수)가 이 클라우드 샌드박스에서 완주 못 함(webpack 컴파일 단계에서 7분+ 무진행, 정적 생성 도달 못 함 — 알려진 환경 제약). 규칙 1에 따라 검증 안 된 고위험 코드를 main에 push하지 않음. 대신 코드는 브랜치 **`feature/20260724-01-split-artists`**(원격 푸시 완료)에 보존 — main으로 배포 안 됨. **다음 단계(사람)**: 로컬(`d:/Gcalen/whenstage`) 또는 Vercel 프리뷰에서 `npm run build` 통과 + `/en/artist`에서 합쳐진 유령 카드 사라짐/개별 분리, 콘서트 상세 칩 개별 링크, KO 회귀 없음을 확인한 뒤 main 병합하고 이 항목을 `완료`로 처리.
- 우선순위: P1(잘못된 아티스트 페이지가 실제로 노출·색인 + 콘텐츠 파이프라인 오탐을 매 사이클 유발)
- 근거: 라이브 `https://whenstage.com/en` 확인 + 코드/데이터 대조로 확정. `lib/artists.ts`
  `getAllArtists()`가 `normalizeArtistKey(g.developer)` 하나를 그룹 키로 쓰는데,
  `data/concerts.en.json`에 `"developer": "Avenged Sevenfold, Good Charlotte"`,
  `"developer": "Lupe Fiasco, Gym Class Heroes, B.o.B"`처럼 쉼표로 여러 아티스트를 한 필드에
  담은 항목이 있어(EN 2건, KO/JA 0건) 이 둘이 각각 "Avenged Sevenfold, Good Charlotte" /
  "Lupe Fiasco, Gym Class Heroes, B.o.B"라는 **하나의 합쳐진 유령 아티스트 카드**로
  `/en/artist` 목록·상세에 뜬다. 콘서트 상세(`app/(locale)/[lang]/concert/[id]/page.tsx`
  82·186행)의 아티스트 칩도 `/artist/{normalizeArtistKey(developer)}` 즉 이 합쳐진 슬러그로
  링크된다. 전자는 이미 그 합친 키로 bio/이미지가 채워져 있고, 후자(Lupe Fiasco…)는 프로필이
  비어 `prompts/PLANNER.md`가 매 사이클 "프로필 필요" 오탐 신호를 낸다(이미 `PROJECT_STATUS.md`
  "제안(승인 대기)" 2026-07-23 항목으로 기록돼 있던 관찰을 이번에 backlog로 이관·구체화).
- 스펙:
  - 한 `developer` 문자열에 여러 아티스트가 담긴 경우 이를 개별 아티스트로 분리해 각자
    자기 카드/그룹으로 묶이도록 `lib/artists.ts` `getAllArtists()`의 그룹핑을 고친다.
    분리용 헬퍼(예: `splitArtists(developer): string[]`)를 만들어, `getAllArtists()`가 한
    콘서트를 분리된 아티스트 각각의 그룹에 넣도록 한다(한 콘서트가 여러 아티스트 그룹에 동시
    소속될 수 있음).
  - **분리 규칙의 오탐(false split)을 반드시 막을 것** — "Tyler, the Creator", "Earth, Wind & Fire"
    처럼 아티스트명 자체에 쉼표가 들어가는 케이스를 단순 `split(',')`로 쪼개면 안 된다.
    구현 방향(개발 담당 재량): 쉼표 분리 후 각 조각을 트림하되, 알려진 예외를 거르는
    작은 큐레이션 목록(또는 데이터에 명시적 다중-아티스트 구분자 도입)을 쓰는 등 보수적으로.
    확신 없으면 안 쪼개는 게 원칙(틀리게 합치는 것보다 틀리게 쪼개는 게 더 나쁨).
  - 콘서트 상세(`concert/[id]/page.tsx`)의 아티스트 칩(186행)과 사이드바(82·102행)도 분리에
    맞춰 손본다 — 다중 아티스트면 칩을 아티스트별로 각각 렌더하거나, 최소한 존재하는 개별
    아티스트 슬러그로 링크가 가게 한다(합쳐진 슬러그로 링크가 남지 않게).
  - 처리 후 `PROJECT_STATUS.md`의 해당 "제안(승인 대기)" 항목 옆에 "→ 20260724-01로 backlog
    이관" 한 줄을 남긴다(제안이 계속 미결로 보이지 않게 — 삭제는 사람 몫이므로 표시만).
- 완료 조건:
  - [ ] `/en/artist` 목록에 "Avenged Sevenfold, Good Charlotte" / "Lupe Fiasco, Gym Class Heroes, B.o.B" 같은 합쳐진 유령 카드가 사라지고 개별 아티스트로 분리돼 나온다
  - [ ] 위 두 콘서트의 상세 페이지 아티스트 칩이 존재하는 개별 아티스트 슬러그로 링크된다(합쳐진 슬러그 링크 0건)
  - [ ] 쉼표가 이름에 든 단일 아티스트(회귀 테스트용: "Tyler, the Creator" 같은 예)가 잘못 쪼개지지 않는다
  - [ ] `npm run typecheck` / `npm run build` 통과
- 범위 아닌 것:
  - `data/concerts.*.json` 콘텐츠 편집(리서처 담당 영역 — 코드로 데이터를 고치지 않는다)
  - `developer` 필드를 문자열→배열로 바꾸는 전면 스키마 마이그레이션(수십 컴포넌트 영향, 별도 대형 항목으로 미룸 — `wiki/decisions.md`가 필드 리네임/구조 변경을 우선순위 낮음으로 명시)
  - 공연장(`platforms`) 그룹핑(`lib/venues.ts`)은 다중-공연장 사례가 관측되지 않아 이번 범위 아님

## [20260724-02] 비-한국어 로케일(EN/JA)에서 카테고리 배지가 한국어(`cat.short`)로 새는 로케일 누수
- 상태: 완료 (2026-07-24, 커밋 dd0e0c6)
- 등록일: 2026-07-24
- 처리 기록(2026-07-24, 개발 담당): 스펙대로 6개 컴포넌트의 카테고리 표시 문자열을 검증된 `lang ? CATEGORY_LABELS[lang][category] : cat.short` 패턴(ScheduleCard/CategoryFilterBar과 동일)으로 교체. 변경: `UpcomingStrip.tsx:66`·`GameRow.tsx:90`·`WishlistView.tsx:60`(useLocale로 lang 보유, CATEGORY_LABELS import 추가), `FeaturedCards.tsx:59`(gameToCard의 `lang: Locale|null` 인자 사용, import 추가), `RelatedEventCard.tsx:33`(`lang: string` prop이라 `CATEGORY_LABELS[lang as Locale]?.[category] ?? cat.short`로 캐스팅+폴백, CATEGORY_LABELS·Locale import 추가), `CalendarView.tsx:247`(날짜 셀 title tooltip, 이미 CATEGORY_LABELS import돼 있어 `CATEGORY_LABELS[lang][category]`로 교체). `CATEGORY_META.short` 한국어 값·색/아이콘 메타는 불변, ko 폴백으로만 유지. **검증 = 타입체크 + 코드 리뷰**(저위험 5-A 표시 문자열 변경이라 무거운 `npm run build` 생략): `npx tsc --noEmit` ✅ 통과(오류 0), `grep -rn "\.short" components/` 결과 표시용(로케일 미적용) `cat.short` 잔존 0건 — 6곳 모두 로케일 삼항의 폴백 분기로만 남고, `HeroSpotlight.tsx:181`·`concert/[id]/page.tsx:273`는 **-03 범위라 의도적으로 건드리지 않음**, `LanguageSwitcher.current.short`는 언어명이라 예외. 전체 빌드는 환경 되면 Vercel 프리뷰에서 EN/JA 배지 육안 확인 권장(SSG 완주 못 하는 샌드박스 제약).
- 우선순위: P1(EN/JA 실사용·색인 페이지에 한국어가 그대로 노출 — 로케일 신뢰도·SEO 직접 영향)
- 근거: 라이브 `https://whenstage.com/ja` 홈의 "近日の予定"(`UpcomingStrip`) 카드 배지가
  「콘서트 / 음원발매 / 페스티벌 / 팬미팅」로 **한국어 그대로** 뜬다(같은 페이지 상단 필터바와
  "本日の予定" 카드는 「コンサート・来日公演」 등 정상 일본어라 한 화면 안에서 언어가 섞여
  보임). 원인은 `CATEGORY_META[cat].short`(`lib/types.ts` 132·136~139행)가 로케일 무관 한국어
  단일 문자열인데, 로케일 인식 라벨은 `CATEGORY_LABELS[lang][category]`(`lib/i18nLabels.ts` 15행,
  ko/en/ja 완비)로 별도로 존재하기 때문. 이미 검증된 패턴
  `lang ? CATEGORY_LABELS[lang][category] : cat.short`를 `ScheduleCard`(100행)·
  `CategoryFilterBar`(58행)는 쓰지만, 아래 컴포넌트들은 `cat.short`를 그대로 렌더해 EN/JA에서
  한국어가 샌다(전부 `use client` + 이미 로케일 접근 가능 확인):
  - `components/UpcomingStrip.tsx:66` — 배지(라이브 JA에서 실제 확인), `useLocale()`
  - `components/FeaturedCards.tsx:59` — `gameToCard(...)` 배지, 이미 `lang: Locale|null` 인자 받음
  - `components/GameRow.tsx:88` — 리스트 뷰 행 배지, `useLocale()`
  - `components/RelatedEventCard.tsx:33` — 사이드바 관련 일정 배지, 이미 `lang: string` prop 받음
  - `components/WishlistView.tsx:59` — 위시리스트 배지, `useLocale()`
  - `components/CalendarView.tsx:236` — 날짜 셀 `title`(tooltip/접근성 텍스트, 시각 배지 아님), `useLocale()`
- 스펙:
  - 위 6개 컴포넌트의 카테고리 표시 문자열을 `CATEGORY_META[cat].short` 직접 렌더 대신
    `lang ? CATEGORY_LABELS[lang][category] : CATEGORY_META[category].short`로 교체한다
    (`ScheduleCard`/`CategoryFilterBar`와 동일 패턴). `CATEGORY_LABELS`는 `@/lib/i18nLabels`에서 import.
  - 각 컴포넌트는 이미 lang을 보유: `UpcomingStrip`/`GameRow`/`WishlistView`/`CalendarView`는
    `useLocale()`, `FeaturedCards`는 `gameToCard(game, isPreReg, lang, now)` 인자, `RelatedEventCard`는
    `lang: string` prop — **새로 lang을 배선할 필요 없음**.
  - `CATEGORY_META.short`의 한국어 값 자체는 바꾸지 않는다(색/아이콘 메타 및 ko 폴백으로 계속
    사용됨). 로케일별 "짧은" 라벨을 새로 만들 필요 없음 — `CATEGORY_LABELS` 전체 라벨을 쓰는 게
    `ScheduleCard`와 일관됨. 배지 폭이 넘치면 CSS 처리는 개발 담당 재량이되 **한국어 노출 제거가
    최우선**.
- 완료 조건:
  - [ ] `https://whenstage.com/ja`·`/en` 홈 `UpcomingStrip` 배지가 각 로케일 언어로 표기(한국어 노출 0건)
  - [ ] 리스트 뷰(`GameRow`)·위시리스트·사이드바 관련 일정 카드·캘린더 날짜 셀 tooltip도 EN/JA에서 한국어 카테고리 라벨이 뜨지 않음
  - [ ] KO 페이지는 기존과 동일한 한국어 라벨 유지(회귀 없음)
  - [ ] `grep -rn "\.short" components/` 결과에서 표시용(로케일 미적용) `cat.short` 사용이 남지 않음(색/아이콘/폴백·`LanguageSwitcher`의 언어명 `current.short` 제외)
  - [ ] `npm run typecheck` 통과(표시 문자열만 바꾸는 저위험 변경 — `PROJECT_STATUS.md` 2026-07-24 개정된 검증 기준 적용, 전체 빌드는 환경 되면 Vercel 프리뷰로 확인 권장)
- 범위 아닌 것:
  - `CATEGORY_META`에 로케일별 `short` 필드를 신설하는 스키마 확장(현행 `CATEGORY_LABELS`로 충분, 불필요한 중복)
  - EN/JA 페이지 `meta-keywords`가 한국어로 고정된 별개 이슈 — 검색엔진이 사실상 무시하는 태그라 가치 낮음, 이번 범위 아님(이전 사이클에서도 저가치로 스킵됨)
  - 배지 문구/디자인 변경, `LanguageSwitcher`의 `current.short`(언어 이름이라 카테고리 라벨과 무관, 정상)

## [20260724-03] 홈 히어로·콘서트 상세 "관련 일정" 카테고리 배지 한국어 누수(20260724-02 미포함 잔여 2곳)
- 상태: 완료 (2026-07-25, 커밋 23f43ba)
- 등록일: 2026-07-24
- 처리 기록(2026-07-25, 개발 담당): 스펙대로 두 곳의 카테고리 표시 문자열을 검증된 `CATEGORY_LABELS[lang][category]` 패턴으로 교체. 변경: `components/HeroSpotlight.tsx:182`(히어로 스포트라이트 배지 `curCat.short`→`CATEGORY_LABELS[lang][cur.category]`, `CATEGORY_LABELS` import 신규 추가 — `lang`은 `Locale` prop이라 삼항 불필요), `app/(locale)/[lang]/concert/[id]/page.tsx:273`(관련 일정 카드 배지 `cat.short`→`CATEGORY_LABELS[lang][r.category]`, `CATEGORY_LABELS`는 8행에서 이미 import·`lang`은 `isLocale` 가드 후 `Locale`). `CATEGORY_META.short` 한국어 값·색/아이콘 메타는 불변(ko 폴백으로만 유지). **검증 = 타입체크 + 코드 리뷰**(저위험 5-A 표시 문자열 변경이라 무거운 `npm run build` 생략): `./node_modules/.bin/tsc --noEmit` ✅ 오류 0, `grep -rn '\.short' components/ 'app/(locale)'` 결과 표시용(로케일 미적용) `cat.short` 잔존 0건 — HeroSpotlight·콘서트 관련일정 배지 모두 로케일 라벨로 전환됐고, 남은 매치는 전부 `lang ? … : cat.short` 폴백 분기 또는 `CalendarView` title tooltip(-02 범위)·`LanguageSwitcher.current.short`(언어명, 예외)뿐. 전체 빌드는 환경 되면 Vercel 프리뷰에서 EN/JA 히어로·관련일정 배지 육안 확인 권장(SSG 완주 못 하는 샌드박스 제약).
- 우선순위: P1(EN/JA 최상단·고노출 영역에 한국어 노출 — 특히 홈 히어로는 페이지에서 가장 눈에 띄는 위치)
- 근거: `20260724-02`가 카테고리 배지 로케일 누수를 다루지만, 그 항목이 명시적으로 열거한 6개
  컴포넌트에 빠져 있고 완료 조건의 grep 범위가 `components/`로 한정돼 있어 아래 두 곳은 -02를
  구현·완료해도 그대로 한국어가 샌다(둘 다 -02 등록 커밋 031cc5b **이후**에 추가·잔존):
  - `components/HeroSpotlight.tsx:181` — 홈 히어로 스포트라이트 배지가 `curCat.short`(로케일 무관
    한국어)를 그대로 렌더. 이 컴포넌트는 히어로 캐러셀(커밋 b72414b, -02보다 나중)로 신설돼 -02
    목록에 없음. `lang: Locale`을 **prop으로 이미 보유**하나(16·26행) `CATEGORY_LABELS`는 import하지
    않고 `CATEGORY_META`만 import 중이라 import 추가가 필요.
  - `app/(locale)/[lang]/concert/[id]/page.tsx:271` — 콘서트 상세 "관련 일정" 카드의 `related-badge`가
    `cat.short`(한국어)를 렌더. 이 파일은 `app/` 아래라 -02 완료 조건의 `grep components/`에 애초에
    안 걸린다. `lang`(`params.lang`)과 `CATEGORY_LABELS`(8행에서 이미 import)를 이미 보유해 배선 추가
    불필요.
  라이브 `https://whenstage.com/ja` 홈에서 -02가 지적한 `UpcomingStrip` 한국어 누수(콘서트/음원발매/
  페스티벌/팬미팅)는 재확인됨 — 같은 근본 원인이 위 2곳에도 존재.
- 스펙:
  - 위 두 곳의 카테고리 표시 문자열을 `20260724-02`와 **동일한 검증된 패턴**으로 교체한다:
    `lang ? CATEGORY_LABELS[lang][category] : CATEGORY_META[category].short`. `CATEGORY_LABELS`는
    `@/lib/i18nLabels`에서 import(`HeroSpotlight.tsx`는 import 신규 추가, 콘서트 상세는 기존 import 재사용).
  - `HeroSpotlight`는 `lang` prop, 콘서트 상세는 `params.lang`을 그대로 쓴다 — **새로 lang을 배선할
    필요 없음**. `CATEGORY_META.short`의 한국어 값 자체는 바꾸지 않는다(색/아이콘 메타·ko 폴백으로 계속 사용).
  - `20260724-02`가 이미 진행/완료됐다면 겹치는 6개 컴포넌트는 건드리지 말고 이 두 곳만 처리한다
    (반대로 -02가 아직 대기면, 두 항목을 한 번에 처리해도 무방 — 패턴이 동일).
- 완료 조건:
  - [ ] `https://whenstage.com/ja`·`/en` 홈 히어로 스포트라이트 배지가 각 로케일 언어로 표기(한국어 노출 0건)
  - [ ] EN/JA 콘서트 상세 "관련 일정" 카드 배지가 각 로케일 언어로 표기(한국어 노출 0건)
  - [ ] KO 페이지는 기존 한국어 라벨 유지(회귀 없음)
  - [ ] `grep -rn "\.short" components/ "app/(locale)"` 결과에서 표시용(로케일 미적용) `cat.short`
        사용이 `HeroSpotlight`·콘서트 상세를 포함해 남지 않음(색/아이콘/폴백,
        `LanguageSwitcher`의 `current.short`, `CalendarView`의 `title` tooltip은 예외로 허용
        — 후자는 -02 범위)
  - [ ] `npm run typecheck` 통과(표시 문자열만 바꾸는 저위험 변경 — 전체 빌드는 환경 되면 Vercel 프리뷰로 확인 권장)
- 범위 아닌 것:
  - `20260724-02`가 이미 다루는 6개 컴포넌트(UpcomingStrip/FeaturedCards/GameRow/RelatedEventCard/
    WishlistView/CalendarView) 중복 처리
  - `CATEGORY_META`에 로케일별 `short` 필드 신설(현행 `CATEGORY_LABELS`로 충분)
  - 배지 문구/디자인/폭 변경(한국어 노출 제거가 최우선), `HeroSpotlight`의 캐러셀 로직·모션

## [20260725-01] 클라이언트 토스트가 하드코딩 한국어라 EN/JA 로케일에 그대로 새는 문제
- 상태: 완료 (2026-07-25, 커밋 331bcaf)
- 등록일: 2026-07-25
- 처리 기록(2026-07-25, 개발 담당): 스펙대로 두 곳의 하드코딩 한국어 토스트를 로케일화. (1) `hooks/useWishlist.ts:111` 찜 추가/제거 확인 토스트 — 같은 파일 `NUDGE_COPY`가 쓰던 검증된 `document.documentElement.lang` 로케일 판별 패턴을 따라, `lib/i18nLabels.ts` `CAL`에 `wishlistAddedToast`/`wishlistRemovedToast`를 ko/en/ja로 신설하고 `CAL[lang as Locale] ?? CAL.ko`로 문자열 선택(모듈 레벨 함수라 `useLocale()` 못 씀 → html lang 읽기가 맞음). (2) `components/ReportForm.tsx:45` 제보 실패 토스트 — 이미 받던 `locale` prop을 써 `CAL[locale as Locale] ?? CAL.ko`에서 `reportFailToast(label, reason)`/`reportUnknownError`를 신설·사용(“ 실패:”/“알 수 없음” 하드코딩 제거). `CAL` ja 찜 토스트는 파일 전반의 위시리스트 용어(お気に入り)와 통일. 한국어 값은 폴백(lang 미상 시 CAL.ko)으로 유지 — ko 페이지 문구 불변. **검증 = 타입체크 + 코드 리뷰**(저위험 5-A 표시 문자열 변경이라 무거운 `npm run build` 생략): `./node_modules/.bin/tsc --noEmit` ✅ 오류 0, `grep -rn '찜 목록에 추가됨\|찜 목록에서 제거됨' hooks/ components/` 및 `grep '실패:\|알 수 없음' components/ReportForm.tsx` 모두 표시 경로 잔존 0건(한국어는 CAL.ko 딕셔너리로만 존재). 전체 빌드는 환경 되면 Vercel 프리뷰에서 EN/JA 찜 토글·제보 실패 토스트 육안 확인 권장(SSG 완주 못 하는 샌드박스 제약).
- 우선순위: P2(확실한 i18n 개선 — 단, SEO 색인 대상이 아닌 일시적 클라이언트 토스트라 카테고리 배지 누수(-02/-03)보다 노출 지속성은 낮음. 대신 찜 토스트는 찜 토글마다 매번 뜨는 고빈도 UI)
- 근거: 코드 대조로 확정. 두 곳의 `showToast(...)` 호출이 로케일과 무관하게 한국어 문자열을 하드코딩해, EN/JA 사용자에게도 한국어 토스트가 그대로 뜬다 — 최근 사이클들이 반복해 고쳐온 "카테고리 배지 로케일 누수(-02/-03)"와 같은 클래스의 잔여 i18n 갭이고, `wiki/todo.md`의 "다듬을거리"에도 찜 토스트가 이미 플래그돼 있다.
  - `hooks/useWishlist.ts:111` — `showToast(added ? '찜 목록에 추가됨' : '찜 목록에서 제거됨')`. 찜 추가/제거 토글마다 매번 뜨는 고빈도 확인 토스트인데 로케일 분기가 없다. **바로 위 같은 파일**의 첫-찜 넛지(`NUDGE_COPY`, 9~13행 ko/en/ja 완비 + 32행에서 `document.documentElement.lang`로 현재 로케일을 읽는 패턴)가 이미 이 문제를 풀어놨으므로, 같은 파일 안에 따라 쓸 검증된 패턴이 있다. `toggleId`는 React 컴포넌트가 아니라 모듈 레벨 함수라 `useLocale()`을 못 쓰지만, `NUDGE_COPY`처럼 `document.documentElement.lang`을 읽으면 된다(멀티 루트 레이아웃이 `<html lang>`을 서버에서 정확히 렌더하므로 신뢰 가능).
  - `components/ReportForm.tsx:45` — `showToast(\`${submitLabel} 실패: ${r.error ?? '알 수 없음'}\`, 5000)`. `submitLabel`은 로케일 prop이지만 " 실패: " 접미사와 "알 수 없음" 폴백이 한국어 하드코딩. 이 컴포넌트는 `locale: string` prop(7~17행)을 이미 보유하므로 로케일 접근이 가능하다(제보 실패 경로라 노출 빈도는 낮지만 같은 클래스의 누수).
- 스펙:
  - `hooks/useWishlist.ts:111`의 확인 토스트 문자열을 로케일별로 분기한다. 구현 방향(개발 담당 재량): (a) `lib/i18nLabels.ts`의 `CAL` 딕셔너리에 `wishlistAddedToast`/`wishlistRemovedToast` 두 키를 ko/en/ja로 신설하고 — `CAL`은 순수 객체라 컴포넌트가 아닌 모듈 함수에서도 `import { CAL }` 후 `CAL[lang]`로 접근 가능 — `NUDGE_COPY`와 동일하게 `document.documentElement.lang`으로 lang을 읽어 문자열을 고르거나, (b) `NUDGE_COPY`처럼 이 파일 안에 작은 로케일 테이블을 두는 방식. `CAL`을 쓰는 (a)가 문구를 한 곳에서 관리하므로 권장.
  - `components/ReportForm.tsx:45`의 실패 토스트도 로케일화한다. `locale` prop을 이미 받으므로 `import { CAL, type Locale }` 후 `CAL[locale as Locale]`에서 "실패"/"알 수 없음"에 해당하는 라벨을 쓰거나, 상위 서버 페이지가 이미 다른 라벨들을 prop으로 내려주는 패턴을 따라 실패용 라벨(`failLabel` 등)을 prop으로 추가한다(둘 중 프로젝트 관례에 맞는 쪽 — 다른 라벨들이 전부 prop이므로 prop 추가가 더 일관될 수 있음).
  - 한국어 값 자체는 폴백으로 유지(lang 미상 시). ko 페이지는 기존과 동일 문구.
- 완료 조건:
  - [ ] EN/JA 로케일에서 찜 추가/제거 토스트가 각 로케일 언어로 뜬다(한국어 노출 0건), ko는 기존 문구 유지
  - [ ] EN/JA 로케일에서 제보 실패 토스트가 각 로케일 언어로 뜬다(한국어 " 실패:"/"알 수 없음" 노출 0건), ko는 기존 문구 유지
  - [ ] `grep -rn "찜 목록에 추가됨\|찜 목록에서 제거됨" hooks/ components/` 결과가 폴백 분기 외 표시 경로에 남지 않음
  - [ ] `npm run typecheck` 통과(표시 문자열만 바꾸는 저위험 변경 — 전체 빌드는 환경 되면 Vercel 프리뷰로 확인 권장)
- 범위 아닌 것:
  - `NotifyToggle.tsx`의 토스트(이미 `t ? t.notifyOnToast : '한국어'`로 로케일 분기됨 — 한국어는 SSR t=null 폴백일 뿐 정상)는 손대지 않는다.
  - 토스트 문구/디자인/지속시간 변경, `lib/toast.ts` 로직 변경(한국어 누수 제거가 최우선).
  - 카테고리 배지 누수(-02/-03가 담당) 중복 처리.

## [20260725-02] InstallPrompt(앱 설치 배너) 문구가 통째로 하드코딩 한국어라 EN/JA에 그대로 새는 문제
- 상태: 완료 (2026-07-25, 커밋 a02ee90)
- 등록일: 2026-07-25
- 처리 기록(2026-07-25, 개발 담당): 스펙대로 `components/InstallPrompt.tsx`의 하드코딩 한국어 표시 문자열(제목·3개 모드 sub·CTA 2종·aria-label 2종)을 전부 로케일화. `lib/i18nLabels.ts`의 `UI` 딕셔너리(앱 크롬 문구가 모여 있는 곳)에 install 배너용 키 8종(`installTitle`, `installSubIos`/`installSubPlay`/`installSubPwa`, `installCtaPlay`/`installCtaPwa`, `installAriaBanner`/`installAriaClose`)을 ko/en/ja로 신설(인터페이스 `UiStrings`에도 추가). 컴포넌트는 `use client`라 `hooks/useLocale.ts`의 `useLocale()`로 lang을 얻어 `const t = UI[lang]`로 참조 — `sub` 삼항·제목·CTA·aria가 모두 `t.install*`을 씀. 한국어 값은 `UI.ko` 폴백으로 유지(lang 미상 시 useLocale이 ko 반환)라 ko 배너 문구 불변. `PLAY_STORE_URL`·설치/dismiss 로직·모드 판별(iOS/PWA/Play)·`localStorage`·CSS는 한 줄도 안 건드림(표시 문자열만). **검증 = 타입체크 + 코드 리뷰**(저위험 5-A 표시 문자열 변경이라 무거운 `npm run build` 생략): `npm run typecheck`(tsc --noEmit) ✅ 오류 0, `grep -n "앱으로 설치하기\|Play 스토어\|앱 설치 안내" components/InstallPrompt.tsx` 결과 표시 경로 잔존 0건(남은 매치 2건은 파일 상단 주석뿐 — 표시 문자열 아님), `installTitle`이 인터페이스 1 + 3로케일 = 4곳 존재 확인. 전체 빌드는 환경 되면 Vercel 프리뷰에서 EN/JA 설치 배너(iOS/PWA/Play 3모드) 문구 육안 확인 권장(SSG 완주 못 하는 샌드박스 제약).
- 우선순위: P2(확실한 i18n 개선 — 단 SSR HTML에 안 실리는 조건부 클라이언트 배너라 SEO 색인 대상은 아님. 대신 EN/JA 사용자가 설치를 시도하는 순간 배너 전체가 한국어라 노출 시 이질감이 큼)
- 근거: 코드 대조로 확정. `components/InstallPrompt.tsx`는 `components/AppShell.tsx:67`에서 렌더돼 **모든 로케일(ko/en/ja) 공통 크롬**으로 붙는데, 배너에 뜨는 표시 문자열이 전부 로케일 분기 없이 한국어로 하드코딩돼 있다 — 최근 사이클들이 반복해 고쳐온 "하드코딩 한국어 로케일 누수(-01 토스트, -02/-03 카테고리 배지)"와 정확히 같은 클래스의 잔여 i18n 갭이고, `BACKLOG.md`·`wiki/todo.md` 어디에도 아직 등록되지 않았다. 해당 컴포넌트는 `use client`라 `hooks/useLocale.ts`(usePathname으로 `/ko|/en|/ja` 판별, ko 폴백)를 바로 쓸 수 있는데 현재는 `useLocale`을 import하지 않는다. 누수 위치:
  - `InstallPrompt.tsx:89` — 제목 `<strong>앱으로 설치하기</strong>`
  - `InstallPrompt.tsx:78~81` — 3개 모드별 설명(`sub`): iOS `'공유 버튼 → "홈 화면에 추가"로 설치하세요.'` / Play `'Google Play에서 설치하고 출시 알림까지 받아보세요.'` / PWA `'홈 화면에서 바로 열고, 출시 알림까지 받아보세요.'`
  - `InstallPrompt.tsx:94` — Play CTA 텍스트 `Play 스토어`
  - `InstallPrompt.tsx:98` — PWA 설치 버튼 텍스트 `설치`
  - `InstallPrompt.tsx:84` — 배너 `aria-label="앱 설치 안내"`, `:100` — 닫기 버튼 `aria-label="닫기"`
- 스펙:
  - `components/InstallPrompt.tsx`의 위 표시 문자열(제목·3개 sub·CTA 2종·aria-label 2종)을 로케일별로 분기한다. 구현 방향(개발 담당 재량): `hooks/useLocale.ts`의 `useLocale()`로 현재 lang을 얻고, 문구는 `lib/i18nLabels.ts`에 install 배너용 키(예: `installTitle`, `installSubIos`/`installSubPlay`/`installSubPwa`, `installCtaPlay`, `installCtaPwa`, `installAriaBanner`, `installAriaClose`)를 ko/en/ja로 신설해 `CAL[lang]` 또는 `UI[lang]`(프로젝트 관례에 맞는 쪽)에서 읽는다. 다른 로케일 UI 문구가 대부분 `CAL`/`UI` 딕셔너리에 모여 있으므로 거기에 추가하는 게 일관됨.
  - 한국어 값 자체는 폴백으로 유지(lang 미상 시 ko). ko 배너는 기존과 동일 문구.
  - `PLAY_STORE_URL`·설치 로직·`localStorage` dismiss·모드 판별(iOS/PWA/Play) 등 **동작 코드는 손대지 않는다**(표시 문자열만 로케일화).
- 완료 조건:
  - [ ] EN/JA 로케일에서 설치 배너의 제목·설명·CTA·aria-label이 각 로케일 언어로 뜬다(한국어 노출 0건), ko는 기존 문구 유지
  - [ ] iOS/PWA/Play 세 모드 문구가 각각 로케일화됨
  - [ ] `grep -n "앱으로 설치하기\|Play 스토어\|앱 설치 안내" components/InstallPrompt.tsx` 결과가 폴백/주석 외 표시 경로에 남지 않음
  - [ ] `npm run typecheck` 통과(표시 문자열만 바꾸는 저위험 변경 — 전체 빌드는 환경 되면 Vercel 프리뷰로 확인 권장)
- 범위 아닌 것:
  - `PLAY_STORE_URL` 값 채우기·Play 스토어 실제 출시(사람 판단 영역), 설치/dismiss 로직·모드 판별 변경
  - 배너 디자인/`InstallPrompt.module.css` 변경(한국어 누수 제거가 최우선)
  - 다른 컴포넌트의 i18n 누수(-01/-02/-03가 담당한 토스트·카테고리 배지) 중복 처리

## [20260725-03] ViewCounter(조회수) "회 조회"/"조회수"가 하드코딩 한국어라 EN/JA에 그대로 새는 문제
- 상태: 대기
- 등록일: 2026-07-25
- 우선순위: P2(확실한 i18n 개선 — SSR HTML에 안 실리는 클라이언트 렌더 값이라 SEO 색인 대상은 아니나, EN/JA 콘서트 상세 페이지마다 노출되는 표시 문자열)
- 근거: 코드 대조로 확정. `components/ViewCounter.tsx`는 `app/(locale)/[lang]/concert/[id]/page.tsx:239`에서 모든 로케일 콘서트 상세에 렌더되는데, 조회수 라벨이 로케일 분기 없이 한국어로 하드코딩돼 EN/JA 상세 페이지에도 한국어가 그대로 뜬다 — -01/-02/-03과 같은 클래스의 미등록 i18n 갭. 이 컴포넌트도 `use client`라 `useLocale()`를 바로 쓸 수 있으나 현재 import하지 않는다. 누수 위치:
  - `ViewCounter.tsx:66` — 시각 라벨 `<span className={styles.label}>회 조회</span>`
  - `ViewCounter.tsx:63` — 컨테이너 `aria-label="조회수"`
  `lib/i18nLabels.ts`에 조회수 표시용 키는 아직 없다(`viewOriginal`/`viewSource`는 "원문 보기"/"출처 보기"로 의미가 다름 — 재사용 금지).
- 스펙:
  - `components/ViewCounter.tsx`의 "회 조회"(:66)와 `aria-label`(:63)을 로케일별로 분기한다. 구현 방향(개발 담당 재량): `useLocale()`로 lang을 얻고, `lib/i18nLabels.ts`에 조회수 라벨 키(예: `views`, `viewsAria`)를 ko/en/ja로 신설해 `CAL[lang]`/`UI[lang]`에서 읽는다. 한국어는 숫자 뒤에 "회 조회"가 붙는 어순인데(`{count} 회 조회`), en/ja는 어순이 달라(예: en `{count} views`, ja `{count} 回閲覧`) **숫자와 라벨의 결합 방식이 로케일마다 다를 수 있음**을 고려해 라벨 문자열에 위치를 녹이거나(예: 접미/접두) 개발 담당이 각 로케일 자연스러운 표기를 정한다.
  - 한국어 값 자체는 폴백으로 유지(lang 미상 시 ko). ko 표기는 기존과 동일.
  - 조회수 집계 로직(`shouldCount`/supabase insert·select)·`ViewCounter.module.css`는 손대지 않는다(표시 문자열만).
- 완료 조건:
  - [ ] EN/JA 콘서트 상세에서 조회수 라벨·aria-label이 각 로케일 언어로 뜬다(한국어 "회 조회"/"조회수" 노출 0건), ko는 기존 표기 유지
  - [ ] 숫자와 라벨 결합이 각 로케일에서 어색하지 않게 표기됨
  - [ ] `grep -n "회 조회\|조회수" components/ViewCounter.tsx` 결과가 폴백/주석 외 표시 경로에 남지 않음
  - [ ] `npm run typecheck` 통과(표시 문자열만 바꾸는 저위험 변경 — 전체 빌드는 환경 되면 Vercel 프리뷰로 확인 권장)
- 범위 아닌 것:
  - 조회수 집계 로직·Supabase `page_views` 스키마 변경
  - `ViewCounter.module.css`/디자인 변경, 다른 컴포넌트 i18n 누수(-01/-02/-03) 중복 처리

## [20260725-04] 홈·인덱스·이미지없는 상세 페이지에서 `og:image`가 통째로 빠지는 소셜 공유 미리보기 누락
- 상태: 대기
- 등록일: 2026-07-25
- 우선순위: P1(공유 미리보기 이미지 누락 — 카카오/라인/페이스북/디스코드/슬랙 링크 카드에 대표 이미지가 안 뜸. K팝 팬덤 특성상 카카오/라인/트위터 공유가 유입의 큰 축이라 공유 CTR에 직접 영향)
- 근거: 라이브 3개 로케일 홈(`https://whenstage.com/ko`·`/en`·`/ja`)의 실제 응답 메타태그를 확인한 결과 **`og:image`가 아예 없고**(`meta-og:title/description/locale/type/url`은 정상), 반면 **`twitter:image`는 `https://whenstage.com/og-image.png`로 정상** 출력된다. 원인은 Next.js App Router의 메타데이터 병합 방식: 자식 세그먼트의 `generateMetadata`가 `openGraph` 객체를 반환하면 부모(루트 레이아웃)의 `openGraph`를 **얕은 병합으로 통째 대체**해(하위 필드 딥머지 아님) 레이아웃이 설정한 `images: ['/og-image.png']`가 사라진다. 반대로 `twitter`는 자식이 재정의하지 않아 레이아웃 값(`images: ['/og-image.png']`)이 그대로 상속돼 유지된다 — 라이브에서 og만 빠지고 twitter는 남는 현상이 이 병합 동작과 정확히 일치(코드 대조로 재확인). 관련 코드:
  - `app/(locale)/[lang]/layout.tsx:25,30` — 레이아웃이 `openGraph.images`·`twitter.images`에 `'/og-image.png'` 설정(사이트 기본 OG 이미지 의도).
  - `app/(locale)/[lang]/page.tsx:38`(홈) — `openGraph`를 재정의하는데 `images`를 안 넣어 홈에서 og:image 소실(가장 많이 공유되는 각 로케일 진입 페이지).
  - 같은 패턴으로 og:image가 빠지는 인덱스/리스트 페이지: `blog/page.tsx:43`, `artist/page.tsx:28`, `news/page.tsx:44`, `venue/page.tsx:26`, `guide/page.tsx:38`.
  - 대표 이미지가 없을 때 `images: undefined`로 떨어져 소실되는 상세 페이지: `artist/[slug]/page.tsx:37`(artist.image 없을 때), `venue/[slug]/page.tsx:31`(항상 없음), `blog/[slug]/page.tsx:45`·`news/[slug]/page.tsx:46`(heroImage 없을 때).
  - 이미 정상인 곳(참고): `concert/[id]/page.tsx:57`은 `images: [{ url: ogImage }]`로 폴백을 넣어 og:image가 나감 — 이 항목의 수정 방향과 동일한 형태.
- 스펙:
  - `openGraph`를 재정의하는 모든 로케일 페이지의 `generateMetadata`에서, 페이지 고유 이미지가 없을 때 **사이트 기본 OG 이미지(`/og-image.png`, `metadataBase`로 절대경로 해석)로 폴백**하도록 `images`를 항상 채운다. 즉 리스트/홈 페이지는 `images: ['/og-image.png']`를 명시하고, 상세 페이지(`artist/[slug]`·`venue/[slug]`·`blog/[slug]`·`news/[slug]`)는 `images: 고유이미지 ? [{ url: 고유이미지 }] : ['/og-image.png']`처럼 `undefined` 대신 기본 이미지로 폴백한다.
  - 반복을 줄이려면 `lib/i18nLabels.ts`(또는 seo 헬퍼)에 `DEFAULT_OG_IMAGE = '/og-image.png'` 상수를 두고 각 페이지가 참조하는 방식을 권장(개발 담당 재량 — 상수화 없이 각 페이지에 리터럴로 넣어도 무방).
  - `twitter`는 이미 정상 상속되므로 굳이 각 페이지에 추가할 필요 없음(단, 상세 페이지가 이미 `twitter.images`를 명시한 경우 og와 동일 폴백으로 맞추면 일관적).
- 완료 조건:
  - [ ] `https://whenstage.com/ko`·`/en`·`/ja` 홈 응답에 `og:image`(= `https://whenstage.com/og-image.png`)가 존재
  - [ ] 인덱스 페이지(news/artist/blog/venue/guide)와 대표 이미지 없는 상세(artist/venue/heroImage 없는 blog·news)에서도 `og:image`가 최소 기본 이미지로 존재
  - [ ] 고유 이미지가 있는 상세(콘서트/heroImage 있는 글/이미지 있는 아티스트)는 기존처럼 그 이미지가 og:image로 유지(회귀 없음)
  - [ ] `npm run typecheck` 통과(전체 빌드는 환경 되면 Vercel 프리뷰로 실제 메타태그 육안 확인 권장 — 라이브 재배포 후 `curl -s <url> | grep og:image`로 재검증)
- 범위 아닌 것:
  - `og-image.png` 이미지 자체의 디자인/교체(별개), 페이지별 동적 OG 이미지 생성(대형 작업, 이번 범위 아님 — 기본 이미지 폴백만)
  - `meta-keywords`가 한국어로 고정된 별개 이슈(검색엔진이 무시하는 태그라 저가치, 계속 스킵)
  - `twitter` 카드 구조 변경(이미 정상 동작)

## [20260725-05] 어디서도 렌더되지 않는 gcalen 잔재 죽은 코드 `Comments.tsx`(+`.module.css`) 제거
- 상태: 대기
- 등록일: 2026-07-25
- 우선순위: P2(죽은 에셋 정리 — 2026-07-23 orphan 청소에서 누락된 gcalen 잔재. `og-image.png`(20260723-01)·`PreRegCountdown.module.css`(20260723-03) 완료 항목과 동일 성격)
- 근거: `components/Comments.tsx`가 **어떤 페이지·컴포넌트에서도 import/렌더되지 않는다**(전 소스 `import ... Comments` 스캔 결과 자기 자신의 `Comments.module.css` 참조 1건 외 0건; `<Comments`·dynamic import도 0건). 또한 이 컴포넌트가 조회/삽입하는 Supabase `comments` 테이블은 스키마 소스인 `supabase/*.sql`에 정의가 없다(현재 `data_reports.sql`·`push_subscriptions.sql`만 존재, `wiki/architecture.md` "외부 서비스 연동 현황"의 실사용 테이블 목록에도 `comments` 없음). `git log` 상 이 파일은 초기 스캐폴드(cea0056, 2026-07-21)·도메인 전환(c49fa5a, 2026-07-21) 이후 한 번도 수정되지 않았고, 2026-07-23 2차 오버홀의 orphan 컴포넌트 7종 청소(`wiki/decisions.md`/`design-audit.md`) 목록에서 빠져 살아남은 잔재다. `wiki/design-audit.md:220`은 이 파일이 아직 gcalen 시절 "이 게임에 대한 댓글" 카피를 그대로 갖고 있다고 이미 지적. 참고로 같은 감사 문서가 함께 거론한 `GameReactions.tsx`는 2026-07-23에 제거됐으나 `Comments`만 남음.
- 스펙:
  - `components/Comments.tsx`와 짝인 `components/Comments.module.css`를 삭제한다(`git rm`). 두 파일 모두 다른 곳에서 참조하지 않음을 삭제 전 재확인.
  - `comments` Supabase 테이블은 스키마 파일이 없어 코드 삭제만으로 충분(별도 SQL 정리 불필요). 실제 DB에 잔존 테이블이 있는지 여부는 사람 확인 영역이라 이 항목에서 건드리지 않는다.
  - 코드 삭제 외 다른 컴포넌트·라우트·스타일은 손대지 않는다(순수 죽은 코드 제거).
- 완료 조건:
  - [ ] `components/Comments.tsx`·`components/Comments.module.css`가 저장소에서 제거됨
  - [ ] `grep -rn "Comments" app/ components/ lib/ hooks/` 결과에 제거된 컴포넌트를 import/렌더하는 참조가 없음(privacy 페이지 본문의 영어 단어 "Comments"는 무관 — 정책 문구)
  - [ ] `npm run typecheck` 통과(로직·라우팅·타입 무영향 죽은 코드 삭제라 저위험 5-A, 전체 빌드 생략 가능 — 20260723-01/-03 선례)
- 범위 아닌 것:
  - `data/`·`content/` 콘텐츠, `supabase/*.sql` 스키마 변경
  - `Game`/`GameRow`/`GameModal` 등 `Game` 인터페이스 계열 대규모 리네임(`wiki/decisions.md`가 우선순위 낮음으로 명시)
  - 실제 Supabase DB의 `comments` 테이블 삭제(사람 판단 영역)
