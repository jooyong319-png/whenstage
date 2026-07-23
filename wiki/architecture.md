# 아키텍처

## gcalen에서 그대로 재사용한 것
- Next.js 14 App Router SSG 구조, `app/(locale)/[lang]/...` 병렬 다국어 라우팅(ko/en/ja 완전 대칭)
- 캘린더/리스트 뷰(`CalendarView`, `ListView`, `GameRow`, `GameModal`)
- 헤더/푸터/언어 드롭다운/테마 토글/하단 탭바(모바일 웹+PWA 공용)
- 위시리스트("찜"), 조회수, 웹푸시 알림(Supabase 연동 — 2026-07-23 이 프로젝트 전용으로
  완전히 새로 구성 확인됨, 아래 "외부 서비스 연동 현황" 참고)
- `lib/i18nLabels.ts` 다국어 딕셔너리 패턴
- PWA 매니페스트, 서비스워커, 아이콘 스캐폴드

## gcalen에서 제거한 것
- 쿠폰/게임 허브: `lib/coupons.ts`, `lib/game-hub.ts`, `CouponList`,
  `/coupons`, `/games/[key]` — 회사와 마찰의 원인이라 의도적으로 배제(`decisions.md` 참고,
  **절대 되살리지 말 것**)
- 이벤트 오버레이(게임쇼/할인/시즌/무료배포): `lib/events.ts`, `/events`,
  `data/events.json` — 콘서트 도메인에 맞는 개념이 없어서 제거(카테고리
  자체로 4종을 이미 커버)
- 카테고리 랜딩 페이지(`/upcoming-games`, `/pre-registration` 등)와
  `SeoLanding`/`GameThumb` 컴포넌트
- `EventRow.tsx`, `EventType`(game_show/sale/season) 죽은 타입 시스템 — 2차 오버홀
  (2026-07-23)에서 전체 제거, `FilterKey`를 `Category`로 단순화
- Supabase `game_reactions`(좋아요/싫어요), `news_translations`(DeepL 온디맨드 번역 캐시)
  테이블 + 이를 참조하던 `GameReactions.tsx` — 2026-07-23 전량 제거(코드 어디서도 안 쓰던
  gcalen/구 번역-캐시 시절 잔재였음, 자세한 배경은 `decisions.md`)

## 이름은 같지만 의미가 바뀐 것
- `data/concerts.{ko,en,ja}.json` — 콘서트/발매/페스티벌/팬미팅 항목을 담는 파일
  (내부적으로 여전히 `games` 배열 필드명 사용, `lib/games.ts`가 읽음)
- `Game` 인터페이스 필드: `developer`→아티스트/기획사, `publisher`→주최,
  `platforms`→공연장, `genres`→태그, `presale*`/`general_sale*`→선예매/일반예매
- `/game/[id]` → `/concert/[id]`
- 카테고리: `mobile_kr/pc_console_kr/global_aaa/new_server` →
  `concert_tour/music_release/festival/fanmeeting`

## 라우트 구조 — 멀티 루트 레이아웃 (2026-07-23 SEO 작업으로 변경)
`<html lang>`을 서버에서부터 로케일별로 정확히 렌더링하기 위해(예전엔 `app/layout.tsx`
하나가 전부 감싸고 `lang="ko"`로 고정 렌더링한 뒤 클라이언트 스크립트로 EN/JA를 뒤늦게
패치하는 구조였음 — JS 미실행 크롤러/번역기엔 여전히 잘못된 값이 보이는 문제가 있었음)
Next.js의 "멀티 루트 레이아웃"(route group) 패턴으로 전환했다.

```
app/
├── (locale)/
│   └── [lang]/
│       ├── layout.tsx        ← <html lang={params.lang}>, 이 그룹의 진짜 루트
│       ├── not-found.tsx, error.tsx, loading.tsx   ← 라우트 그룹마다 따로 필요(그룹을 못 넘어감)
│       ├── page.tsx (홈=캘린더), template.tsx(모션 페이지 전환)
│       ├── concert/[id]        콘서트/발매 상세
│       ├── artist/, artist/[slug]   아티스트 목록/상세 (developer 필드 정규화 그룹핑)
│       ├── venue/, venue/[slug]     공연장 목록/상세 (platforms 필드 정규화 그룹핑)
│       ├── news/, news/[slug]       뉴스(로케일별 완전 독립)
│       ├── blog/, blog/[slug]       모아보기(로케일별 완전 독립)
│       ├── guide/, guide/glossary   이용 가이드 FAQ + 용어 사전
│       └── about/, contact/, privacy/, terms/, wishlist/
├── (app)/
│   ├── layout.tsx        ← <html lang="ko"> 고정, 로케일 없는 나머지 라우트 전용
│   ├── page.tsx           바닥 `/` 리다이렉트 안전망(noindex)
│   ├── not-found.tsx, error.tsx, loading.tsx, template.tsx
│   └── admin/              관리자 대시보드(비밀번호 게이트)
├── api/                    Route Handlers(레이아웃 영향 안 받음)
└── globals.css, manifest.ts, robots.ts, sitemap.ts, calendar.ics/
```

두 그룹 다 `<html>`을 독립적으로 렌더링해야 해서, 공통 크롬(헤더/푸터/아이콘 스프라이트 등)은
`components/AppShell.tsx`(body 내용)·`components/AppHead.tsx`(head 내용) 한 곳에서만 관리하고
두 그룹이 같이 가져다 쓴다 — 여기가 갈라지면 로케일 페이지랑 admin 화면이 서로 달라 보이는
사고가 나기 쉬우니 수정 시 항상 이 공유 컴포넌트를 통해서 할 것.

⚠️ **주의**: 라우트 그룹 특성상 `notFound()`/에러 경계가 그룹을 못 넘어간다 — `(locale)/[lang]/`
쪽에서 터지는 `notFound()`는 `(app)/not-found.tsx`가 못 잡는다. 그래서 두 그룹 다 각자
`not-found.tsx`/`error.tsx`/`loading.tsx`를 갖고 있다(내용은 동일, 위치만 다름). 새 전역
UI를 추가할 때도 이 원칙을 기억할 것.

사이드바(`PageShell`의 `sidebar` prop)는 상세 페이지 종류에 따라 맥락형 콘텐츠를
보여줌(같은 아티스트/공연장의 다른 일정, 관련 아티클/뉴스) — 없으면 기본 추천 위젯
(`FeaturedCards`)으로 폴백.

## 데이터/콘텐츠 파이프라인 아키텍처
| 담당 | 대상 | 로케일 독립성 |
|---|---|---|
| `prompts/RESEARCHER_KO/EN/JA.md` | `data/concerts.<locale>.json` | 완전 독립(번역 아님) |
| `prompts/NEWS_RESEARCHER_KO/EN/JA.md` | `content/news/*.<locale>.md` | 완전 독립(번역 아님) |
| `prompts/ARTIST_PROFILE.md` | `data/artist-images.json`, `artist-bios.json` | 이미지는 공용, 소개글은 로케일별 독립 |
| `prompts/BLOG_RESEARCHER_KO/EN/JA.md` | `content/blog/*.<locale>.md` | 완전 독립(번역 아님) |
| `prompts/PLANNER.md` | 위 콘텐츠 신호 점검 + 실행, 코드는 제안만 | — |
| `prompts/PRODUCT_PLANNER.md` / `prompts/PRODUCT_DEVELOPER.md` | 코드/기능/디자인, 콘텐츠는 안 건드림 | — |

콘서트 id는 항상 로케일 접두사(`ko-`/`en-`/`ja-`)가 붙는다(리서처 프롬프트 규칙) — 검색
별칭 매칭(`data/artist-aliases.json`)이나 알림 발송(`app/api/cron/notify`)이 이 규칙에
의존하므로 리서처 프롬프트를 고칠 때 이 접두사 규칙은 절대 깨지 않을 것.

## 사용자 제보/수정 신청 파이프라인 (2026-07-23 신규)
콘서트 상세("예매 링크 제보/수정")·아티스트 상세("정보 수정·등록 제보")에 사용자가 직접
제보를 남길 수 있다. Supabase `data_reports` 테이블에 쌓이고, `/admin` 대시보드의
"제보함" 섹션에서 검토(승인/거부 — 상태만 바뀜). **실제 데이터 반영은 자동이 아니다** —
사이트가 SSG+git 커밋 기반이라 관리자가 승인된 제보 내용을 보고 `data/concerts.*.json`이나
`data/artist-*.json`을 수동으로(또는 리서처 프롬프트 재실행으로) 고쳐야 반영된다. 관련 파일:
`lib/reports.ts`, `components/ReportForm.tsx`, `supabase/data_reports.sql`.

## 외부 서비스 연동 현황 (2026-07-23 확인 완료)
- **Supabase**: 이 프로젝트 전용 프로젝트로 확인됨(gcalen과 분리 완료). 현재 실사용 중인
  테이블: `page_views`(조회수), `push_subscriptions`/`push_sent_log`(웹푸시), `data_reports`
  (사용자 제보). 스키마는 `supabase/*.sql`이 소스 오브 트루스 — 테이블 추가/변경 시 반드시
  이 폴더에 SQL 파일로 같이 남길 것(실제 DB 반영은 사람이 Supabase SQL Editor에서 수동 실행).
- **Vercel**: 배포 연결 확인됨, `vercel.json`에 `/api/cron/notify` 매일 1회 cron 등록됨.
  필요 환경변수(`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`,
  `VAPID_SUBJECT`, `CRON_SECRET`) 전부 등록 완료, 실제 발송 테스트까지 성공 확인.
  ⚠️ `NEXT_PUBLIC_*` 변수를 Vercel에서 "Sensitive"로 체크하면 빌드 타임에 값을 못 읽어와서
  빈 값으로 굳어버리는 이슈를 실전에서 겪음 — `NEXT_PUBLIC_` 접두사 변수는 Sensitive 체크
  해제할 것(서버 전용 변수는 Sensitive 체크해도 무방, runtime에만 읽으므로 문제없음).
- **Google Search Console**: 속성 등록 + HTML 파일 인증(`public/google*.html`) 완료,
  sitemap.xml 제출 완료.

## 알려진 이슈 / 백로그
`BACKLOG.md`가 실제 소스 오브 트루스. 2026-07-23 기준 대기 중:
- `-01` 저장소 루트 잔재 `og-image.png`(gcalen 스캐폴드) 제거
- `-03` `PreRegCountdown.module.css` → `TicketingPhase.module.css` 리네임(컴포넌트명과 불일치)
- `-04` **soft-404**(P1) — 존재하지 않는 페이지에서 `notFound()` 화면은 정상 렌더되는데
  HTTP 상태 코드가 200으로 나가는 문제(구글 soft-404 판정 위험). 2026-07-23 멀티 루트
  레이아웃 전환 전 원본 구조에서도 재현 확인된 기존 버그(이번 리팩터의 회귀 아님).
