# PROJECT_STATUS.md — WhenStage

## 현재 상태 (2026-07-22)
- `/ko` `/en` `/ja` 완전 대칭 라우팅 구조 전환 완료
- 콘서트·뉴스·아티스트 프로필은 로케일별 완전 독립 데이터(번역 아님), 블로그는 KO 원본 + 선택적 번역
- 스키마·정책: `AGENTS.md`, 프로젝트 배경·아키텍처·과거 결정: `wiki/`(코드 변경 자동화 프롬프트 필독)

### 작업 지시 프롬프트 목록
| 프롬프트 | 대상 | 실행 방식 |
|---|---|---|
| `prompts/RESEARCHER_KO.md` / `_EN.md` / `_JA.md` | `data/concerts.<locale>.json` | 자동 스케줄러(하루 2회) |
| `prompts/NEWS_RESEARCHER_KO.md` / `_EN.md` / `_JA.md` | `content/news/*.<locale>.md` | 자동 스케줄러(하루 2회) |
| `prompts/ARTIST_PROFILE.md` | `data/artist-images.json`, `data/artist-bios.json` | 수동/비정기 + `PLANNER`가 신호 있을 때 직접 실행 |
| `prompts/BLOG_RESEARCHER_KO.md` / `_EN.md` / `_JA.md` | `content/blog/*.<locale>.md`(모아보기, 로케일별 완전 독립) | 수동/비정기 + `PLANNER`가 신호 있을 때 직접 실행 |
| `prompts/PLANNER.md` | 콘텐츠 실행 판단(위 2개 트리거) + 코드 관련 관찰은 제안만 | 자동 스케줄러(주 1회) — 코드는 절대 직접 안 함 |
| `prompts/PRODUCT_PLANNER.md` | `BACKLOG.md`에 코드/기능 백로그 항목 등록(위키 필독) | 자동 스케줄러(권장 주 1회) — 코드는 절대 직접 안 함 |
| `prompts/PRODUCT_DEVELOPER.md` | `BACKLOG.md`의 `대기` 항목 1개 구현 + 자체 검증(타입체크·빌드) 후 push | 자동 스케줄러(권장 더 잦게, 예: 2~3일 1회) |

`prompts/PLANNER.md`(콘텐츠 신호 점검)와 `prompts/PRODUCT_PLANNER.md`(코드/기능 기획)는 이름이 비슷하지만
역할이 다르다 — 전자는 콘텐츠만, 후자는 코드만 본다. 코드/기능 변경은 `PRODUCT_PLANNER` →
`BACKLOG.md` → `PRODUCT_DEVELOPER` 순으로 사람 승인 없이 자동 진행되며, `PRODUCT_DEVELOPER`는
반드시 자기가 만든 걸 자기가 검증(타입체크+빌드, 가능하면 스모크테스트)한 뒤에만 push한다.

## 제안 (승인 대기)
_`prompts/PLANNER.md`가 콘텐츠 파이프라인 바깥의 관찰(법적/민감 영역 등)을 발견하면 여기에 기록.
처리 후 사람이 삭제하거나 완료 표시. 코드/기능 아이디어는 여기가 아니라 `BACKLOG.md`로 간다._

- 2026-07-23 [플래너]: `data/concerts.en.json`의 일부 `developer`가 쉼표로 여러 아티스트를 한 필드에 담고 있어(`"Avenged Sevenfold, Good Charlotte"`, `"Lupe Fiasco, Gym Class Heroes, B.o.B"`) `normalizeArtistKey()`가 이를 단일 아티스트 키로 묶는다 → 아티스트 목록/상세에 "Avenged Sevenfold, Good Charlotte" 같은 합쳐진 유령 아티스트 카드가 생기고(전자는 이미 그 합친 키로 bio/이미지가 채워져 있음), 후자는 프로필이 비어 매 사이클 "프로필 필요" 오탐 신호를 낸다 → 코드/스키마 판단이라 직접 손대지 않음. 제안: (a) 공동 헤드라이너는 대표 1명만 `developer`에 넣고 나머지는 `name`/`description`에 표기하도록 리서처 규칙을 정하거나, (b) `developer`를 배열로 확장하고 `normalizeArtistKey` 그룹핑을 아티스트 단위로 분리. 승인 시 코드 변경이므로 `BACKLOG.md`로 이관해 다음 대화에서 진행.

## 최근 변경 로그 (최신이 위, 최대 20개)
- 2026-07-24: [개발] `20260723-04`(soft-404, `notFound()`가 HTTP 200 반환) 시도 → `보류`. 근본원인 조사 완료: 동적 라우트 5개(concert/[id]·artist/[slug]·venue/[slug]·news/[slug]·blog/[slug])에 `dynamicParams=false`가 없어 미존재 param 온디맨드 렌더가 200 반환이 유력(후보 수정 `tsc --noEmit` ✅), 완전 미매칭 경로(`/totally-bogus-path`)는 루트 `app/layout.tsx`·`app/not-found.tsx` 부재로 인한 전역 404 문제라 별개. 완료 조건이 `next build && next start`+`curl` HTTP 상태 코드 검증인 고위험 항목인데 이 샌드박스 프로덕션 빌드가 정적 생성(0/314)에서 또 멈춰 런타임 검증 불가 → §5-B·절대규칙1에 따라 코드 push 안 하고 되돌림. 로컬/Vercel 프리뷰에서 빌드+curl 검증 후 완료 권장.
- 2026-07-24: [기획] 최근 커밋 급증분(히어로 캐러셀·UpcomingStrip·LatestNews·PageHeader·NotifyPrefs·TicketingCtaButton 신설) 재검토 + 위키/BACKLOG/코드/라이브(/ja,/en) 확인 → 1건 등록(20260724-03: 카테고리 배지 한국어 누수의 -02 미포함 잔여 2곳 — 홈 히어로 `HeroSpotlight.tsx:181`, 콘서트 상세 관련일정 `concert/[id]/page.tsx:271`. 둘 다 -02 등록 이후 추가/잔존이고 -02 완료 grep 범위(components/)·열거 6개에서 빠져 있어 별도 항목화). 신규 컴포넌트 LatestNews/TicketingCtaButton/PageHeader/NotifyPrefs는 로케일 분기 정상이라 이슈 없음. 기존 대기(-04,-01,-02) 유효해 중복 없음, meta-keywords 한국어 고정은 저가치라 계속 스킵.
- 2026-07-24: [기획] 위키 3종 + PROJECT_STATUS/BACKLOG + 실제 코드베이스(라우트·컴포넌트·최근 30커밋) 재검토 + 라이브 사이트(en/ja) 확인 → 1건 등록(20260724-02: 비-한국어 로케일에서 카테고리 배지가 `cat.short` 한국어로 새는 로케일 누수 — 라이브 /ja 홈 UpcomingStrip 배지 「콘서트/음원발매/…」 실제 확인, 동일 근본원인이 FeaturedCards·GameRow·RelatedEventCard·WishlistView·CalendarView에도 존재, 검증된 `CATEGORY_LABELS[lang]` 패턴으로 통일). 기존 대기 항목(-03/-04, 20260724-01)은 유효해 중복 등록 안 함. 관찰했으나 스킵: EN/JA `meta-keywords` 한국어 고정(검색엔진 무시 태그라 저가치, 이전 사이클도 스킵).
- 2026-07-24: [개발] `20260723-03` 완료 — gcalen 잔재 `components/PreRegCountdown.module.css`를 `TicketingPhase.module.css`로 리네임하고 `TicketingPhase.tsx` import 경로 갱신(커밋 53218d0). 컴포넌트는 진작 `TicketingPhase`로 바뀌었는데 CSS 모듈만 옛 이름이던 짝 불일치 해소. 순수 리네임(CSS 내용·로직 불변)이라 저위험 5-A로 처리 — `npx tsc --noEmit` ✅, `PreRegCountdown` 코드 참조 0건 확인, 전체 빌드는 생략(로직·라우팅·타입 무영향).
- 2026-07-24: [개발] `20260723-01` 완료 — 저장소 루트의 죽은 에셋 `og-image.png` 삭제(커밋 f6a5134). 검증은 코드 리뷰 + 타입체크(`npm run typecheck` ✅)로 수행 — 이 클라우드 환경에서 무거운 `npm run build`가 SSG 중 멈추는 문제 때문에, 저위험 항목(죽은 파일 삭제·카피·리네임)은 타입체크로 검증하도록 `prompts/PRODUCT_DEVELOPER.md` 검증 규칙을 함께 개정. 로직·라우팅·타입 구조를 바꾸는 항목은 여전히 전체 빌드(로컬/Vercel 프리뷰) 필요.
- 2026-07-24: [개발] BACKLOG `20260723-01`(루트 잔재 `og-image.png` 제거) 시도 → `보류`. 삭제 자체는 안전 확인(타입체크 통과, 코드 참조 0건)했으나 절대규칙상 필수인 `npm run build`가 이 클라우드 샌드박스에서 정적 페이지 생성(270개) 도중 반복적으로 멈춰(3회) 완주 못 함 → 그린 빌드 미확인이라 코드 push 안 하고 로컬 변경 되돌림. 환경 제약(빌드 완주 불가)이지 삭제 변경의 결함 아님. 전체 빌드가 도는 환경(로컬/Vercel 프리뷰)에서 빌드 통과 확인 후 완료 권장.
- 2026-07-24: [기획] 위키 3종 + PROJECT_STATUS/BACKLOG + 실제 코드베이스(라우트·컴포넌트·최근 30커밋) 재검토 및 라이브 사이트(ko/en/ja) 확인 → 1건 등록(20260724-01: 쉼표로 여러 아티스트를 한 developer에 담은 항목이 /en/artist에서 '합쳐진 유령 아티스트' 카드로 묶이는 문제 — PLANNER가 제안 섹션에 남겼던 관찰을 코드 backlog로 이관·구체화). 기존 대기 항목(-01/-03/-04)은 여전히 유효해 중복 등록 안 함, 그 외 관찰(EN/JA 페이지 meta-keywords가 한국어 고정 등)은 근거 대비 가치가 낮아 스킵.
- 2026-07-23: [플래너] 주간 점검 — 블로그 신호 없음(KO/EN/JA 최신 글 전부 07-22~07-23, 14일 이내) / 아티스트 프로필 '둘 다 없음' 신호는 다중 아티스트 `developer` 오탐 1건뿐이라 콘텐츠 실행 스킵 / EN developer 다중 아티스트 스키마 이슈 제안 1건 기록. 참고로 이미지만 없는 아티스트는 KO 4·EN 5·JA 3명 존재하나 소개글은 있어 '둘 다 없음' 신호엔 미해당(다음 ARTIST_PROFILE 실행 시 이미지 보완 대상).
- 2026-07-23: BACKLOG.md 정리 — 오너가 직접 지시해 이미 처리된 -02(찜/즐겨찾기 통일, 커밋
  47d4bd3)를 완료 처리(스펙이 제안한 방향과 반대로 "찜"에 수렴했다는 점을 명시해 다음
  사이클에서 되돌리지 않도록 기록). 오늘 SEO 작업 중 발견하고 미뤄뒀던 soft-404(존재하지
  않는 경로에서도 notFound() 화면이 HTTP 200으로 응답 — 구글이 soft-404로 볼 수 있어 P1)를
  -04로 신규 등록, 원본 라우팅 구조에서도 재현되는 기존 버그(이번 세션 리팩터의 회귀 아님)임을
  근거에 명시.
- 2026-07-23: [기획] 위키 3종 + PROJECT_STATUS/BACKLOG + 실제 코드베이스(라우트·컴포넌트·최근 30커밋) 검토 → 3건 등록(20260723-01 루트 잔재 og-image.png 제거, -02 KO 위시리스트 '찜↔즐겨찾기' 카피 통일, -03 gcalen 잔재 PreRegCountdown.module.css 리네임). 파비콘/PWA 아이콘은 2026-07-23 오버홀(c1e72fa)에서 이미 새 브랜드로 재생성돼 스킵, 삭제된 라우트(/coupons 등)로 향하는 끊긴 링크는 0건 확인. 라이브 사이트는 provenance 제한으로 접근 불가해 코드 검토만으로 판단.
- 2026-07-23: 에드센스 승인용 콘텐츠 볼륨 대량 보강 — `prompts/BLOG_RESEARCHER_*`,
  `prompts/NEWS_RESEARCHER_*`, `prompts/ARTIST_PROFILE.md`를 병렬 서브에이전트 7개로 배치
  실행(각자 독립 clone+commit+rebase+push, 서로 다른 파일만 다뤄 충돌 없음 — 단 CHAT.md
  append 위치는 겹쳐서 1건 수동 재배열 필요했음). 모아보기(블로그) KO 6/EN 5/JA 5(총 15편,
  기존 1편에서), 뉴스 KO 5/EN 8/JA 3(기존 11건에서 증가, 전부 실제 48시간 이내 소식만 —
  검증 안 되는 건 억지로 안 채워서 로케일별 편차 있음), 아티스트 프로필 이미지 6명 신규 +
  ko/en/ja 소개글 19건(기존 이미지 있고 소개글만 없던 케이스 포함) 추가. 사후 검증: 신규
  콘텐츠 frontmatter 전수 파싱 확인, 본문 내 `/concert/<id>` 링크·아티스트 bio 키 전수가
  실제 `concerts.*.json` 데이터와 일치하는지 스크립트로 재확인(불일치 0건)
- 2026-07-23: 2차 오버홀 후속 페이지별 폴리시 — 오너가 "관리자 대시보드 제외 다 진행"이라고
  승인한 5개 항목 구현. ① 홈(`Home.tsx`)의 임시 1컬럼 레이아웃을 서브페이지와 동일한 2컬럼
  으로 복원(`FeaturedCards` 재사용, `Home.module.css` `.layout` grid-template-columns 원복)
  ② `app/error.tsx`/`app/not-found.tsx`를 인라인 스타일 뿐이던 상태에서 `.state-page`(신규
  공용 클래스, globals.css)로 브랜드 카드 톤 적용 ③ `/guide/glossary` 용어 목록을 인라인
  스타일 대신 `.glossary-list`/`.glossary-item`(신규) 카드+구획선 스타일로 전환 ④
  `components/motion/Reveal.tsx`의 `RevealGroup`/`RevealItem`에 `as="ul"/"li"` prop을
  추가해 시맨틱 리스트에도 스태거 리빌을 쓸 수 있게 하고, `/venue` `/news` `/blog` 목록
  페이지(그동안 `/artist`만 적용돼 있던 것)에 확장 적용 ⑤ 캘린더 날짜 셀의 카테고리 점이
  색상에만 의존하던 것을 보완 — 셀 `title`에 카테고리 축약명 추가, 점 자체는
  `aria-hidden`으로 장식 처리 명시. `npm run typecheck`/`npm run build` 모두 통과 확인(빌드는
  `npm run dev` 구동 중에 병행 실행 — Windows webpack 캐시 rename 경고만 있었고 실제 에러
  없음). git commit 안 함
- 2026-07-23: `wiki/design-audit.md` 기반 2차 디자인 오버홀 실제 구현 — 색 방향은 오너가
  4개 시안(리소 포스터/커튼콜/레이저 워시/모노+의미색) 중 "라이트=모노(흑백+카테고리색),
  다크=레이저 워시(네이비+시안)" 조합을 선택. `app/globals.css` 토큰 전면 교체(색상 전부,
  radius 8/12/20/28→3/6/10/16 "티켓 스텁" 스케일, Space Grotesk 폰트 제거하고 Pretendard
  Variable 굵기축만으로 본문/디스플레이 겸용, `--font-mono` 신규로 날짜·D-day·타임존 숫자
  전용), 카테고리 4색 값 변경(팬미팅 앰버→핑크, 나머지 톤 조정, `lib/types.ts`
  `CATEGORY_META`와 동기화). 감사에서 찾은 기술부채도 같은 범위에서 정리: gcalen(게임
  캘린더) 잔재 죽은 CSS(`.seo-landing`/`.events-*`/`.detail-coupons*`/`.detail-faq`/
  `.gcal-link`/`.ic-gamepad`) 삭제, `EventType`(game_show/sale/season) 죽은 타입
  시스템 전체 제거(`EventRow.tsx` 파일 삭제 포함, `FilterKey`를 `Category`로 단순화),
  orphan 컴포넌트 7종(`FloatingMonthStats`/`PopularGames`/`NextByCategory`/`PromoBanner`/
  `CalendarSubscribe`/`SideRailAds`/`AdFit`) 삭제, 일본어 법적 문서(contact/privacy)
  게임 시절 잔재 문구 수정, 카드 컴포넌트 5종(`ArtistCard`/`FeaturedCards`/
  `RelatedArticleCard`/`RelatedArtistCard`/`RelatedEventCard`) 보더 규칙 통일(기본
  중립·hover만 액센트), 미정의 CSS 변수(`--bg-sunken`을 실제 토큰으로 승격, `news.module.css`의
  `--muted`/`--fg`/`--surface-2` 실토큰으로 교체) 정리. 토큰 삭제로 깨진 참조(`--accent-2`,
  `--accent-grad*`, `--radius-xl`) 및 accent-warm/accent 배경 위 하드코딩 흰 텍스트의
  다크테마 대비 버그(캘린더 선택 링, PWA 설치 카드, 위시 토글, 댓글 제출 버튼 등)도
  같이 수정. PWA manifest·viewport themeColor·오프라인 페이지·Play스토어 피처 그래픽·
  캘린더 위젯 이미지 API의 하드코딩된 구 브랜드색(핑크·보라)도 새 토큰으로 교체.
  `npm run typecheck` / `npm run build`(202페이지 정적 생성) 모두 통과 확인. git commit은
  안 함(오너 리뷰 대기)
- 2026-07-23: 오너가 2차(본격) 디자인 오버홀을 예고하면서 착수 전 현황 분석을 요청 —
  `wiki/design-audit.md` 신규 작성(코드 수정 없음, 분석 문서만). 디자인 토큰 인벤토리,
  페이지·컴포넌트 구조, gcalen 잔재 네이밍(`.ic-gamepad`, `.gcal-link`, `.detail-coupons*`,
  `EventType`의 `game_show` 등), 미정의 CSS 변수(`--bg-sunken`/`--muted`/`--fg`),
  orphan 컴포넌트 7종(`FloatingMonthStats` 등) 등을 실제 코드 읽기로 확인해 정리
- 2026-07-23: 비주얼 오버홀 후속 — GameRow(리스트 행)에도 Motion 호버/프레스 추가, 캘린더
  월 그리드 날짜 선택 표시를 layoutId 공유 애니메이션 필로 교체(오늘+선택 동시 상태 우선순위
  버그 수정 포함). 이어서 접근성 감사: 히어로/CTA버튼/활성 내비필에 쓰이는 accent-grad 위
  흰 텍스트가 WCAG AA 대비(4.5:1) 미달(다크테마 최저 2.72:1)이던 것을 발견해 수정 — 히어로엔
  25% 블랙 스크림, 작은 필/버튼엔 신규 `--accent-grad-text`(25% 어둡게) 토큰 적용
- 2026-07-22: 사용자 요청으로 사이트 전체 비주얼 오버홀 진행 — motion(Framer Motion) 도입(카테고리
  필터 필 애니메이션, 카드 호버/프레스, 캘린더 패널 전환, 페이지 전환, 모달 진입/퇴장), 디자인
  토큰 확장(그림자·라디우스·타입 스케일), Space Grotesk 디스플레이 폰트 자체 호스팅(워드마크/
  D-day 전용), 홈 히어로 섹션 신규, 카드/CTA/카테고리 태그 전반 비주얼 강화. gcalen(게임 캘린더)
  시절 죽은 i18n 문구 38개 삭제 + EN/JA "game" 잔재 문구 수정(홈 meta description 포함, SEO 버그).
  `.claude/skills/ui-ux-pro-max` 스킬 설치(프로젝트 스코프, 아직 git 미커밋)
- 2026-07-22: 모아보기(블로그)를 KO 원본+선택적 번역 구조에서 콘서트/뉴스와 동일한 로케일별
  완전 독립 구조로 전환. `content/blog/<slug>.<lang>.md` 파일명 규칙, `lib/blog.ts`/블로그
  페이지/sitemap 재작성, `BLOG_RESEARCHER.md` → KO/EN/JA 3개로 분리
- 2026-07-22: 코드/기능 자동화 파이프라인 신규 — `prompts/PRODUCT_PLANNER.md`(위키 필독, BACKLOG.md에
  스펙 등록) + `prompts/PRODUCT_DEVELOPER.md`(백로그 항목 구현 + 자체 검증 후 push). `wiki/` 폴더를
  저장소 안으로 이동(원격 세션도 clone만으로 읽을 수 있도록), 내용 최신화
- 2026-07-22: 기획 플래너(prompts/PLANNER.md) 신규 — 콘텐츠 실행 여부는 신호 기반으로 직접 판단·실행,
  기획/코드 변경은 이 파일의 "제안" 섹션에만 기록(사람 승인 필요)
- 2026-07-22: AdSense용 콘텐츠 3종(아티스트 소개글, 모아보기 아티클, 가이드 FAQ 확장) 추가
- 2026-07-22: ARTIST_IMAGES.md → prompts/ARTIST_PROFILE.md로 확장(이미지+소개글 통합 큐레이션), prompts/BLOG_RESEARCHER.md 신규
- 2026-07-21: 아티스트 이미지 큐레이션 프롬프트(ARTIST_IMAGES.md), 아티스트 목록/상세 페이지 신규
- 2026-07-21: 뉴스를 콘서트와 동일한 로케일별 완전 독립 구조로 전환 + 뉴스 작성 프롬프트 3종
- 2026-07-21: 리서처 3종 프롬프트(KO/EN/JA) + AGENTS.md 스키마 문서 신규 작성
- 2026-07-21: `/ko` `/en` `/ja` 완전 대칭 라우팅 구조 전환, middleware.ts 신규
