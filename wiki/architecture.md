# 아키텍처

## gcalen에서 그대로 재사용한 것
- Next.js 14 App Router SSG 구조, `app/[lang]/...` 병렬 다국어 라우팅(ko/en/ja 완전 대칭)
- 캘린더/리스트 뷰(`CalendarView`, `ListView`, `GameRow`, `GameModal`, `EventRow`)
- 헤더/푸터/언어 드롭다운/테마 토글/하단 탭바(모바일 웹+PWA 공용)
- 위시리스트, 댓글, 조회수, 웹푸시 알림(Supabase 연동 — 단, 새 프로젝트로 분리됐는지는
  `todo.md` 참고, 확인 필요)
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

## 이름은 같지만 의미가 바뀐 것
- `data/concerts.{ko,en,ja}.json` — 콘서트/발매/페스티벌/팬미팅 항목을 담는 파일
  (내부적으로 여전히 `games` 배열 필드명 사용, `lib/games.ts`가 읽음)
- `Game` 인터페이스 필드: `developer`→아티스트/기획사, `publisher`→주최,
  `platforms`→공연장, `genres`→태그, `presale*`/`general_sale*`→선예매/일반예매
- `/game/[id]` → `/concert/[id]`
- 카테고리: `mobile_kr/pc_console_kr/global_aaa/new_server` →
  `concert_tour/music_release/festival/fanmeeting`

## 현재 라우트 구조 (2026-07-22 기준)
```
app/[lang]/
├── (홈=캘린더)          page.tsx
├── concert/[id]         콘서트/발매 상세
├── artist/, artist/[slug]   아티스트 목록/상세 (developer 필드 정규화 그룹핑)
├── venue/, venue/[slug]     공연장 목록/상세 (platforms 필드 정규화 그룹핑)
├── news/, news/[slug]       뉴스(로케일별 완전 독립)
├── blog/, blog/[slug]       모아보기(KO 원본 + 선택적 EN/JA 번역)
├── guide/, guide/glossary   이용 가이드 FAQ + 용어 사전
├── about/, contact/, privacy/, terms/, wishlist/
```
사이드바(`PageShell`의 `sidebar` prop)는 상세 페이지 종류에 따라 맥락형 콘텐츠를
보여줌(같은 아티스트/공연장의 다른 일정, 관련 아티클/뉴스) — 없으면 기본 추천 위젯
(`FeaturedCards`)으로 폴백.

## 데이터/콘텐츠 파이프라인 아키텍처
| 담당 | 대상 | 로케일 독립성 |
|---|---|---|
| `prompts/RESEARCHER_KO/EN/JA.md` | `data/concerts.<locale>.json` | 완전 독립(번역 아님) |
| `prompts/NEWS_RESEARCHER_KO/EN/JA.md` | `content/news/*.<locale>.md` | 완전 독립(번역 아님) |
| `prompts/ARTIST_PROFILE.md` | `data/artist-images.json`, `artist-bios.json` | 이미지는 공용, 소개글은 로케일별 독립 |
| `prompts/BLOG_RESEARCHER.md` | `content/blog/*.md` | KO 원본 + 선택적 번역(예외적으로 번역 구조) |
| `prompts/PLANNER.md` | 위 콘텐츠 신호 점검 + 실행, 코드는 제안만 | — |
| `prompts/PRODUCT_PLANNER.md` / `prompts/PRODUCT_DEVELOPER.md` | 코드/기능/디자인, 콘텐츠는 안 건드림 | — |

## 기술 부채 현황 (2026-07-22 갱신)
- ✅ about/guide/contact/privacy/terms, 블로그·뉴스 안내 문구 — "게임"→콘서트 도메인 카피 정리 완료
- ✅ 리서처 프롬프트(`RESEARCHER_*.md`)·`AGENTS.md` — 콘서트 도메인용으로 재작성 완료
- ✅ `data/concerts.*.json` — placeholder 제거, 실 데이터로 교체 완료(리서처가 지속 갱신 중)
- ⚠️ Supabase 프로젝트가 gcalen 것과 분리됐는지 미확인 — `.env.local`이 로컬에 없어서 이
  세션에서는 확인 불가. 댓글/조회수/푸시 관련 작업 전에 반드시 먼저 확인할 것
- ⚠️ Vercel 배포 연결 상태 미확인(사용자가 대시보드에서 직접 처리하는 영역)
- 사이트 아이콘: `public/favicon.svg`, `public/icons/*` 존재 — gcalen 시절 아이콘인지
  이번 프로젝트용으로 새로 만든 건지는 재확인 필요(이번 세션에서 파비콘 자체를 새로
  디자인한 기록은 없음)
