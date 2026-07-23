# 디자인 감사 (2026-07-23)

## 배경과 범위
2026-07-22~23에 "완전 갈아엎는 마인드로" 진행한 1차 비주얼 오버홀(Motion 도입, 토큰 확장,
홈 히어로 신설, WCAG AA 대비 수정 등, `PROJECT_STATUS.md` 참고) 이후, 오너가 **다음 단계로
더 본격적인 전체 리디자인**을 계획하면서 "지금 상태를 분석해서 남겨두라"고 요청해 작성한
문서다. 코드를 고치지 않고, `components/*.tsx`(+`.module.css`), `app/globals.css`,
`app/[lang]/**/*.tsx` 전 라우트, `app/layout.tsx`, `app/template.tsx`,
`app/[lang]/template.tsx`, `app/loading.tsx`, `app/error.tsx`, `app/not-found.tsx`를
실제로 전부 읽고 관찰한 사실만 기록했다. 실행(dev 서버·스크린샷)은 하지 않았다 — 코드
레벨 관찰이므로 실제 렌더링 결과와는 미세하게 다를 수 있다.

---

## 1. 디자인 시스템 인벤토리

토큰은 전부 `app/globals.css`의 `:root`(라이트, 기본)와 `[data-theme="dark"]`(다크,
토글 시)에 정의돼 있다. 컬러 스킴은 라이트가 기본값이라는 점이 특이한데(`color-scheme:
light`), 컴포넌트 코드 곳곳(`ThemeToggle.tsx`)엔 여전히 `useState<Theme>('dark')`처럼
"다크가 기본"이라는 전제가 남은 자리도 있다(마운트 후 실제 `data-theme` 속성을 다시
읽어 보정하므로 기능적 버그는 아니지만, 라이트 우선 전환이 코드 전반에 완전히
스며들지는 않았다는 신호).

### 색상
| 토큰 | 라이트 | 다크 | 비고 |
|---|---|---|---|
| `--bg` | `#f6f7f9` | `#0f1115` | |
| `--bg-elev` | `#ffffff` | `#1a1d24` | 카드/헤더 표면 |
| `--border` | `#e4e7ec` | `#2a2e38` | |
| `--text` / `--text-faint` | `#1a1d24` / `#6b7280` | `#e6e6e6` / `#888` | |
| `--accent` / `--accent-2` | `#ff3d78`(핑크) / `#7c3aed`(보라) | `#ff5c8f` / `#a78bfa` | |
| `--accent-grad` / `--accent-grad-135` | 핑크→보라 그라데이션(각도만 다름) | 동일 | |
| `--accent-grad-text` | 25% 어둡게 낮춘 그라데이션 | 동일 원리 | 흰 텍스트 위 WCAG AA 확보용(2026-07-23 추가) |
| `--accent-warm` | `#ff8a00` | `#ffa733` | 임박/경고/CTA 보조색 |
| `--danger` | `#e74c3c` | (다크 값 없음, 라이트 값 상속) | |

카테고리 4색은 `lib/types.ts`의 `CATEGORY_META`가 단일 출처이고, `globals.css`의
`.cat-*`/`.cat-bg-*`(490~525행)가 **같은 값을 손으로 복제**해 CSS 쪽에서도 갖고 있다
(콘서트 `#2f6fed` / 음원발매 `#06b6d4` / 페스티벌 `#16a34a` / 팬미팅 `#f59e0b`). 두 곳이
지금은 값이 일치하지만, 하나만 고치면 어긋나는 구조라는 점은 유의할 만하다.

### 타이포그래피
`--font-sans`(Pretendard Variable, 자체 호스팅) / `--font-display`(Space Grotesk,
라틴 전용, 워드마크·D-day 숫자 전용)와 `--fs-hero`~`--fs-xs` 7단계 스케일이 정의돼
있다(globals.css 75~85행). 스케일 자체는 페이지 제목류(`--fs-title`)와 섹션 제목
(`--fs-h2`/`--fs-h3`)에 비교적 잘 쓰이지만, **카드형 컴포넌트 다수는 스케일을 참조하지
않고 컴포넌트마다 개별 `rem` 값을 직접 적는다**(예: `GameRow.module.css`의
`.title { font-size: 0.96rem }`, `ScheduleCard.module.css`의 `.title { font-size:
0.95rem }`, `ArtistCard.module.css`의 `.name { font-size: 0.92rem }` — 세 곳 모두
"카드 제목"이라는 같은 역할인데 값이 0.92/0.95/0.96rem로 제각각 미세하게 다르다).

### 스페이싱
**공식 스페이싱 토큰이 없다.** radius/shadow/타이포는 스케일이 있지만 margin·padding·
gap은 모든 컴포넌트가 각자 `0.4rem`/`0.6rem`/`0.85rem`/`1.2rem` 같은 값을 직접 적는다.
같은 의도(카드 내부 패딩, 리스트 아이템 gap 등)라도 파일마다 근사치가 조금씩 다르다.

### 라운드 / 쉐도우
`--radius-sm`(8px) / `--radius`(12px) / `--radius-lg`(20px) / `--radius-xl`(28px) 4단계,
`--shadow-sm`/`--shadow-md`/`--shadow-lg`/`--shadow-glow` 4단계가 있고 이 두 스케일은
비교적 일관되게 쓰인다.

### 브레이크포인트
공유 토큰이나 믹스인 없이 컴포넌트마다 `@media` px 값을 직접 쓴다. 실제 쓰인 값만 모아도
`480 / 560 / 600 / 640 / 760 / 900 / 1100 / 1400 / 1440 / 1649 / 1799`로 11종이며,
같은 의도(태블릿 전환, 모바일 전환)에도 파일별로 760 vs 900 vs 640처럼 기준이 다르다.

### 토큰 이탈 — 정의되지 않은 CSS 변수를 참조하는 곳
`:root`/`[data-theme="dark"]`에 없는데 컴포넌트가 참조하는 변수들(대부분 gcalen 시절
또는 리디자인 이전 토큰 이름이 남은 것으로 보임):
- `--bg-sunken`: `components/ArtistCard.module.css:24,42`, `components/ArtistAvatar.module.css:8,22` — fallback 없이 사용, 실제로는 무효 선언이 되어 배경이 비어 보일 수 있음
- `--muted`: `app/globals.css:696,702`(`.detail-coupons-intro`, `.detail-coupons-expired-title`), `app/news/news.module.css:39`(`.sourceNote`) — fallback 없음
- `--fg`: `app/news/news.module.css:25,29`(`.sourceBox`, `.sourceBox strong`) — 25행은 `color-mix()` 안에서 fallback 없이 쓰여 배경 선언 전체가 무효화됨
- `--text-soft`: `app/globals.css:737`(`.faq-item dd`) — `var(--text-soft, var(--text))`로 fallback이 있어 실질적 문제는 없음
- `--surface-2`: `app/news/news.module.css:25` — fallback 문자열 안에 있지만 그 fallback도 `--fg`에 의존해 함께 무효화됨

### 하드코딩 색상(토큰 이탈)
- `components/ScheduleCard.module.css:93`의 `.cta` 배경 `rgba(255, 61, 120, 0.12)`,
  `components/NotifyToggle.module.css:19`의 `.icon` 배경 `rgba(255, 61, 120, 0.12)`,
  `components/Home.module.css:121`의 `.topSearch:focus-visible` `rgba(255, 61, 120, 0.12)`
  — 모두 `--accent`(`#ff3d78`)를 손으로 다시 적은 값. 지금은 accent 값과 일치하지만
  accent를 바꾸면 이 세 곳은 자동으로 안 따라간다.
- `components/Comments.module.css:53`의 포커스 글로우 `rgba(16, 185, 129, 0.12)`,
  `components/CalendarSubscribe.module.css:19`의 아이콘 배경 `rgba(4, 120, 87, 0.12)`
  — 둘 다 초록 계열로, 현재 팔레트(핑크/보라) 어디에도 없는 색이라 gcalen 시절 그린
  브랜드 색이 그대로 남은 것으로 보인다.
- `components/ViewCounter.module.css:5-6`의 `.counter` 배경/보더가 `rgba(255,255,255,0.04)`
  / `rgba(255,255,255,0.08)` — 다크 표면 위에 얹힐 걸 가정한 값이라, 지금 기본 테마인
  라이트(흰 배경)에서는 흰 위에 흰 반투명이라 거의 안 보이는 대비로 렌더될 가능성이 있다.
- 반면 `app/news/news.module.css:11-12`는 `color-mix(in srgb, var(--accent) 10%,
  transparent)`처럼 토큰을 그대로 활용하는 최신 패턴을 쓴다 — 같은 "accent 톤 배경" 의도를
  구현하는 방식이 파일마다 하드코딩 rgba / `color-mix()` 두 갈래로 나뉘어 있다.

---

## 2. 페이지별 구조 인벤토리

| 라우트 | 레이아웃 셸 | 사이드바 | 핵심 조합 |
|---|---|---|---|
| `/[lang]` (홈) | `Home.tsx` 자체 레이아웃(`PageShell` 미사용) | 없음(2026-07 리디자인 중 임시 제거, `Home.module.css`에 `.rightCol` 주석 처리 흔적) | 그라데이션 히어로 + 검색/위시토글 + `CalendarView`/`ListView` + `GameModal` |
| `/[lang]/concert/[id]` | `PageShell` | 있음(같은 아티스트/공연장의 다른 일정 → `SidebarSection`+`RelatedEventCard`, 없으면 `FeaturedCards` 폴백) | `.game-detail`(전역 클래스) 기반 정적 마크업, `DetailCover`/`DdayBadge`/`TicketingPhase`/`WishlistButton`/`ShareButton`/`ViewCounter` |
| `/[lang]/artist`, `/artist/[slug]` | `PageShell` | 목록은 없음, 상세는 "인기 아티스트" `RelatedArtistCard` | 목록: `ArtistCard` 그리드(+`RevealGroup`/`RevealItem` 스크롤 리빌 — 이 페이지만 적용됨) / 상세: `blog.module.css` 재사용 + `artist.module.css` + `ArtistAvatar` + `EventList`(+`GameModal`) |
| `/[lang]/venue`, `/venue/[slug]` | `PageShell` | 없음 | `blog.module.css`의 `.postList`/`.post` 재사용(아티스트 상세와 거의 동일 패턴) + `EventList` |
| `/[lang]/news`, `/news/[slug]` | `PageShell` | 상세만 있음("관련 뉴스" `RelatedArticleCard`) | `blog.module.css` + `news.module.css`(출처 배지/박스 추가) + `BlogImg`/`BlogHero` |
| `/[lang]/blog`, `/blog/[slug]` | `PageShell` | 상세만 있음("관련 아티클") | `blog.module.css` 원 소유 페이지 + `BlogImg`/`BlogHero` |
| `/[lang]/guide`, `/guide/glossary` | `PageShell` | 기본(`FeaturedCards`) | 전역 `.legal` 클래스, FAQPage/용어사전을 `<dl>`로 인라인 style 사용(글로벌 CSS 없이 `style={{...}}` 직접 지정) |
| `/[lang]/about`, `/contact`, `/privacy`, `/terms` | `PageShell` | 기본(`FeaturedCards`) | 전역 `.legal` 클래스, 로케일별 `KoBody`/`EnBody`/`JaBody` 함수 3분기 |
| `/[lang]/wishlist` | `PageShell` | 기본(`FeaturedCards`) | `WishlistView` + `NotifyToggle` |
| `/admin` | 셸 없음(자체 페이지) | — | `AdminDashboard` — 디자인 시스템과 무관한 별도 톤(순수 데이터 대시보드) |
| `app/error.tsx`, `app/not-found.tsx` | 없음 | — | 인라인 `style={{}}`만 사용, 디자인 토큰을 부분적으로만 참조(`var(--accent)`, `var(--text-faint)`), Motion·카드·브랜드 요소 전혀 없음 |

**관찰**: `PageShell`을 쓰는 대부분의 서브페이지는 우측 320px 사이드바 2컬럼 구조(태블릿
이하 숨김)를 공유하지만, 홈(`Home.tsx`)만 별도 레이아웃을 직접 구현하며 현재는 사이드바가
없는 1컬럼이다(`Home.module.css:69-75` 주석: "사이드바 재작업 전 임시 1컬럼"). 즉 지금
"홈 레이아웃 폭"과 "서브페이지 레이아웃 폭"이 구조적으로 다르다 — 리디자인 시 둘을 다시
맞출지, 홈은 계속 다른 레이아웃으로 갈지가 열려 있는 지점.

또한 아티스트/공연장/뉴스/블로그 4개 콘텐츠 허브가 `app/blog/blog.module.css` 하나를
공유한다(`import styles from '@/app/blog/blog.module.css'`가 `artist/page.tsx`,
`artist/[slug]/page.tsx`, `venue/page.tsx`, `venue/[slug]/page.tsx`, `news/page.tsx`,
`news/[slug]/page.tsx`에 전부 등장). 재사용 자체는 일관성 있는 선택이지만, "블로그" 전용
파일명 아래 4개 도메인의 리스트/상세 스타일이 얹혀 있어 리디자인 때 이 파일을 건드리면
영향 범위가 4개 라우트 전체로 퍼진다는 점은 인지할 만하다.

---

## 3. 컴포넌트 인벤토리 (역할별 그룹)

**레이아웃/내비게이션**: `PageShell`, `HeaderNav`, `HeaderScroll`, `SiteWordmark`,
`SiteFooter`, `BottomTabBar`, `LanguageSwitcher`, `ThemeToggle`

**캘린더/리스트 코어**: `Home`, `CalendarView`, `ListView`, `GameRow`, `EventRow`,
`EventList`, `GameModal`, `CategoryFilterBar`, `ScheduleCard`, `TicketingPhase`

**카드류 (사이드바/추천/그리드) — 패턴이 갈라진 지점**: `ArtistCard`, `FeaturedCards`
(`FeaturedCard` 내부 컴포넌트), `RelatedArticleCard`, `RelatedArtistCard`,
`RelatedEventCard`. 이 5종은 전부 "이미지/색 배지 + 이름 + 부가정보" 카드라는 같은
목적이지만 스타일 계열이 두 갈래로 나뉜다.
- **A 계열**(`ArtistCard`, `FeaturedCards`): 기본 보더는 `var(--border)`(중립), hover 시에만
  `var(--accent)`로 강조 + `box-shadow: var(--shadow-glow)`. 이미지 블러 배경(`thumbBg`)+
  원본 겹침(`thumbFg`) 패턴을 씀.
- **B 계열**(`RelatedArticleCard`, `RelatedArtistCard`, `RelatedEventCard`): 기본 보더가
  **항상** `var(--accent)`(1px solid) — hover 전에도 강조색 테두리가 상시 노출되고, hover
  시엔 `var(--accent-2)`로 바뀐다. 세 컴포넌트 모두 사이드바(`SidebarSection`) 안에서만
  쓰인다는 공통점은 있지만, "사이드바 카드는 상시 accent 보더"라는 규칙이 별도로 명문화된
  곳은 없고 컴포넌트 3개가 각자 반복 구현한 형태다.

**상세 페이지 전용**: `DetailCover`, `DdayBadge`, `TicketingPhase`(CSS 모듈 파일명은
`PreRegCountdown.module.css`로 옛 컴포넌트명이 남아 있음), `ArtistAvatar`,
`SidebarSection`

**인터랙션(위시리스트·댓글·리액션·알림·공유)**: `WishlistButton`, `WishlistView`,
`Comments`, `GameReactions`, `NotifyToggle`, `ViewCounter`, `ShareButton`, `Toaster`,
`PushSync`

**PWA/설치/광고/관리자**: `InstallPrompt`, `AdFit`, `SideRailAds`, `AdminDashboard`

**모션 유틸**: `components/motion/MotionProvider.tsx`, `components/motion/Reveal.tsx`
(`RevealGroup`/`RevealItem`)

**유틸 이미지 래퍼**: `BlogImg`, `BlogHero`(둘 다 "onError 시 컨테이너째 숨김" 같은 로직을
각자 구현 — 겹치는 부분이 있다)

### 고아(orphan) 컴포넌트 — 실제로는 어디서도 import되지 않음
`FloatingMonthStats`, `PopularGames`, `NextByCategory`, `PromoBanner`,
`CalendarSubscribe`, `AdFit`(레일 광고 목적), `SideRailAds` 7개는 `layout.tsx`,
`Home.tsx`, `PageShell.tsx` 세 곳 모두에서 "재작업 예정, 임시 주석"으로 import가
주석 처리돼 있고 실제로 렌더되는 경로가 없다(코드베이스 전체 grep으로 활성 import
0건 확인). 컴포넌트+CSS 모듈 합쳐 상당한 분량이 "당장은 안 쓰지만 재사용을 염두에
둔" 상태로 남아 있다. 그중 `FloatingMonthStats.tsx:72,78`은 `/game/${g.id}`와
`/pre-registration`이라는, 지금 라우트 구조(`/concert/[id]`)에 없는 죽은 링크를
하드코딩하고 있어 — 다시 켜려면 그대로는 못 쓰고 최소한 링크 경로부터 고쳐야 한다.

---

## 4. 강점

- **다크모드**: `[data-theme]` 속성 기반 토큰 스위칭이 전 컴포넌트에 일관 적용되고,
  `layout.tsx:55-59`의 인라인 스크립트가 하이드레이션 전에 `localStorage` 값을 읽어
  FOUC(테마 깜빡임)를 막는다.
- **접근성 포커스링**: `globals.css:44-52`에서 `a/button/input/select/textarea/[role=tab]`에
  전역 `:focus-visible` 아웃라인을 일괄 적용. 개별 컴포넌트도 `aria-current`,
  `aria-pressed`, `aria-expanded`, `aria-label`, `role="dialog"`/`aria-modal`
  (`GameModal.tsx:66-67`), `aria-live="polite"`(`Toaster.tsx:8`) 등을 폭넓게 사용한다.
- **WCAG 대비 보정 이력**: `--accent-grad-text`처럼 "그라데이션 위 흰 텍스트가 AA
  미달"이라는 실제 감사 결과에 따라 별도 토큰을 새로 만든 흔적이 있다
  (`PROJECT_STATUS.md` 2026-07-23 항목).
- **모션 접근성**: 전역 `MotionConfig(reducedMotion="user")`(`MotionProvider.tsx`) +
  `useReducedMotion()` 명시적 분기(`Reveal.tsx`) + CSS `@media (prefers-reduced-motion:
  reduce)` 분기가 `globals.css`와 `CalendarView.module.css`, `ArtistCard.module.css`,
  `InstallPrompt.module.css`, `LanguageSwitcher.module.css` 등 다수 CSS 모듈에 중복
  구현돼 있어 애니메이션 축소 요청을 이중, 삼중으로 존중한다.
- **이미지 실패 대응 패턴의 통일성**: `GameRow`, `EventRow`, `ScheduleCard`,
  `ArtistCard`, `RelatedArtistCard`, `RelatedEventCard`, `FeaturedCards`, `BlogImg`,
  `BlogHero`, `DetailCover`가 전부 "블러 배경 + `onError`/마운트 후 `naturalWidth===0`
  확인 → 실패 시 플레이스홀더"라는 같은 패턴을 반복 구현한다. 코드 중복은 있지만
  시각적으로는 어느 이미지가 깨져도 사용자에게 일관된 결과를 보여준다.
- **SSR/하이드레이션 안전장치**: D-day, 카운트다운, 테마 등 날짜·클라이언트 상태
  의존 값을 "마운트 전 고정값 → 마운트 후 실제값" 2단계로 렌더하는 패턴이 `DdayBadge`,
  `ThemeToggle`, `FeaturedCards`, `TicketingPhase` 등에 일관되게 적용돼 하이드레이션
  불일치를 피한다.

---

## 5. 약점 / 기술부채

### gcalen(게임 캘린더) 잔재 네이밍
- `app/globals.css:918-920`의 `.ic-gamepad` 클래스, `app/layout.tsx:66`의 컨트롤러
  모양 SVG 스프라이트 `<symbol id="ic-gamepad">` — `SiteWordmark.tsx:22`가 실제로는
  `#ic-star` 아이콘을 쓰면서 색상만 `.ic-gamepad` 클래스로 입힌다. 아이콘 자체(게임패드
  모양 심볼)는 사이트 어디서도 실제로 그려지지 않는 죽은 심볼이다.
- `app/globals.css:741-742,755-757`의 `.gcal-link` — "구글 캘린더 링크"류 이름으로
  보이는데 실제 JSX에서는 전혀 쓰이지 않는다(현재는 `.detail-link`만 사용). 전 저장소
  grep 기준 유일한 등장 위치가 이 CSS 정의 자체.
- `lib/types.ts:71-77`의 `EventType`(`game_show`/`sale`/`season`) · `EVENT_TYPE_META`,
  `lib/i18nLabels.ts:11-16`의 `EVENT_TYPE_LABELS`(한국어 라벨이 문자 그대로 `'게임쇼'`) —
  콘서트 도메인에 없는 "게임쇼/할인/새 시즌" 이벤트 타입이 타입 정의·라벨·
  `EventRow.tsx`·`CalendarView.tsx`·`Home.tsx`의 필터링 로직까지 전부 살아있다. 실제로는
  `events.json`이 삭제돼 데이터가 항상 빈 배열이라 화면엔 안 보이지만(`decisions.md`가
  이 기능 자체를 명시적으로 제거 대상이라 기록), 타입/문자열/분기 로직은 그대로 남아 있다.
- `components/Comments.tsx:101`("이 게임에 대한 댓글"), `components/GameReactions.tsx:54`
  ("이 게임 기대되나요?"), `components/PromoBanner.tsx:15`("게임 상세에서 출시일을..."),
  `components/CalendarSubscribe.tsx:32`("새 게임이 추가될 때마다") — 컴포넌트 기본 문구에
  "게임"이 그대로 남아 있다(`Comments`는 상세 페이지에서 `placeholder` prop으로 덮어쓸 수
  있게 설계돼 있지만, 기본값 자체가 게임 도메인 문구다).
- `app/[lang]/contact/page.tsx:95`(일본어) "新作ゲーム・サーバー・イベント情報の提供" —
  "신규 게임/서버 정보 제보"라는 문구가 일본어 본문에 그대로 남아 있다. 한국어/영어
  버전은 이미 콘서트 도메인 문구로 바뀌어 있어 일본어만 놓친 것으로 보인다.
- `app/[lang]/privacy/page.tsx:157`(일본어) "ゲーム/ニュースへのコメント投稿時" —
  마찬가지로 일본어 개인정보처리방침에 "게임/뉴스 댓글" 문구가 남아 있다(한국어 버전
  45행은 이미 "일정/뉴스 댓글"로 수정돼 있음). `architecture.md`는 이 문구 정리를 "완료"로
  기록하고 있으나 실제로는 일본어 법적 문서 2곳에 누락이 있다.
- `components/FloatingMonthStats.tsx` 주석·문자열에도 "게임"이 여러 번 등장(사용은 안
  되는 고아 컴포넌트이긴 하다).

### 죽은 CSS (orphaned styles)
- `app/globals.css:785-887` 구간의 `.seo-landing`/`.seo-intro`/`.events-page`/
  `.events-intro`/`.events-group`/`.seo-list`/`.seo-nav` 등 — `decisions.md`가 명시한
  제거 대상(SEO 카테고리 랜딩, `/events` 페이지)의 CSS가 100줄 넘게 그대로 남아 있고,
  현재 어떤 `.tsx`에서도 참조되지 않는다.
- `app/globals.css:685-716`의 `.detail-coupons*`(쿠폰 관련 이름) — `decisions.md`가
  "쿠폰 패턴은 절대 되살리지 않는다"고 명시적으로 못박은 기능인데, 그 이름을 그대로 쓴
  CSS 클래스가 orphan 상태로 남아 있다. 실사용처 없음.
- `app/globals.css:717-739`의 `.detail-faq`/`.faq-list`/`.faq-item` — 주석은 "FAQPage
  구조화 데이터와 1:1 대응"이라 적혀 있지만, 현재 `/concert/[id]` 페이지에는 FAQ UI
  섹션이 실제로 렌더되지 않는다(구조화 데이터 자체도 이 페이지엔 없음 — FAQPage
  JSON-LD는 `/guide` 페이지에만 있다). 주석과 실제 코드가 어긋난 상태.
- `app/[lang]/concert/[id]/page.tsx:157`에서 쓰는 `.detail-festival-days` 클래스는
  `globals.css` 어디에도 스타일 정의가 없다 — 페스티벌 카테고리 상세 페이지의 라인업
  목록이 브라우저 기본 `<ul>/<li>` 스타일 그대로 노출될 가능성이 있는 실질적 스타일
  누락이다.
- `app/globals.css:22-30`의 `.sr-only`가 정의는 돼 있지만 `app/`, `components/` 어디에도
  실제 사용처가 없다(주석은 "시각적 히어로가 없는 페이지의 h1 대체용"이라 하는데, 홈은
  이미 `Home.tsx:168`에서 시각적 `<h1>`을 직접 쓰고 있어 애초 의도한 용례가 사라진
  상태로 보인다).

### 컴포넌트/스타일 불일치
- 위 3절에서 다룬 "카드류 A/B 계열" 보더 규칙 이원화.
- 카드 제목 폰트 크기가 `GameRow`(0.96rem) / `ScheduleCard`(0.95rem) / `ArtistCard`
  (0.92rem)로 같은 역할인데 파일마다 조금씩 다름(타이포 스케일 토큰 미참조).
- `TicketingPhase.tsx`가 `PreRegCountdown.module.css`를 import — 컴포넌트가
  `PreRegCountdown`에서 `TicketingPhase`로 이름이 바뀐 뒤 CSS 모듈 파일명은 리네임되지
  않고 남은 것으로 보인다.
- `BlogImg`와 `BlogHero`가 "이미지 로드 실패 시 onError + 마운트 시 재확인" 로직을 각자
  독립적으로 구현(공유 훅으로 추출돼 있지 않음). 사실 이 패턴은 `GameRow`, `ScheduleCard`,
  `ArtistCard` 등 이미지 있는 카드 컴포넌트 대다수가 거의 동일하게 반복한다(강점 절의
  "일관성"과 동전의 양면 — 결과는 일관되지만 구현은 중복).
- 홈(`Home.tsx`)만 사이드바가 없는 1컬럼이고 나머지 `PageShell` 기반 페이지는 전부
  우측 사이드바가 있는 2컬럼(2절 참고).

### 반응형으로 보이는 지점
- 브레이크포인트가 컴포넌트마다 다른 px 값(2절 "브레이크포인트")이라, 리디자인 시
  화면 폭 경계에서 레이아웃 전환 타이밍이 컴포넌트별로 미묘하게 어긋날 수 있다.
- `app/globals.css:805-816`의 `.side-rail`(좌우 고정 광고 레일)은 `SideRailAds.tsx`가
  고아 컴포넌트라 실제로는 아무 화면에도 안 뜨지만, CSS는 `max-width: 1649px`에서
  숨기는 미디어쿼리까지 포함해 그대로 남아 있다.

### 접근성 미비로 보이는 지점
- `app/error.tsx`, `app/not-found.tsx`는 인라인 `style`만 쓰고 포커스 이동·랜드마크
  구조 없이 `<h2>`로 시작한다(페이지 최상위 헤딩이 `<h1>`이 아님 — 나머지 페이지들의
  "페이지당 h1 1개" 원칙과 어긋난다).
- `components/GameRow.tsx`/`ScheduleCard.tsx` 등에서 카테고리 배지(`.badge`)가 색상만으로
  카테고리를 구분하는 부분이 있는데, 텍스트 라벨(`cat.short`)이 항상 같이 나오긴 하므로
  색맹 사용자에게 완전히 정보가 막히지는 않는다 — 다만 캘린더 셀의 점(`CalendarView.module.css`
  `.cellDot`)은 텍스트 라벨 없이 `title` 속성(호버 툴팁)에만 의존해, 툴팁을 못 쓰는
  스크린리더/터치 사용자는 색으로만 카테고리를 구분해야 한다.

---

## 6. 모션/인터랙션 현황

`motion`(Framer Motion 후신, package.json 기준 `^12.42.2`) 사용처:
- **전역**: `MotionProvider`(`app/layout.tsx`에서 `<main>`을 감쌈)가 `reducedMotion="user"`로
  전체 모션의 OS 설정 연동을 담당. `app/[lang]/template.tsx`가 라우트 전환마다 페이드+
  슬라이드업.
- **캘린더**: `CalendarView.tsx` — 날짜 선택 표시가 `layoutId="cal-selected-day"` 공유
  레이아웃 애니메이션, 오늘의 일정 패널이 `AnimatePresence`로 날짜 변경 시 페이드 전환.
- **필터**: `CategoryFilterBar.tsx` — 활성 필 배경이 `layoutId="cat-active-pill"`로 버튼
  간 이동.
- **카드/행 호버·프레스**: `GameRow`, `ArtistCard`, `ScheduleCard`가 `whileHover`/
  `whileTap`으로 y 이동·스케일 피드백.
- **모달**: `GameModal.tsx` — 오버레이 페이드 + 모달 스프링 스케일/이동 진입, ESC/바깥
  클릭 닫기, `AnimatePresence`로 퇴장 애니메이션(`Home.tsx`, `EventList.tsx`에서 사용).
- **스크롤 리빌**: `components/motion/Reveal.tsx`(`RevealGroup`/`RevealItem`)가
  스태거 등장 애니메이션을 제공하지만, 실제 사용처는 **`/[lang]/artist` 목록 페이지 단
  1곳**뿐이다. 구조가 거의 동일한 `/venue`, `/news`, `/blog` 목록 페이지는 이 컴포넌트를
  쓰지 않고 정적 `<ul>`로만 렌더한다.
- **CSS 레벨 모션**(Motion 라이브러리 미사용, 순수 CSS `@keyframes`/`transition`):
  토스트(`toastIn`), 라우트 페이드(`routeFade`, `app/template.tsx`), 이미지 페이드인
  (`imgFade`), 캘린더 월 전환 슬라이드(`calSlideNext`/`calSlidePrev`), 스켈레톤 시머
  (`sk-shimmer`), 설치 배너(`installUp`), 언어 스위처 드롭다운(`menuIn`).
- **`prefers-reduced-motion` 대응**: Motion 쪽은 `MotionConfig`/`useReducedMotion` 전역
  처리로 커버되고, CSS `@keyframes` 쪽은 각 스타일시트가 개별적으로
  `@media (prefers-reduced-motion: reduce) { animation: none }`을 반복 선언한다
  (`globals.css`, `CalendarView.module.css`, `ArtistCard.module.css`,
  `FeaturedCards.module.css`, `GameModal.module.css`, `InstallPrompt.module.css`,
  `LanguageSwitcher.module.css`, `TicketingPhase.tsx`가 쓰는 `PreRegCountdown.module.css`
  등). 빠짐없이 잘 커버돼 있지만, 축소 요청 처리 로직이 "전역 1곳"과 "파일마다 반복"
  두 방식으로 나뉘어 있다.
- **모션이 아예 없는 인터랙션 컴포넌트**: `Comments`, `GameReactions`, `NotifyToggle`,
  `WishlistView`, `ViewCounter`, `ShareButton`은 순수 CSS `transition`(색상·보더 등)만
  쓰고 Motion 라이브러리를 쓰지 않는다. 캘린더·카드 등 "발견/탐색" 동선에는 모션이
  집중돼 있고, 위시리스트·댓글 등 "행동/폼" 계열 컴포넌트는 상대적으로 손이 덜 갔다.

---

## 7. 다음 리디자인이 고려할 만한 지점 (관찰 기반 후보 — 방향 강요 아님)

아래는 위 관찰에서 자연스럽게 따라 나오는 "생각해볼 거리"이며, 어느 쪽으로 갈지는
오너의 판단 영역이다.

- **토큰 체계를 더 촘촘히 할지**: 색/라운드/쉐도우/타이포는 스케일이 있지만 스페이싱과
  브레이크포인트는 없다. 두 스케일을 새로 만들지, 지금처럼 컴포넌트별 자유값을 유지할지.
- **미정의 CSS 변수(`--bg-sunken`, `--muted`, `--fg`, `--surface-2`) 정리**: 토큰 이름을
  통일하거나(예: 전부 `--text-faint`/`--bg-elev` 등 기존 토큰으로 교체), 혹은 실제로
  "가라앉은 배경"/"약한 텍스트" 같은 새 토큰이 필요하다면 `:root`에 정식으로 추가할지.
- **카드 컴포넌트 통합 여부**: `ArtistCard`/`FeaturedCards` 계열과 `RelatedArticleCard`/
  `RelatedArtistCard`/`RelatedEventCard` 계열을 하나의 공용 카드 프리미티브(크기·보더
  규칙을 prop으로 분기)로 합칠지, 지금처럼 사이드바 전용/그리드 전용으로 나눠 둘지.
- **레거시 네이밍 정리 범위**: `.ic-gamepad`, `.gcal-link`, `.detail-coupons*`,
  `.detail-faq`, `.seo-landing`/`.events-*`, `EventType`(game_show 등) 같은 죽은
  코드·이름을 이번 리디자인에서 함께 걷어낼지, 아니면 시각 작업만 먼저 하고 코드 정리는
  별도 작업으로 미룰지.
- **홈과 서브페이지 레이아웃 정합성**: 지금 임시로 1컬럼인 홈을 다시 2컬럼(사이드바 포함)
  으로 되돌릴지, 아니면 아예 홈은 서브페이지와 다른 레이아웃이라는 것을 정식 패턴으로
  삼을지.
- **고아 컴포넌트 7종의 거취**: `FloatingMonthStats`/`PopularGames`/`NextByCategory`/
  `PromoBanner`/`CalendarSubscribe`/`AdFit`/`SideRailAds`를 리디자인된 사이드바에 맞게
  다시 살릴지, 완전히 삭제할지, 지금처럼 "재사용 가능" 상태로 계속 둘지.
- **모션 적용 범위 확장 여부**: 지금은 캘린더·카드·모달 등 탐색 동선에 모션이 집중돼
  있다. 댓글·위시리스트 등 폼/액션 계열까지 넓힐지, 아니면 지금처럼 "가벼운 상호작용은
  CSS transition만"이라는 암묵적 구분을 유지할지.
- **`/venue`, `/news`, `/blog` 목록에 스크롤 리빌 확장 여부**: `RevealGroup`/
  `RevealItem`이 지금 `/artist` 목록에만 쓰이는데, 나머지 목록 페이지에도 넓힐지 여부.
- **`app/error.tsx`/`app/not-found.tsx`를 디자인 시스템에 편입할지**: 지금은 인라인
  style로만 최소 구현돼 있어, 나머지 페이지와 톤이 다르다. 브랜드 요소(그라데이션,
  워드마크, Motion)를 넣어 일관성을 맞출지, 지금처럼 최소 구현으로 남겨둘지.
